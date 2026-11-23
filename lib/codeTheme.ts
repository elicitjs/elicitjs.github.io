import type { PrismTheme } from 'prism-react-renderer';

/**
 * The syntax theme for every highlighted code view (the live editor and the
 * read-only/folded views). Colours are CSS variables, not hex, so the code
 * follows the docs' light/dark mode with no re-render: `--code*` and
 * `--syntax-*` are set per mode in app/globals.css.
 */
export const codeTheme: PrismTheme = {
  plain: {
    color: 'var(--code-foreground)',
    backgroundColor: 'var(--code)',
  },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: { color: 'var(--code-muted)', fontStyle: 'italic' },
    },
    { types: ['punctuation'], style: { color: 'var(--syntax-punctuation)' } },
    { types: ['operator'], style: { color: 'var(--syntax-punctuation)' } },
    {
      types: ['keyword', 'atrule', 'important', 'selector'],
      style: { color: 'var(--syntax-keyword)' },
    },
    {
      types: ['string', 'char', 'template-string', 'attr-value', 'regex', 'inserted'],
      style: { color: 'var(--syntax-string)' },
    },
    {
      types: ['number', 'boolean', 'constant', 'symbol', 'null', 'undefined'],
      style: { color: 'var(--syntax-number)' },
    },
    {
      types: ['function', 'function-variable', 'method', 'builtin', 'class-name', 'tag'],
      style: { color: 'var(--syntax-function)' },
    },
    {
      types: ['property', 'property-access', 'attr-name', 'variable', 'parameter'],
      style: { color: 'var(--syntax-property)' },
    },
    { types: ['deleted'], style: { color: 'var(--destructive)' } },
  ],
};
