'use client';

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type MouseEvent } from 'react';
import { Highlight } from 'prism-react-renderer';
import { codeTheme } from '../lib/codeTheme';
import { findBlocks, findFolds, type Block, type Fold } from '../lib/folds';
import { registerPanel } from '../lib/codeRefs';

/** The nearest box between `el` and its card or section that scrolls its code. */
function scrollerOf(el: HTMLElement): HTMLElement | null {
  for (let n: HTMLElement | null = el; n && !n.matches('.card, section, main, body'); n = n.parentElement) {
    const { overflowY } = getComputedStyle(n);
    if ((overflowY === 'auto' || overflowY === 'scroll') && n.scrollHeight > n.clientHeight) return n;
  }
  return null;
}

type Props = {
  code: string;
  language: 'jsx' | 'json';
  /** Class and style of the <pre>. */
  className?: string;
  style?: CSSProperties;
  /** Folds the reader opened, by first line. Kept by the caller to survive a remount. */
  open?: Set<number>;
  onOpenChange?: (open: Set<number>) => void;
  /** Blocks the reader closed, by first line. Kept by the caller to survive a remount. */
  closed?: Set<number>;
  onClosedChange?: (closed: Set<number>) => void;
  /** Called with the character offset a click landed on; the caller starts editing there. */
  onPick?: (offset: number) => void;
};

const plural = (n: number) => `${n} more row${n === 1 ? '' : 's'}`;

/**
 * Highlighted code whose `data` rows fold after the first, and whose blocks
 * collapse to their first line from a toggle in the gutter (lib/folds.ts).
 */
export function FoldedCode({ code, language, className = '', style, open: given, onOpenChange, closed: givenClosed, onClosedChange, onPick }: Props) {
  const [own, setOwn] = useState<Set<number>>(() => new Set());
  const open = given ?? own;
  const setOpen = onOpenChange ?? setOwn;
  const [ownClosed, setOwnClosed] = useState<Set<number>>(() => new Set());
  const closed = givenClosed ?? ownClosed;
  const setClosed = onClosedChange ?? setOwnClosed;
  const folds = useMemo(() => findFolds(code), [code]);
  const blocks = useMemo(() => new Map(findBlocks(code).map((b) => [b.start, b])), [code]);
  const toggleBlock = (block: Block) => {
    const next = new Set(closed);
    if (next.has(block.start)) next.delete(block.start);
    else next.add(block.start);
    setClosed(next);
  };
  // Lines a name in the prose points at (lib/codeRefs.ts). A fold opens while
  // it hides one, and the panel scrolls to the first.
  const [refs, setRefs] = useState<Set<number> | null>(null);
  const preRef = useRef<HTMLPreElement>(null);
  useEffect(() => registerPanel({ el: () => preRef.current, lines: code.split('\n'), set: setRefs }), [code]);
  const pointsInto = (start: number, end: number) => !!refs && [...refs].some((r) => r > start && r <= end);
  useEffect(() => {
    const hit = refs && preRef.current?.querySelector<HTMLElement>('.is-ref');
    const box = hit && scrollerOf(hit);
    if (!hit || !box) return;
    const at = hit.getBoundingClientRect(), view = box.getBoundingClientRect();
    if (at.top >= view.top && at.bottom <= view.bottom) return;
    box.scrollTo({ top: box.scrollTop + at.top - view.top - box.clientHeight * 0.3, behavior: 'smooth' });
  }, [refs]);
  const lineStarts = useMemo(() => {
    const starts = [0];
    for (let i = 0; i < code.length; i++) if (code[i] === '\n') starts.push(i + 1);
    return starts;
  }, [code]);

  const foldOf = (line: number): Fold | undefined => folds.find((f) => line >= f.start && line <= f.end);
  const toggle = (fold: Fold) => {
    const next = new Set(open);
    if (next.has(fold.start)) next.delete(fold.start);
    else next.add(fold.start);
    setOpen(next);
  };
  const indent = (line: number) => code.slice(lineStarts[line]).match(/^[ \t]*/)?.[0] ?? '';

  /** The text position under a point. */
  const caretAt = (x: number, y: number): { node: Node; offset: number } | null => {
    const doc = document as Document & {
      caretPositionFromPoint?: (x: number, y: number) => { offsetNode: Node; offset: number } | null;
      caretRangeFromPoint?: (x: number, y: number) => Range | null;
    };
    const position = doc.caretPositionFromPoint?.(x, y);
    if (position) return { node: position.offsetNode, offset: position.offset };
    const range = doc.caretRangeFromPoint?.(x, y);
    return range ? { node: range.startContainer, offset: range.startOffset } : null;
  };

  /** A click (not a drag that selects text) starts editing where it landed. */
  const pick = (e: MouseEvent<HTMLPreElement>) => {
    if (!onPick || (e.target as Element).closest('.code-fold, .code-fold-toggle, .code-fold-dots')) return;
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) return;
    const at = caretAt(e.clientX, e.clientY);
    const line = at && (at.node instanceof Element ? at.node : at.node.parentElement)?.closest<HTMLElement>('[data-line]');
    if (!at || !line) return onPick(code.length);
    const range = document.createRange();
    range.setStart(line, 0);
    range.setEnd(at.node, at.offset);
    onPick(lineStarts[Number(line.dataset.line)] + range.toString().length);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (onPick && e.key === 'Enter' && e.target === e.currentTarget) {
      e.preventDefault();
      onPick(0);
    }
  };

  return (
    <Highlight theme={codeTheme} code={code} language={language}>
      {({ className: highlight, style: plain, tokens, getLineProps, getTokenProps }) => (
        <pre
          ref={preRef}
          className={`${className} ${highlight}`}
          style={{ ...plain, ...style }}
          onClick={onPick ? pick : undefined}
          onKeyDown={onPick ? onKeyDown : undefined}
          tabIndex={onPick ? 0 : undefined}
          aria-label={onPick ? 'Code. Click or press Enter to edit.' : undefined}
        >
          {(() => {
            const rows: React.ReactNode[] = [];
            // A closing line without its indent: `},` after the `…`.
            const closerOf = (line: typeof tokens[number]) => {
              const out = line.map((t) => ({ ...t }));
              while (out.length && !out[0].content.trim()) out.shift();
              if (out.length) out[0].content = out[0].content.trimStart();
              return out;
            };
            const tokensOf = (line: typeof tokens[number], key: string) =>
              line.map((token, k) => <span key={`${key}-${k}`} {...getTokenProps({ token })} />);
            for (let i = 0; i < tokens.length; i++) {
              const fold = foldOf(i);
              if (fold && !open.has(fold.start) && !pointsInto(fold.start - 1, fold.end)) {
                rows.push(
                  <button key={i} type="button" className="code-fold" onClick={() => toggle(fold)}>
                    {indent(i)}… {plural(fold.rows)}
                  </button>,
                );
                i = fold.end;
                continue;
              }
              const block = blocks.get(i);
              const isClosed = !!block && closed.has(block.start) && !pointsInto(block.start, block.end);
              const props = getLineProps({ line: tokens[i] });
              rows.push(
                <div key={i} {...props} className={`${props.className}${block ? ' has-fold' : ''}${refs?.has(i) ? ' is-ref' : ''}`} data-line={i}>
                  {block ? (
                    <button
                      type="button"
                      className="code-fold-toggle"
                      aria-expanded={!isClosed}
                      aria-label={isClosed ? 'Unfold' : 'Fold'}
                      onClick={() => toggleBlock(block)}
                    />
                  ) : null}
                  {tokensOf(tokens[i], String(i))}
                  {block && isClosed ? (
                    <>
                      <button type="button" className="code-fold-dots" onClick={() => toggleBlock(block)} aria-label="Unfold">…</button>
                      {tokensOf(closerOf(tokens[block.end]), `${i}-end`)}
                    </>
                  ) : null}
                </div>,
              );
              if (block && isClosed) {
                i = block.end;
                continue;
              }
              if (fold && i === fold.end) {
                rows.push(
                  <button key={`${i}-hide`} type="button" className="code-fold" onClick={() => toggle(fold)}>
                    {indent(i)}Hide {fold.rows} row{fold.rows === 1 ? '' : 's'}
                  </button>,
                );
              }
            }
            return rows;
          })()}
        </pre>
      )}
    </Highlight>
  );
}
