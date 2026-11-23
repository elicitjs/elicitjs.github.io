/**
 * A spec shown one step at a time: the lines a step adds or removes, and the
 * top-level keys it leaves alone, folded to `schema: { … }`. Used by the intro
 * walkthrough's spec pane. Works on JavaScript and JSON specs.
 */

export type LineOp = { kind: 'same' | 'add' | 'del'; text: string; at: number };
export type FoldBlock = { key: string; start: number; end: number; closed: boolean };

/** A line diff (LCS). `at` is the line's index in `next`, or where a removed line was. */
export function diffLines(prev: string[], next: string[]): LineOp[] {
  const n = prev.length, m = next.length;
  const L = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--)
    for (let j = m - 1; j >= 0; j--)
      L[i][j] = prev[i] === next[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  const out: LineOp[] = [];
  let i = 0, j = 0;
  while (i < n && j < m) {
    if (prev[i] === next[j]) { out.push({ kind: 'same', text: next[j], at: j }); i++; j++; }
    else if (L[i + 1][j] >= L[i][j + 1]) out.push({ kind: 'del', text: prev[i++], at: j });
    else { out.push({ kind: 'add', text: next[j], at: j }); j++; }
  }
  while (i < n) out.push({ kind: 'del', text: prev[i++], at: j });
  while (j < m) { out.push({ kind: 'add', text: next[j], at: j }); j++; }
  return out;
}

/** A top-level key whose value opens a block on its own line: `schema: {` or `"data": [`. */
const OPENER = /^( {2})"?([A-Za-z]\w*)"?\s*:\s*[[{]\s*$/;

/** The top-level blocks of a spec, each from its key line to its closing bracket. */
export function foldBlocks(lines: string[]): Omit<FoldBlock, 'closed'>[] {
  const out: Omit<FoldBlock, 'closed'>[] = [];
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(OPENER);
    if (!m) continue;
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].startsWith(m[1]) && /^[\]}]/.test(lines[j].slice(m[1].length))) {
        out.push({ key: m[2], start: i, end: j });
        i = j;
        break;
      }
    }
  }
  return out;
}

/**
 * Compare a step's spec with the one before it. A block with no added or removed
 * line folds; `fold` names keys that fold anyway. With no previous step, nothing
 * folds and no line counts as added.
 */
export function stepDiff(code: string, prevCode: string | null, fold: string[] = []) {
  const next = code.split('\n');
  const ops: LineOp[] = prevCode
    ? diffLines(prevCode.split('\n'), next)
    : next.map((text, at) => ({ kind: 'same' as const, text, at }));
  const blocks: FoldBlock[] = foldBlocks(next).map((b) => {
    const changed = ops.some((o) =>
      (o.kind === 'add' && o.at >= b.start && o.at <= b.end) || (o.kind === 'del' && o.at > b.start && o.at <= b.end));
    return { ...b, closed: fold.includes(b.key) || (!!prevCode && !changed) };
  });
  return {
    ops,
    blocks,
    next,
    added: ops.filter((o) => o.kind === 'add').length,
    removed: ops.filter((o) => o.kind === 'del').length,
  };
}

const TOKEN = /(\/\/.*$)|("[^"]*")|\b(\d+(?:\.\d+)?)\b|\b(const|new)\b|\b([A-Za-z]+)\b(?=\()/gm;
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/** One line of spec, highlighted with the docs' `.code` classes (`.c .s .n .k .f`). */
export function highlightLine(src: string): string {
  return escape(src).replace(TOKEN, (m, c, s, n, k) =>
    `<span class="${c ? 'c' : s ? 's' : n ? 'n' : k ? 'k' : 'f'}">${m}</span>`);
}
