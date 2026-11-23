'use client';

/**
 * The intro walkthrough: scroll through the steps on the left; the spec and the
 * live chart stay pinned beside them. Each step's spec is diffed against the
 * step before, with unchanged top-level keys folded. Every chart draws one
 * dataset, so an answer carries from step to step.
 *
 * A drawn pointer shows each step's gesture through the library's external
 * control (`chart.emit`), and scrolling moves it: how far a step's text has
 * passed the middle of the window is how far along the gesture it is, so
 * scrolling back runs the gesture in reverse. It steps aside while your pointer
 * is over the chart, stops for a step once you have used that chart, and puts
 * the data back when you leave the step.
 */
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import * as elicit from '@elicit';
import { chartThemeFor, useChartMode } from '../../lib/chartTheme';
import { highlightLine, stepDiff } from '../../lib/specDiff';
import { FakePointer, type Gesture } from './pointer';
import { STEPS, SEED, inkFor, jsonSpec, rules, schema, type Step } from './steps';

type Row = { cause: string; share: number };
type Source = { getData: () => unknown; setData: (d: any) => void; on: (t: 'change', cb: () => void) => () => void };

const toHundred = (rows: Row[]) => {
  const sum = rows.reduce((s, d) => s + d.share, 0) || 1;
  return rows.map((d) => ({ ...d, share: Math.round((d.share / sum) * 1000) / 10 }));
};

/** How far along its gesture step `el` is: 0 until its text is a fifth of the
 * way past the middle of the window, 1 once it is seven tenths of the way. */
function progress(el: HTMLElement | null | undefined) {
  if (!el) return 0;
  const r = el.getBoundingClientRect();
  const u = Math.min(1, Math.max(0, ((window.innerHeight / 2 - r.top) / r.height - 0.2) / 0.5));
  return u * u * (3 - 2 * u);
}

/** Leave a still copy of the outgoing chart in its slot, fading, so the next
 * chart crossfades in instead of replacing it at once. */
function fadeOut(slot: HTMLElement) {
  const svg = slot.querySelector(':scope > :not(.walk-ghost) svg');
  if (!svg || !slot.isConnected) return;
  const ghost = document.createElement('div');
  ghost.className = 'walk-ghost';
  ghost.setAttribute('aria-hidden', 'true');
  ghost.append(svg.cloneNode(true));
  slot.append(ghost);
  ghost.addEventListener('animationend', () => ghost.remove(), { once: true });
  setTimeout(() => ghost.remove(), 1000);
}

/* ── The spec pane ──────────────────────────────────────────────────── */

/** The lines a name in the text refers to: `move()` finds `move(`, `fill` the word. */
const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
function refLines(lines: string[], term: string): Set<number> {
  const call = term.match(/^([\w.]+)\(/);
  const quoted = term.match(/"[^"]+":\s*"[^"]+"/);
  const tries = [
    ...(call ? [new RegExp(`\\b${escapeRe(call[1])}\\(`), new RegExp(`\\b${escapeRe(call[1])}\\b`)] : []),
    ...(quoted ? [new RegExp(escapeRe(quoted[0]))] : []),
    ...(!call && !quoted ? [new RegExp(`\\b${escapeRe(term)}\\b`)] : []),
  ];
  for (const re of tries) {
    const hits = new Set<number>();
    lines.forEach((l, i) => { if (re.test(l)) hits.add(i); });
    if (hits.size) return hits;
  }
  return new Set();
}

/** A line's own indent, as padding, so a wrapped line hangs under where it started. */
const indentOf = (text: string) => {
  const n = text.length - text.trimStart().length;
  return { text: text.slice(n), style: { paddingLeft: `calc(1.1rem + ${n + 2}ch)` } };
};

function SpecCode({ step, prev, interactive = true, refTerm = null }: { step: Step; prev: Step | null; interactive?: boolean; refTerm?: string | null }) {
  const diff = useMemo(() => stepDiff(step.code, prev ? prev.code : null, step.fold), [step, prev]);
  const refs = useMemo(() => (refTerm ? refLines(diff.next, refTerm) : new Set<number>()), [diff, refTerm]);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const preRef = useRef<HTMLPreElement>(null);

  // Bring the first change into view.
  useEffect(() => {
    const pre = preRef.current;
    if (!pre || !interactive) return;
    const first = pre.querySelector<HTMLElement>('.is-add, .is-del');
    pre.scrollTop = first ? Math.max(0, first.offsetTop - pre.clientHeight * 0.3) : 0;
  }, [diff, interactive]);

  // Bring the lines a hovered name refers to into view.
  useEffect(() => {
    const pre = preRef.current;
    const hit = refTerm && pre?.querySelector<HTMLElement>('.is-ref');
    if (pre && hit) pre.scrollTo({ top: Math.max(0, hit.offsetTop - pre.clientHeight * 0.3), behavior: 'smooth' });
  }, [refs, refTerm]);

  const startAt = new Map(diff.blocks.map((b) => [b.start, b]));
  const items: React.ReactNode[] = [];
  let body: React.ReactNode[] | null = null;
  let head: { key: string; closed: boolean; html: string; cls: string; style: React.CSSProperties } | null = null;
  let endAt = -1;

  const flush = () => {
    if (!head || !body) return;
    const h = head;
    items.push(
      <span key={`fold-${h.key}`} className={`walk-fold${h.closed ? ' is-closed' : ''}`}>
        <span
          className={`ln walk-fold-head${h.cls}`}
          style={h.style}
          role={interactive ? 'button' : undefined}
          tabIndex={interactive ? 0 : undefined}
          aria-expanded={interactive ? !h.closed : undefined}
          onClick={interactive ? () => setOpen((o) => ({ ...o, [h.key]: h.closed })) : undefined}
          onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((o) => ({ ...o, [h.key]: h.closed })); } } : undefined}
          dangerouslySetInnerHTML={{ __html: h.html }}
        />
        <span className="walk-fold-body">{body}</span>
      </span>,
    );
    head = null; body = null; endAt = -1;
  };

  diff.ops.forEach((op, k) => {
    const cls = op.kind === 'same' ? '' : ` is-${op.kind}`;
    const block = op.kind !== 'del' ? startAt.get(op.at) : undefined;
    if (block) {
      // A fold opens while a hovered name points inside it.
      const pointedAt = [...refs].some((r) => r > block.start && r <= block.end);
      const closed = pointedAt ? false : block.key in open ? !open[block.key] : block.closed;
      const tail = diff.next[block.end].trim();
      const { text, style } = indentOf(op.text);
      head = {
        key: block.key, closed, cls: cls + (refs.has(op.at) ? ' is-ref' : ''), style,
        html: `<span class="walk-chev"></span>${highlightLine(text)}<span class="walk-tail"><span class="walk-dots">…</span>${highlightLine(tail)}</span>`,
      };
      body = [];
      endAt = block.end;
      return;
    }
    const { text, style } = indentOf(op.text);
    const ref = op.kind !== 'del' && refs.has(op.at) ? ' is-ref' : '';
    const line = <span key={k} className={`ln${cls}${ref}`} style={style} dangerouslySetInnerHTML={{ __html: highlightLine(text) || '\u200b' }} />;
    if (body) body.push(line); else items.push(line);
    if (body && op.kind !== 'del' && op.at === endAt) flush();
  });

  const folded = diff.blocks.filter((b) => (b.key in open ? !open[b.key] : b.closed)).length;
  const summary = [prev && diff.added && `+${diff.added}`, diff.removed && `−${diff.removed}`, folded && `${folded} folded`]
    .filter(Boolean).join(' · ');

  return (
    <>
      {interactive ? (
        <div className="walk-pane-head"><span>spec</span><span className="walk-summary">{summary}</span></div>
      ) : null}
      <pre ref={preRef} className="walk-code">{items}</pre>
    </>
  );
}

/* ── The readout ────────────────────────────────────────────────────── */

function Readout({ rows, highlight }: { rows: Row[]; highlight: boolean }) {
  const last = useRef<Row[]>(rows);
  const before = last.current;
  useEffect(() => { last.current = rows; }, [rows]);
  return (
    <div className={`data walk-readout${highlight ? ' is-highlight' : ''}`}>
      <div className="data-head"><span>chart.getData()</span><span className="data-count">{rows.length} rows</span></div>
      <pre className="data-body">
        {'[\n'}
        {rows.map((r, i) => {
          const share = Math.round(r.share * 10) / 10;
          const changed = before[i] && Math.round(before[i].share * 10) / 10 !== share;
          return (
            <Fragment key={i}>
              {'  { '}<span className="key">cause</span>: <span className="str">&quot;{r.cause}&quot;</span>
              {', '}<span className="key">share</span>: <span key={share} className={`num${changed ? ' walk-flash' : ''}`}>{share}</span>
              {i < rows.length - 1 ? ' },\n' : ' }\n'}
            </Fragment>
          );
        })}
        {']'}
      </pre>
    </div>
  );
}

/* ── The walkthrough ────────────────────────────────────────────────── */

export function Walkthrough() {
  const mode = useChartMode();
  const [active, setActive] = useState(0);
  const [rows, setRows] = useState<Row[]>(SEED);
  const rowsRef = useRef<Row[]>(SEED);
  const dsRef = useRef<{ ds: any; constrained: boolean } | null>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const stepEls = useRef<(HTMLDivElement | null)[]>([]);
  const used = useRef<Set<number>>(new Set());
  const hover = useRef(false);
  const update = useRef<() => void>(() => {});
  const activeRef = useRef(0);
  activeRef.current = active;
  const [refTerm, setRefTerm] = useState<string | null>(null);

  // The step whose text crosses the middle of the viewport is the active one.
  useEffect(() => {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) if (e.isIntersecting) setActive(Number((e.target as HTMLElement).dataset.step));
    }, { rootMargin: '-45% 0px -45% 0px' });
    stepEls.current.forEach((el) => el && io.observe(el));
    return () => io.disconnect();
  }, []);

  // Scrolling moves the active step's gesture.
  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => { frame = 0; update.current(); });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Your pointer over the chart sends the drawn one away; a press means you
  // have taken over this step.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const enter = () => { hover.current = true; update.current(); };
    const leave = () => { hover.current = false; update.current(); };
    const down = (e: PointerEvent) => { if (e.isTrusted) used.current.add(activeRef.current); };
    view.addEventListener('pointerenter', enter);
    view.addEventListener('pointerleave', leave);
    view.addEventListener('pointerdown', down);
    return () => {
      view.removeEventListener('pointerenter', enter);
      view.removeEventListener('pointerleave', leave);
      view.removeEventListener('pointerdown', down);
    };
  }, []);
  // Build the active step's chart; scrolling then drives its gesture until you take over.
  useEffect(() => {
    const step = STEPS[active];
    const slot = slotRef.current, view = viewRef.current;
    if (!slot || !view) return;
    elicit.setTheme(chartThemeFor(mode) as Parameters<typeof elicit.setTheme>[0]);

    let chart: any;
    let source: Source;
    if (step.build) {
      const { constrained, spec } = step.build(inkFor(mode));
      if (!dsRef.current || dsRef.current.constrained !== constrained) {
        const data = constrained ? toHundred(rowsRef.current) : rowsRef.current;
        dsRef.current = { ds: elicit.Elicit.dataset({ data, schema: schema(), constraints: constrained ? rules() : [] } as any), constrained };
      }
      chart = dsRef.current.ds.chart(spec);
      source = dsRef.current.ds;
    } else {
      chart = elicit.Elicit(elicit.compile(jsonSpec(toHundred(rowsRef.current)) as any) as any);
      source = chart;
    }
    const dom = chart.dom() as HTMLElement;
    dom.classList.add('walk-enter');
    slot.replaceChildren(dom, ...slot.querySelectorAll('.walk-ghost'));
    const sync = () => {
      const next = (source.getData() as Row[]).map((d) => ({ cause: d.cause, share: d.share }));
      rowsRef.current = next;
      setRows(next);
    };
    sync();
    const off = source.on('change', sync);

    let alive = true;
    const pointer = new FakePointer(view);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const base = JSON.stringify(source.getData());
    const restore = () => {
      if (JSON.stringify(source.getData()) === base) return;
      source.setData(JSON.parse(base));
      sync();
    };
    let gesture: Gesture | null = null;
    let tries = 0;
    const scrub = () => {
      const bar = scrubRef.current;
      if (!alive || !step.demo || reduced) return;
      if (hover.current || used.current.has(active)) {
        pointer.release(chart);
        pointer.show(false);
        if (bar) bar.style.transform = 'scaleX(0)';
        return;
      }
      const u = progress(stepEls.current[active]);
      if (bar) bar.style.transform = `scaleX(${u})`;
      // A new drag starts from the step's own answer, on freshly drawn nodes.
      if (!pointer.holding) {
        if (u > 0) restore();
        gesture = step.demo(slot);
      }
      // The chart may not have drawn yet.
      if (!gesture) { if (tries++ < 30) requestAnimationFrame(scrub); return; }
      pointer.scrub(chart, gesture, u);
      if (u <= 0) restore();
    };
    update.current = scrub;
    requestAnimationFrame(scrub);

    return () => {
      alive = false;
      update.current = () => {};
      pointer.release(chart);
      if (!used.current.has(active)) restore();
      if (!reduced) fadeOut(slot);
      pointer.remove();
      off();
      chart.destroy();
    };
  }, [active, mode]);

  const step = STEPS[active];
  return (
    <div className="walk">
      <div
        className="walk-steps"
        onMouseOver={(e) => {
          const el = (e.target as Element).closest<HTMLElement>('.walk-step.is-active .walk-ref');
          setRefTerm(el ? el.dataset.ref ?? null : null);
        }}
        onMouseLeave={() => setRefTerm(null)}
      >
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            ref={(el) => { stepEls.current[i] = el; }}
            data-step={i}
            className={`walk-step${i === active ? ' is-active' : ''}`}
          >
            <div className="walk-num">{String(i + 1).padStart(2, '0')} / {STEPS.length}</div>
            <h3>{s.title}</h3>
            <p>{s.body}</p>
            {s.try ? <div className="try">{s.try}</div> : null}
            {s.more ? <a className="walk-more" href={s.more.href}>{s.more.label} →</a> : null}
            <div className="walk-inline"><SpecCode step={s} prev={i > 0 ? STEPS[i - 1] : null} interactive={false} refTerm={i === active ? refTerm : null} /></div>
          </div>
        ))}
      </div>
      <div className="walk-stage">
        <div className="walk-pane walk-spec">
          <SpecCode key={step.id} step={step} prev={active > 0 ? STEPS[active - 1] : null} refTerm={refTerm} />
        </div>
        <div className="walk-pane walk-chart-pane">
          <div className="walk-pane-head"><span>chart</span><span>{step.title.toLowerCase()}</span></div>
          {step.demo ? <div className="walk-scrub" aria-hidden="true"><div ref={scrubRef} /></div> : null}
          <div className="walk-view" ref={viewRef}>
            {step.build ? (
              <>
                <div className="walk-question">How much of the rise in house prices do you put down to each cause?</div>
                <div className="chart walk-chart" ref={slotRef} />
              </>
            ) : (
              <div className="walk-chat">
                <div className="walk-msg is-user">Help me work out what I think is driving house prices.</div>
                <div className="walk-msg">Split 100 points across these four causes:</div>
                <div className="walk-msg is-chart"><div className="chart walk-chart" ref={slotRef} /></div>
              </div>
            )}
            {step.readout || !step.build ? <Readout rows={rows} highlight={step.readout === 'highlight'} /> : null}
          </div>
        </div>
      </div>
    </div>
  );
}
