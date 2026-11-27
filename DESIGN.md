# Design system

How the docs site is styled, and where to change it. (For how to *write* the
docs, see `STYLE.md`.)

Stack: Tailwind CSS v4, shadcn/ui (Radix, `components/ui`), `next-themes` for
light/dark, Lucide icons. Fonts: Geist (UI), Geist Mono (code), Raleway
(headings, the lab logo's typeface).

## Three tiers

| Tier | File | What lives there |
| --- | --- | --- |
| 1. Palette | `styles/brand.css` | Seeds (`--brand-teal`, `--brand-blue`, `--brand-ink`) and the scales mixed from them: `--teal-50…950`, `--blue-50…950`, `--neutral-0…950`. |
| 2. Roles | `app/globals.css` | Semantic tokens for light (`:root`) and dark (`.dark`): shadcn's roles (`--background`, `--primary`, `--muted-foreground`, `--border`, `--ring`, `--sidebar-*`, `--chart-1…5`) and the docs' own (`--brand`, `--link`, `--surface-subtle`, `--code`, `--success`, `--syntax-*`, …). `@theme inline` exposes them as utilities (`bg-card`, `text-faint-foreground`, `border-border-strong`). |
| 3. Components | `components/ui/*`, `components/site/*`, `styles/docs.css`, `styles/playground.css` | shadcn primitives; the site shell (sidebar, mobile sheet, brand, theme toggle); and the component classes MDX pages emit (`.lead`, `.intro`, `code.inline`, `.card`, `.api-*`, `.hero-*`). |

Each tier reads only from the tier above. A component never names a hex value
or a scale step; it names a role.

## Changing colours

- **The whole palette:** edit the two seeds at the top of `styles/brand.css`.
  Every scale, role, light and dark, follows.
- **What a role maps to** (e.g. make links teal): edit that token in
  `app/globals.css`, in `:root` and `.dark`.
- **Chart colours in dark mode:** `lib/chartTheme.ts` (see below). The library
  paints to canvas as well as SVG, so these are hex, not CSS variables. Keep
  them in step with the seeds.

## Light and dark

`next-themes` puts `.dark` on `<html>`. The default is light, and the reader
can choose Light, Dark or System from the toggle in the sidebar or top bar.

Code follows the mode too. Every code view (the live editor, read-only and
folded code, the getData() readout, prose fences, API signatures) colours
itself from `--code*` and `--syntax-*` in `app/globals.css`: a light panel in
light mode, a dark one in dark. `lib/codeTheme.ts` is the Prism theme, written
in those variables, so a mode switch needs no re-render.

Charts follow the mode. `ExampleLive` calls `setTheme()` before every eval:
`'dd'` in light mode and `DD_DARK` (which `extends: 'dd'`) in dark. Toggling
the mode re-runs each example. An example's own `theme` still layers on top,
and so do colours an example hardcodes.

## Layout and breakpoints

- **≥ 1024px (`lg`):** a sticky sidebar beside the content. There is no
  full-width header, but the "On this page" strip (below) does stick to the top
  of the content. The library's browser gate drags charts at viewport
  coordinates, so a chart scrolled under that strip can't be grabbed until it
  is scrolled down.
- **< 1024px:** a sticky top bar. The page list opens in a `Sheet`; the strip
  sticks just under the bar.
- **The page list** (`lib/nav.ts`, drawn by `components/site/docs-nav.tsx`):
  groups are always open. A group with `chips: true` (Marks, Data, Editing, UI
  layer, Appearance) draws its pages as icon chips: add a `chip` short label for a long
  title (the full title becomes the tooltip), and a glyph in
  `components/site/nav-icons.tsx`, keyed by slug for a mark (`bar`) and by full
  route for any other page (`/editing/handles`).
- **"On this page"** (`PageAnchors`): a thin horizontal strip at the top of the
  content, one pill per section, sticky. Its height is `--anchor-strip` in
  `styles/docs.css`, which anchor jumps (`scroll-margin-top`) use to land clear
  of it.
- **> 940px:** an example is a two-column workspace: the code panel (toolbar
  + code) on the left, the chart column (Try hint, chart, getData()) on the
  right. Both share a top and a bottom edge; the code scrolls inside.
- **≤ 940px:** examples stack toolbar, code, then the chart column.
- **≤ 720px:** API option tables collapse to one row per option.
- **Overflow:** the page never scrolls sideways. A fixed-width chart scrolls
  inside its `.chart` box, and wide tables scroll inside `.api-table-wrap`.

## Adding UI

- Use a shadcn primitive first: `npx shadcn@latest add <name>`. Components land
  in `components/ui`. After adding, check that `cn` imports from
  `@/lib/utils`. The CLI once rewrote it to a bare `"cn"` npm package.
- Style with role utilities (`bg-muted`, `text-muted-foreground`,
  `border-border`), not palette steps or arbitrary hex.
- MDX content uses the classes in `styles/docs.css`. Add a class there rather
  than inline styles.

## Load-bearing DOM (don't break)

`../elicitjs/scripts/verify-browser.mjs` selects on section ids and descendant
selectors: `#id .chart svg`, `.data-body`, `.live-error`, `.result`, `.grid`,
and the playground's `.canvas-device-frame`, `.catalog-tab`, `.catalog-item`,
`.add-layer-btn`, `.add-inline-select`, `.drawer-code`. It also takes a section's
**first `<svg>`**, so no icon may sit before a chart inside a `<section>` or an
example card. On `/editing/history` it clicks the page's **first** buttons
named `Undo` and `Redo`, which must be the example's own. That is why an
example's toolbar (with its icon buttons and its code Undo / Redo) comes
**after** the chart in the DOM, and CSS grid places it above the code. Run
`npm run verify:browser` and `npm run check:warnings` in `../elicitjs` after
layout changes.
