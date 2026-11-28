'use client';

import { useEffect } from 'react';
import { onPanelsChange, panelsIn, refLines } from '../lib/codeRefs';

/**
 * Inline code in a section's prose that names something in that section's
 * code: hover it and the lines it names light up (lib/codeRefs.ts). The intro
 * walkthrough does the same for its own spec pane, so its steps are left out.
 */
const SOURCES = 'main section code';
const LEFT_OUT = 'pre, .walk, section#api';

/** The section a code element speaks for, or null if it doesn't take part. */
function scopeOf(code: Element): Element | null {
  if (code.closest(LEFT_OUT)) return null;
  return code.closest('main section');
}

const termOf = (code: Element) => (code.textContent ?? '').trim();

export function useCodeRefs() {
  useEffect(() => {
    // Mark the names that point at something, so they look hoverable.
    let frame = 0;
    const mark = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const bySection = new Map<Element, ReturnType<typeof panelsIn>>();
        document.querySelectorAll(SOURCES).forEach((code) => {
          const scope = scopeOf(code);
          const term = termOf(code);
          let hit = false;
          if (scope && term) {
            if (!bySection.has(scope)) bySection.set(scope, panelsIn(scope));
            hit = bySection.get(scope)!.some((p) => refLines(p.lines, term).size > 0);
          }
          code.classList.toggle('code-ref', hit);
        });
      });
    };
    mark();
    const offPanels = onPanelsChange(mark);

    // Hovering a name lights the lines it points at in its own section.
    let current: Element | null = null;
    let lit: ReturnType<typeof panelsIn> = [];
    const clear = () => {
      lit.forEach((p) => p.set(null));
      lit = [];
      current = null;
    };
    const over = (e: Event) => {
      const code = (e.target as Element | null)?.closest?.('code.code-ref') ?? null;
      if (code === current) return;
      clear();
      const scope = code && scopeOf(code);
      if (!code || !scope) return;
      current = code;
      const term = termOf(code);
      for (const p of panelsIn(scope)) {
        const refs = refLines(p.lines, term);
        if (refs.size) {
          p.set(refs);
          lit.push(p);
        }
      }
    };
    document.addEventListener('mouseover', over);
    document.documentElement.addEventListener('mouseleave', clear);

    return () => {
      cancelAnimationFrame(frame);
      offPanels();
      clear();
      document.removeEventListener('mouseover', over);
      document.documentElement.removeEventListener('mouseleave', clear);
    };
  }, []);
}
