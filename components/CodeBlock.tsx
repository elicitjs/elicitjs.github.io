'use client';

import { isValidElement, type HTMLAttributes, type ReactNode } from 'react';
import { FoldedCode } from './FoldedCode';

/** The fence languages that fold: JavaScript and JSON. Others stay plain. */
const FOLDING: Record<string, 'jsx' | 'json'> = {
  js: 'jsx', jsx: 'jsx', javascript: 'jsx', ts: 'jsx', tsx: 'jsx', typescript: 'jsx', json: 'json',
};

/**
 * A prose fence (```js), in the docs' `.code` panel. JavaScript and JSON are
 * highlighted, and their blocks fold like an example's code.
 */
export function CodeBlock({ children, ...props }: HTMLAttributes<HTMLPreElement> & { children?: ReactNode }) {
  const code = isValidElement<{ className?: string; children?: ReactNode }>(children) ? children : null;
  const lang = code?.props.className?.match(/language-(\w+)/)?.[1];
  const text = typeof code?.props.children === 'string' ? code.props.children : null;
  const language = lang ? FOLDING[lang] : undefined;
  if (!language || text == null) {
    return (
      <pre className="code" {...props}>
        {children}
      </pre>
    );
  }
  return <FoldedCode code={text.trimEnd()} language={language} className="code code-folding" />;
}
