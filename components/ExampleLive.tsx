'use client';

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import { Editor } from 'react-live';
import { Redo2, RotateCcw, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { codeTheme } from '../lib/codeTheme';
import type { CodeMode, ExampleMeta, Prose } from '../lib/types';
import * as elicit from '@elicit';
import { createElicitScope } from '../lib/elicitScope';
import { chartThemeFor, currentChartMode, useChartMode } from '../lib/chartTheme';
import { useSpecMode } from '../lib/specMode';
import { SpecTabs } from './SpecTabs';
import { FoldedCode } from './FoldedCode';
import { findBlocks, findFolds } from '../lib/folds';
import { formatJson, functionsSource, type JsonBlock, type JsonView } from '../lib/jsonSpec';

const EVAL_DEBOUNCE_MS = 280;
/** Keystrokes closer together than this undo as one step. */
const HISTORY_COALESCE_MS = 700;
const HISTORY_LIMIT = 200;

/** The code's edit history: every version, and which one is showing. */
type History = { stack: string[]; at: number; last: number };

/** A change to the code made from outside the editor: undo, redo or reset. */
type ExternalEdit = { text: string; caret: number };

/** Where the caret goes after `prev` becomes `next`: the end of what changed. */
function changeEnd(prev: string, next: string): number {
  let suffix = 0;
  const max = Math.min(prev.length, next.length);
  while (suffix < max && prev[prev.length - 1 - suffix] === next[next.length - 1 - suffix]) suffix++;
  let prefix = 0;
  while (prefix < max - suffix && prev[prefix] === next[prefix]) prefix++;
  return Math.max(prefix, next.length - suffix);
}

const EDITOR_STYLE_BASE: CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12.5,
};

function esc(c: string) {
  return c.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function fmtValue(v: unknown): string {
  if (v == null) return `<span class="key">${v}</span>`;
  if (typeof v === 'number') {
    return `<span class="num">${Number.isInteger(v) ? v : v.toFixed(2)}</span>`;
  }
  if (v instanceof Date) {
    return `<span class="str">${v.toISOString().slice(0, 10)}</span>`;
  }
  if (typeof v === 'string') return `<span class="str">"${esc(v)}"</span>`;
  return `<span class="num">${esc(JSON.stringify(v))}</span>`;
}

function fmtRow(d: Record<string, unknown>, i: number, pad: number) {
  return (
    `<span class="idx">${String(i).padStart(pad, ' ')}</span>  { ` +
    Object.entries(d)
      .map(([k, v]) => `<span class="key">${esc(k)}:</span> ${fmtValue(v)}`)
      .join(', ') +
    ' }'
  );
}

type Rows = Record<string, unknown>[];
type ElicitData = Rows | Record<string, Rows>;

/** What `Elicit(spec)` and `dataset.chart(spec)` return: a chart, whose node is `dom()`. */
type ElicitChart = {
  dom: () => HTMLElement;
  getData: () => ElicitData;
  on: (ev: string, cb: () => void) => () => void;
  destroy: () => void;
};

const isChart = (x: unknown): x is ElicitChart =>
  x != null && typeof x === 'object' && typeof (x as ElicitChart).dom === 'function';

/**
 * `getData()` is shaped like the spec's `data`: a bare array for a single-table
 * chart, one array per table name for a multi-table structure (see marks/network).
 * Normalise both to named groups; a single-table chart's group has no name, so it
 * renders exactly as it always has.
 */
function dataGroups(data: ElicitData): { name: string | null; rows: Rows }[] {
  if (Array.isArray(data)) return [{ name: null, rows: data }];
  return Object.entries(data ?? {}).map(([name, rows]) => ({
    name,
    rows: Array.isArray(rows) ? rows : [],
  }));
}

function fmtGroup(group: { name: string | null; rows: Rows }) {
  const pad = String(Math.max(group.rows.length - 1, 0)).length;
  const body = group.rows.length
    ? group.rows.map((d, i) => fmtRow(d, i, pad)).join('\n')
    : '<span class="empty">no rows</span>';
  return group.name === null
    ? body
    : `<span class="tbl">${esc(group.name)}</span>\n${body}`;
}

function DataPanel({ chart }: { chart: ElicitChart | null }) {
  const [html, setHtml] = useState('<span class="empty">no rows</span>');
  const [count, setCount] = useState('0 rows');

  useEffect(() => {
    if (!chart) return;
    const render = () => {
      try {
        const groups = dataGroups(chart.getData());
        setCount(
          groups.length === 1 && groups[0].name === null
            ? groups[0].rows.length === 1
              ? '1 row'
              : `${groups[0].rows.length} rows`
            : groups.map((g) => `${g.name} ${g.rows.length}`).join(' · ')
        );
        setHtml(groups.map(fmtGroup).join('\n\n'));
      } catch {
        setHtml('<span class="empty">unavailable</span>');
      }
    };
    const unsub = chart.on('change', render);
    render();
    return unsub;
  }, [chart]);

  if (!chart) return null;
  return (
    <div className="data">
      <div className="data-head">
        <span>getData()</span>
        <span className="data-count">{count}</span>
      </div>
      <pre className="data-body" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

function destroyAll(charts: ElicitChart[]) {
  for (const c of charts) c.destroy();
}

/**
 * `Try: …` affordance over a chart. The hint is JSX so it keeps its own markup
 * — `.try b` in docs.css colours a <b> specifically.
 */
function TryHint({ hint }: { hint: Prose }) {
  return <span className="try">Try: {hint}</span>;
}

function formatEvalError(err: unknown): string {
  if (err instanceof SyntaxError) return `Syntax error: ${err.message}`;
  if (err instanceof Error) return err.message;
  return String(err);
}

/** Coerce imported chart body to a plain string; strip dev HMR preamble/suffix if present. */
function normalizeExampleCode(code: unknown): string {
  const raw =
    typeof code === 'string'
      ? code
      : code != null &&
          typeof code === 'object' &&
          'default' in code &&
          typeof (code as { default: unknown }).default === 'string'
        ? (code as { default: string }).default
        : String(code ?? '');

  if (!raw.includes('import.meta') && !raw.includes('__webpack')) return raw;

  // Dev bundles sometimes wrap the chart body in a hot-reload IIFE — keep only the harness script.
  const cut =
    raw.search(/\n\s*import\.meta\b/) >= 0
      ? raw.search(/\n\s*import\.meta\b/)
      : raw.search(/\n\s*__webpack/) >= 0
        ? raw.search(/\n\s*__webpack/)
        : raw.search(/\$RefreshHelpers\$/) >= 0
          ? raw.search(/\$RefreshHelpers\$/)
          : -1;
  if (cut >= 0) return raw.slice(0, cut).trimEnd();

  const mountIdx = raw.search(/\bmount\s*\(/);
  if (mountIdx > 0) return raw.slice(mountIdx).trimEnd();

  return raw;
}

/** The editor's <pre>, as react-live draws it, so the folded view lines up with it. */
const EDITOR_PRE_STYLE: CSSProperties = { margin: 0, outline: 'none', padding: 10, fontFamily: 'inherit' };

/** Put the caret `offset` characters into an editable element. */
function placeCaret(root: HTMLElement, offset: number) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let left = offset;
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const length = node.textContent?.length ?? 0;
    if (left <= length) {
      const range = document.createRange();
      range.setStart(node, left);
      range.collapse(true);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);
      return;
    }
    left -= length;
  }
}

/**
 * Opening the editor unfolds the data rows, so the line that was clicked can
 * move. Scroll it back under the pointer: first within the code panel, if it
 * scrolls, then the page for whatever is left.
 */
function keepUnderPointer(pre: HTMLElement, clientY: number | null) {
  const selection = window.getSelection();
  if (clientY == null || !selection || selection.rangeCount === 0) return;
  let rect = selection.getRangeAt(0).getBoundingClientRect();
  // A caret on an empty line has no box; measure its line instead.
  if (rect.height === 0) {
    const node = selection.anchorNode;
    const el = node instanceof Element ? node : node?.parentElement;
    if (!el) return;
    rect = el.getBoundingClientRect();
  }
  let delta = rect.top + rect.height / 2 - clientY;
  if (Math.abs(delta) < 2) return;
  const panel = pre.closest<HTMLElement>('.code-wrap');
  if (panel && panel.scrollHeight > panel.clientHeight) {
    const before = panel.scrollTop;
    panel.scrollTop = before + delta;
    delta -= panel.scrollTop - before;
  }
  if (Math.abs(delta) >= 2) window.scrollBy(0, delta);
}

/**
 * Isolated from chart/error state so parent re-renders (after debounce eval)
 * do not remount the editor and jump the caret.
 *
 * Code with `data` rows shows them folded until the reader clicks into it; the
 * editor then opens at that spot, and folds again when it loses focus.
 */
const CodePane = memo(function CodePane({
  source,
  external,
  onDraftChange,
  onUndo,
  onRedo,
}: {
  /** The code when the pane mounts. A new preset remounts it (key on parent). */
  source: string;
  /** Undo, redo and reset write the code here, keeping the editor open. */
  external: ExternalEdit | null;
  onDraftChange: (value: string) => void;
  onUndo: () => void;
  onRedo: () => void;
}) {
  const [value, setValue] = useState(source);
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const [closed, setClosed] = useState<Set<number>>(() => new Set());
  const caret = useRef(0);
  const clickY = useRef<number | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const folds = useMemo(() => findFolds(value).length > 0 || findBlocks(value).length > 0, [value]);

  useEffect(() => {
    if (!external) return;
    setValue(external.text);
    // If the reader is typing, the caret lands at the end of what changed,
    // after the editor has redrawn the new text.
    const id = window.setTimeout(() => {
      const pre = wrap.current?.querySelector('pre');
      if (pre && document.activeElement === pre) placeCaret(pre, external.caret);
    });
    return () => window.clearTimeout(id);
  }, [external]);

  // ⌘Z / Ctrl+Z, ⇧⌘Z / Ctrl+Y go to the example's own history, which the
  // toolbar buttons share, instead of the editor's.
  const onKeyDownCapture = (e: KeyboardEvent) => {
    if (!(e.metaKey || e.ctrlKey) || e.altKey) return;
    const key = e.key.toLowerCase();
    const redo = (key === 'z' && e.shiftKey) || (key === 'y' && e.ctrlKey && !e.shiftKey);
    if (key !== 'z' && !redo) return;
    e.preventDefault();
    e.stopPropagation();
    if (redo) onRedo();
    else onUndo();
  };

  // use-editable (inside react-live's Editor) lists `ref.current` among its
  // effect deps, and reads it during render, when the <pre> does not exist yet.
  // So the Editor's first re-render looks like a new element: the hook tears
  // itself down, which drops contentEditable and with it the focus, and sets
  // up again without refocusing. Left alone, that first re-render is the
  // reader's first keystroke, which lands nowhere. Re-render once as soon as
  // the Editor mounts, before anyone types and before it takes focus below.
  const [settled, settleEditor] = useReducer((n: number) => n + 1, 0);
  useEffect(() => {
    settleEditor();
  }, [editing]);

  // Focus on the settling render, not the one that mounted the Editor: the
  // Editor's own effects run before this one, so its teardown is already done.
  useEffect(() => {
    const pre = editing ? wrap.current?.querySelector('pre') : null;
    if (!pre) return;
    // After the click that opened it has finished with the view it replaced.
    const id = window.setTimeout(() => {
      // focus() would scroll the editor into view on its own; the code below
      // decides the scroll instead.
      pre.focus({ preventScroll: true });
      placeCaret(pre, caret.current);
      keepUnderPointer(pre, clickY.current);
    });
    return () => window.clearTimeout(id);
    // `settled`, not `editing`: see above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settled]);

  if (folds && !editing) {
    return (
      <div
        className="live-editor"
        style={EDITOR_STYLE_BASE}
        onKeyDownCapture={onKeyDownCapture}
        onPointerDown={(e) => {
          clickY.current = e.clientY;
        }}
      >
        <FoldedCode
          code={value}
          language="jsx"
          style={EDITOR_PRE_STYLE}
          open={open}
          onOpenChange={setOpen}
          closed={closed}
          onClosedChange={setClosed}
          onPick={(offset) => {
            caret.current = offset;
            setEditing(true);
          }}
        />
      </div>
    );
  }
  return (
    <div
      ref={wrap}
      className="live-editor-wrap"
      onKeyDownCapture={onKeyDownCapture}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setEditing(false);
      }}
    >
      <Editor
        className="live-editor"
        code={value}
        language="jsx"
        theme={codeTheme}
        onChange={(next) => {
          setValue(next);
          onDraftChange(next);
        }}
        style={EDITOR_STYLE_BASE}
      />
    </div>
  );
});

const ReadOnlyCode = memo(function ReadOnlyCode({
  code,
  language = 'jsx',
}: {
  code: string;
  language?: 'jsx' | 'json';
}) {
  return <FoldedCode code={code.trimEnd()} language={language} className="readonly-code" />;
});

/** A spec that cannot be written as JSON, as the recorder reports it. */
const NO_JSON_FORM = '[elicit] recorder: ';

/** An example's JSON spec: each spec it passed to the library, then its functions. */
const JsonPane = memo(function JsonPane({ view }: { view: JsonView }) {
  return (
    <div className="json-pane">
      {view.blocks.map((block, i) => (
        <div key={i} className="json-block">
          <div className="json-call">{block.call}</div>
          <ReadOnlyCode code={block.text} language="json" />
        </div>
      ))}
      {view.functions ? (
        <div className="json-block">
          <div className="json-call">The functions it names</div>
          <ReadOnlyCode code={view.functions} />
        </div>
      ) : null}
    </div>
  );
});

type Props = {
  code: string;
  meta: ExampleMeta;
  /** Wider editor (playground). */
  tall?: boolean;
  /** How to present the source. Default: editable. */
  codeMode?: CodeMode;
};

/**
 * Live example: harness-style `mount(chart.dom())` eval with chart + getData panel.
 * `mount` takes a DOM node; the first chart mounted feeds the panel.
 * `codeMode` controls whether source is editable, always-visible read-only, or
 * collapsed behind a toggle (intro gallery).
 */
export function ExampleLive({
  code: initialCode,
  meta,
  tall,
  codeMode = 'editable',
}: Props) {
  const baseCode = useMemo(() => normalizeExampleCode(initialCode), [initialCode]);
  const [evalCode, setEvalCode] = useState(baseCode);
  const [editorKey, setEditorKey] = useState(0);
  // Bumped by Reset, so it redraws the chart even when the code is unchanged.
  const [rerun, setRerun] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [elicited, setElicited] = useState<ElicitChart | null>(null);
  const [fluid, setFluid] = useState(false);
  const [resultWidth, setResultWidth] = useState<string | undefined>();
  const [codeOpen, setCodeOpen] = useState(codeMode === 'readonly');
  const chartRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<ElicitChart[]>([]);
  const debounceRef = useRef<number | null>(null);
  const scope = useMemo(() => createElicitScope(), []);
  // Charts follow the docs' light/dark mode: a mode switch re-runs the example.
  const chartMode = useChartMode();
  // In JSON mode the chart is built from the example's JSON spec, not its JavaScript.
  const specMode = useSpecMode();
  const [jsonView, setJsonView] = useState<JsonView | null>(null);

  const isEditable = codeMode === 'editable';
  const isVisual = codeMode === 'collapsed' || codeMode === 'readonly';
  const showCode = isEditable || codeMode === 'readonly' || codeOpen;

  // Undo / redo. The history lives here, not in the editor, so the toolbar
  // buttons and the keyboard share it, and it survives the editor folding
  // its data rows on blur.
  const history = useRef<History>({ stack: [baseCode], at: 0, last: 0 });
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [external, setExternal] = useState<ExternalEdit | null>(null);
  const syncHistory = useCallback(() => {
    const h = history.current;
    setCanUndo(h.at > 0);
    setCanRedo(h.at < h.stack.length - 1);
  }, []);
  const current = history.current.stack[history.current.at];

  useEffect(() => {
    history.current = { stack: [baseCode], at: 0, last: 0 };
    syncHistory();
    setEvalCode(baseCode);
    setEditorKey((k) => k + 1);
  }, [baseCode, syncHistory]);

  // Keep the code-open state tied to `codeMode` alone. A reactive parent (the
  // Build dashboard) feeds a fresh `code` on every form change; folding this
  // into the effect above would slam the "Show code" panel shut mid-edit.
  useEffect(() => {
    setCodeOpen(codeMode === 'readonly');
  }, [codeMode]);

  const onDraftChange = useCallback(
    (value: string) => {
      const h = history.current;
      // The editor echoes text written into it from outside; that is no edit.
      if (value === h.stack[h.at]) return;
      const now = Date.now();
      h.stack.length = h.at + 1;
      if (h.at > 0 && now - h.last < HISTORY_COALESCE_MS) {
        h.stack[h.at] = value;
      } else {
        h.stack.push(value);
        h.at += 1;
        if (h.stack.length > HISTORY_LIMIT) {
          h.stack.shift();
          h.at -= 1;
        }
      }
      h.last = now;
      syncHistory();

      if (debounceRef.current != null) window.clearTimeout(debounceRef.current);
      debounceRef.current = window.setTimeout(() => {
        setEvalCode(value);
        debounceRef.current = null;
      }, EVAL_DEBOUNCE_MS);
    },
    [syncHistory]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current != null) window.clearTimeout(debounceRef.current);
    };
  }, []);

  /** Show version `at` of the history in the editor, and run it now. */
  const goTo = useCallback(
    (at: number) => {
      const h = history.current;
      if (at < 0 || at >= h.stack.length || at === h.at) return;
      const prev = h.stack[h.at];
      const next = h.stack[at];
      h.at = at;
      // The next keystroke starts a new step instead of joining this one.
      h.last = 0;
      syncHistory();
      if (debounceRef.current != null) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
      setExternal({ text: next, caret: changeEnd(prev, next) });
      setEvalCode(next);
    },
    [syncHistory]
  );
  const undo = useCallback(() => goTo(history.current.at - 1), [goTo]);
  const redo = useCallback(() => goTo(history.current.at + 1), [goTo]);

  // Reset is one more step, so Undo brings the reader's edits back.
  // Reset also redraws the chart, clearing what the reader did on it.
  const reset = useCallback(() => {
    const h = history.current;
    if (h.stack[h.at] !== baseCode) {
      h.stack.length = h.at + 1;
      h.stack.push(baseCode);
      goTo(h.stack.length - 1);
    }
    setRerun((n) => n + 1);
  }, [baseCode, goTo]);

  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    let cancelled = false;

    destroyAll(activeRef.current);
    activeRef.current = [];
    chart.replaceChildren();
    setElicited(null);
    setFluid(false);
    setResultWidth(undefined);

    /**
     * Run the example. With `asJson`, its namespaces record each factory call,
     * and every spec it hands to the library is written as JSON and compiled
     * back, so the chart on screen is the one the JSON describes.
     */
    const run = (asJson: boolean) => {
      // Every chart the example builds is recorded here, through `Elicit` and
      // `ds.chart`, so a re-run destroys it. Its node carries it as `__chart`, so
      // browser checks can reach the chart.
      const created: ElicitChart[] = [];
      const mounted: ElicitChart[] = [];
      const blocks: JsonBlock[] = [];
      const functions: Record<string, Function> = {};
      const rec = asJson ? elicit.recorder() : null;
      const names = rec ? createElicitScope(rec) : scope;

      // An example may compile a JSON spec itself; that JSON is then the one shown.
      const compiledHere = new WeakMap<object, { json: unknown; functions: Record<string, Function> }>();
      const compile: typeof elicit.compile = (json, options) => {
        const spec = elicit.compile(json, options);
        compiledHere.set(spec, { json, functions: options?.functions ?? {} });
        return spec;
      };

      /** The spec the library is given: as written, or compiled from its JSON. */
      const specOf = (spec: unknown, call: string): unknown => {
        if (!rec) return spec;
        const own = compiledHere.get(spec as object);
        if (own) {
          blocks.push({ call, text: formatJson(own.json) });
          Object.assign(functions, own.functions);
          return spec;
        }
        const recorded = rec.toJSON(spec as object);
        // Through text and back, so nothing but JSON reaches `compile`.
        const json = JSON.parse(JSON.stringify(recorded.json));
        blocks.push({ call, text: formatJson(json) });
        Object.assign(functions, recorded.functions);
        return elicit.compile(json, { functions: recorded.functions });
      };
      // A function the spec keeps may call a factory while the chart is built.
      const building = <T,>(fn: () => T): T => (rec ? rec.live(fn) : fn());

      const patched = new WeakSet<object>();
      type Ds = { chart: (spec: unknown) => ElicitChart };
      const track = (c: ElicitChart) => {
        (c.dom() as HTMLElement & { __chart?: ElicitChart }).__chart = c;
        created.push(c);
        patch((c as unknown as { dataset?: Ds }).dataset);
        return c;
      };
      const patch = (ds: Ds | undefined) => {
        if (!ds || patched.has(ds)) return;
        patched.add(ds);
        const make = ds.chart;
        ds.chart = (spec) => track(building(() => make(specOf(spec, 'dataset.chart(compile(json))'))));
      };
      const RealElicit = scope.Elicit as unknown as ((spec: unknown) => ElicitChart) & {
        dataset: (spec: unknown) => Ds;
      };
      const Elicit = Object.assign(
        (spec: unknown) => track(building(() => RealElicit(specOf(spec, 'Elicit(compile(json))')))),
        RealElicit,
        {
          dataset: (spec: unknown) => {
            const ds = building(() => RealElicit.dataset(specOf(spec, 'Elicit.dataset(compile(json))')));
            patch(ds);
            return ds;
          },
        },
      );

      // `mount` appends a node, like `parent.append`. A chart is mounted as
      // `chart.dom()`; the first one mounted feeds the data panel.
      const mount = <T,>(node: T): T => {
        if (isChart(node)) {
          throw new Error('mount() takes a DOM node. Pass chart.dom().');
        }
        chart.appendChild(node as unknown as Node);
        const owner = created.find((c) => c.dom() === (node as unknown));
        if (owner) mounted.push(owner);
        return node;
      };

      try {
        // The app-wide chart theme for the docs' current mode. Read from the DOM,
        // not `chartMode`, so the first render after hydration is already right.
        // Set on every eval, so an example that calls `setTheme()` never leaks.
        scope.setTheme(chartThemeFor(currentChartMode()) as Parameters<typeof scope.setTheme>[0]);
        const keys = Object.keys(names);
        const vals = keys.map((n) =>
          n === 'Elicit' ? Elicit : n === 'compile' ? compile : names[n as keyof typeof names],
        );
        // eslint-disable-next-line no-new-func
        const body = new Function(...keys, 'mount', evalCode);
        body(...vals, mount);
      } catch (err) {
        destroyAll(created);
        chart.replaceChildren();
        throw err;
      }
      // What the example does from here on (a click handler, a timer) is not the spec.
      if (rec) rec.stop();
      return { created, mounted, blocks, functions };
    };

    try {
      let ran;
      let unavailable: string | null = null;
      try {
        ran = run(specMode === 'json');
      } catch (err) {
        const message = err instanceof Error ? err.message : '';
        if (specMode !== 'json' || !message.startsWith(NO_JSON_FORM)) throw err;
        // No JSON form: say why, and draw the example from its JavaScript.
        unavailable = message.slice(NO_JSON_FORM.length);
        ran = run(false);
      }
      const { created, mounted } = ran;
      if (cancelled) {
        destroyAll(created);
        chart.replaceChildren();
        return;
      }
      activeRef.current = created;
      const first = mounted[0] ?? null;
      setError(null);
      setElicited(first);
      setJsonView(
        specMode === 'json'
          ? { blocks: ran.blocks, functions: functionsSource(ran.functions), unavailable }
          : null,
      );
      if (first) {
        const width = first.dom().style.width;
        if (width && width.endsWith('px')) {
          setResultWidth(width);
        } else {
          setFluid(true);
        }
      }
    } catch (err) {
      if (cancelled) return;
      chart.replaceChildren();
      activeRef.current = [];
      setElicited(null);
      setJsonView(null);
      setError(formatEvalError(err));
    }

    return () => {
      cancelled = true;
      destroyAll(activeRef.current);
      activeRef.current = [];
    };
  }, [evalCode, scope, chartMode, specMode, rerun]);

  // The JSON for this example, when the site shows JSON and the example has one.
  const json = specMode === 'json' && jsonView && !jsonView.unavailable && jsonView.blocks.length ? jsonView : null;
  const noJson = specMode === 'json' && jsonView ? jsonView.unavailable : null;

  const cardClass = [
    'card',
    tall ? 'card-tall' : '',
    isVisual ? 'card-visual' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const hint = !error && meta.try ? <TryHint hint={meta.try} /> : null;
  const errorBox = error ? <pre className="live-error">⚠ {error}</pre> : null;
  const resultClass = `result${fluid ? ' fluid' : ''}`;
  const resultStyle = resultWidth ? { width: resultWidth } : undefined;

  // The toolbar sits over the code, but comes after the chart in the DOM: the
  // library's browser gate takes a section's FIRST <svg> to be the chart's, and
  // the first button named "Undo" on /editing/history to be the example's own.
  const toolbar = (
    <div className="ex-toolbar">
      {showCode ? <SpecTabs mode={specMode} /> : <span />}
      <div className="ex-actions">
        {codeMode === 'collapsed' ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setCodeOpen((o) => !o)}
            aria-expanded={codeOpen}
          >
            {codeOpen ? 'Hide code' : 'Show code'}
          </Button>
        ) : null}
        {isEditable && !json ? (
          <>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={undo}
              disabled={!canUndo}
              aria-label="Undo"
              title="Undo (⌘Z)"
            >
              <Undo2 />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={redo}
              disabled={!canRedo}
              aria-label="Redo"
              title="Redo (⇧⌘Z)"
            >
              <Redo2 />
            </Button>
            <span className="ex-sep" aria-hidden="true" />
          </>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={reset}
          title="Restore the example's code and redraw the chart"
        >
          <RotateCcw />
          Reset
        </Button>
      </div>
    </div>
  );

  const codeBody = (
    <>
      {noJson ? <p className="json-note">No JSON form. {noJson}</p> : null}
      {json ? (
        <JsonPane view={json} />
      ) : isEditable ? (
        <CodePane
          key={editorKey}
          source={current}
          external={external}
          onDraftChange={onDraftChange}
          onUndo={undo}
          onRedo={redo}
        />
      ) : (
        <ReadOnlyCode code={current} />
      )}
    </>
  );

  return (
    <div className={cardClass} data-spec={specMode} data-json={json ? 'compiled' : noJson ? 'none' : undefined}>
      <div className="card-head">
        <h3>{meta.title}</h3>
        {meta.blurb ? <p>{meta.blurb}</p> : null}
      </div>
      {isVisual ? (
        <div className="body body-visual">
          <div className="visual-row">
            <div className={resultClass} style={resultStyle}>
              {hint}
              <div className="chart" ref={chartRef} />
              {errorBox}
            </div>
            <div className="visual-data">
              {!error ? <DataPanel chart={elicited} /> : null}
            </div>
          </div>
          {toolbar}
          {showCode ? <div className="code-wrap code-below">{codeBody}</div> : null}
        </div>
      ) : (
        <div className={`body ex-body${fluid ? ' is-fluid' : ''}`}>
          <div className={`code-wrap${tall ? ' tall' : ''}`}>{codeBody}</div>
          <div className={resultClass} style={resultStyle}>
            {hint}
            <div className="chart" ref={chartRef} />
            {errorBox}
            {!error ? <DataPanel chart={elicited} /> : null}
          </div>
          {toolbar}
        </div>
      )}
    </div>
  );
}
