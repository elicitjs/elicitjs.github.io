/**
 * Names in the prose that point at lines of code. Hovering `move()` in a
 * section's text lights up the lines of that section's code that it names:
 * the intro walkthrough's spec pane, and every other page's examples and
 * prose fences.
 *
 * Code panels (components/FoldedCode) join a registry; components/CodeRefs
 * watches the pointer over the prose and tells the panels in the same
 * section which of their lines to light.
 */

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const QUOTE = `["'\`]`;

/**
 * The term as written, loosely: any run of spaces may be none or several, any
 * quote may be any quote, and a key may be quoted or bare (`"type": "barY"`
 * finds `type: 'barY'`). Word boundaries only where the term starts or ends
 * on a word character.
 */
function literal(term: string): RegExp | null {
  const tokens = [...term.matchAll(/(["'`]?)([A-Za-z_$][\w$]*)\1(?=\s*:)|(\s+)|(["'`])|([\w$]+)|(.)/g)];
  if (!tokens.length) return null;
  const src = tokens.map(([, , key, space, quote, word, other]) => {
    if (key) return `(?:${QUOTE}|\\b)${escapeRe(key)}${QUOTE}?`;
    if (space) return '\\s*';
    if (quote) return QUOTE;
    return escapeRe(word ?? other);
  }).join('');
  const head = !tokens[0][2] && /^\w/.test(term) ? '\\b' : '';
  const tail = /\w$/.test(term) ? '\\b' : '';
  try { return new RegExp(head + src + tail); } catch { return null; }
}

/** The patterns to try for a term, most specific first. */
function patterns(term: string): RegExp[] {
  const t = term.trim();
  if (!t) return [];
  const out: (RegExp | null)[] = [];
  const call = t.match(/^([\w$.]+)\(([\s\S]*)\)$/);
  // `move()` means the function, whatever its arguments; `move({ mode: "relative" })` means that call.
  if (!(call && !call[2].trim())) out.push(literal(t));
  // `{ "type": "barY" }` also finds `type: "barY"` inside a longer object.
  const inner = t.match(/^[{[]\s*([\s\S]*?)\s*,?\s*[}\]]$/);
  if (inner && inner[1]) out.push(literal(inner[1]));
  if (call) {
    const name = call[1];
    const last = name.split('.').pop()!;
    out.push(new RegExp(`\\b${escapeRe(name)}\\(`));
    if (last !== name) out.push(new RegExp(`\\b${escapeRe(last)}\\(`));
    out.push(new RegExp(`\\b${escapeRe(last)}\\b`));
  }
  return out.filter((r): r is RegExp => !!r);
}

const isComment = (line: string) => /^\s*(\/\/|\/\*|\*)/.test(line);

/**
 * The lines a name in the text refers to: `move()` finds `move(`, `fill` the
 * word. Code before comments: a comment that names it counts only when no code
 * line does.
 */
export function refLines(lines: string[], term: string): Set<number> {
  for (const re of patterns(term)) {
    const hits = lines.flatMap((l, i) => (re.test(l) ? [i] : []));
    if (!hits.length) continue;
    const code = hits.filter((i) => !isComment(lines[i]));
    return new Set(code.length ? code : hits);
  }
  return new Set();
}

/* ── The registry of code panels ───────────────────────────────────── */

export type CodePanel = {
  /** The panel's element, to tell which section it sits in. */
  el: () => HTMLElement | null;
  lines: string[];
  /** Light these lines, or none. */
  set: (refs: Set<number> | null) => void;
};

const panels = new Set<CodePanel>();
const listeners = new Set<() => void>();

export function registerPanel(panel: CodePanel): () => void {
  panels.add(panel);
  listeners.forEach((l) => l());
  return () => {
    panels.delete(panel);
    listeners.forEach((l) => l());
  };
}

export function panelsIn(scope: Element): CodePanel[] {
  return [...panels].filter((p) => {
    const el = p.el();
    return !!el && scope.contains(el);
  });
}

export function onPanelsChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}
