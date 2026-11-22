# Authoring VIBE entries

This folder is a standalone static site. It takes the real-world belief-elicitation
pieces in the VIBE example set (`cgf14556-sup-0001-s2.xlsx`, and the screenshots in
`Screenshots of Belief-Driven Elicitation Examples 2/`) and, for each one, shows:

1. the **original**: the screenshot, a short account of what the piece asked and how,
   and links to the live page or an archived copy;
2. its **elicitation strategy**: what belief it elicits, how it asks, and how
   Elicit.js expresses the same strategy;
3. an **Elicit.js recreation** of the interaction, live and answerable, when one is
   possible, plus 0–2 **variants** that ask the same belief in another way;
4. when it can't be recreated, or only in part: **why**, and which missing features
   would unlock it.

The sibling `../gallery/` does the same for the Vega-Lite and Plot galleries. Copy
its idioms (`../gallery/entries/*.js` and `../gallery/AUTHORING.md`).

Open it with `open index.html`; it works from `file://`.

## Where things are

| Path | What |
|---|---|
| `entries/<your-file>.js` | **The only file you write.** One `VIBE.add({...})` per example. |
| `assets/catalog.js` | Every example: `id` (`row-06` … `row-30`), title, source, URL, screenshot, and the spreadsheet's codes. Generated; don't edit. |
| `entries/features.js` | The feature-gap vocabulary (`needs` keys). Read it. |
| `tools/check.mjs` | Headless checker + screenshots. |
| `../../../elicitjs/CLAUDE.md` | The library's design rules. |
| `../../../elicitjs/src/index.d.ts`, `src/types.d.ts`, `src/vocabulary.js` | The public API and every option each factory accepts. |
| `../../app/**/_examples/*.example.txt` | Several hundred working docs examples: the best idiom corpus. `app/widgets/_examples` has the slider, likert, ranking, interval, histogram and probability-token widgets; `app/_examples/draw-the-line-for-the-missing-years.example.txt` is a you-draw-it line; `app/editing/probe/_examples/two-stage-point.example.txt` uses stages. |
| `../../STYLE.md` | Prose style for `why`, `strategy`, `gaps`. |

Don't edit anything outside your entry file: not `assets/`, not `index.html`, not
the library. If the site or the library has a bug, say so in your final report with
a minimal spec.

## Research first

Every piece is a real page, and several are gone. For each one:

- Try the original URL. If it is dead, paywalled or renders nothing useful, use the
  Wayback Machine: `https://archive.org/wayback/available?url=<url>&timestamp=<yyyy>`
  and `https://web.archive.org/cdx/search/cdx?url=<url>&output=json&limit=20` find
  snapshots; `https://web.archive.org/web/<timestamp>id_/<url>` returns the raw
  page. Interactive pages often load their data from a JSON or CSV next to the page
  (look for `data.json`, `*.csv`, `ai2html` text, or a `<script>` with the
  questions); the archive often has those too.
- FiveThirtyEight publishes most quiz data at `https://github.com/fivethirtyeight/data`.
  News coverage, the VIBE paper, blog posts and talks about these pieces can also
  fill gaps.
- Find: the questions asked, the answer scale (range, units, labels), the true
  answers the piece revealed and their source, and the flow (guess → reveal →
  score → crowd comparison).
- Record what you found in `original` (below) and link every source you used.
  If you could not find something, say so; never invent an answer value. When a
  value is unknown, seed the reveal with a clearly labelled illustrative value and
  say so in `gaps`.

## The entry format

```js
VIBE.add({
  id: 'row-06',                       // from assets/catalog.js; must match exactly
  status: 'full',                     // 'full' | 'partial' | 'none'
  verdict: 'One sentence: what the recreation does, or why it is impossible.',
  original: {
    availability: 'live',             // 'live' | 'archived' | 'gone' (gone: no usable copy anywhere)
    links: [{ label: 'Wayback Machine, 10 Mar 2018', url: '…' }, { label: 'Poll data (GitHub)', url: '…' }],
    summary: '2–4 sentences: what the piece asks the reader, and how they answer.',
    steps: ['The reader drags …', 'Pressing **Guess** reveals …', '…'],   // the flow, in order
    answers: 'What the piece revealed: true values and their source.',      // optional
  },
  strategy: {
    elicits: 'The belief: a point estimate of a share (0–100%), a trend, a ranking, a category…',
    technique: 'How the original asks: visual form, gesture, constraints, feedback.',
    inElicit: 'How Elicit.js expresses it: the marks, edits, constraints, stages or widget, and the page around it. Or why it cannot.',
  },
  recreation: {                       // omit for 'none'
    title: 'Drag the slider',         // tab label, 2–4 words
    question: 'What share of Americans support stricter gun laws?',
    try: 'Drag the handle, then press Guess.',
    why: '1–3 sentences on the mechanism: which lines make the elicitation work.',
    uses: ['slide()', 'clamp()'],
    code: `…`,
  },
  variants: [ /* 0–2, same shape as recreation */ ],
  needs: ['reveal'],                  // feature keys Elicit.js is MISSING (entries/features.js)
  gaps: ['Each concrete difference from the original.'],
  whyNot: 'For partial and none: what Elicit.js cannot do here, and why.',
  alternative: 'For none: the closest thing Elicit.js can ask instead (show it as a variant).',
});
```

### Status

- **`full`**: what is asked, the gesture, the visual form and the reveal step (if
  the piece has one) are reproduced. Cosmetic differences are fine (fonts, exact
  palette, photos replaced by labels); list notable ones in `gaps`.
- **`partial`**: the core elicitation works, but something a reader would notice is
  missing: a derived view recomputed from the answer, a radar chart, a tile map,
  the scoring logic. List it in `needs` and `gaps`, and explain in `whyNot`.
- **`none`**: the elicitation itself can't be expressed with Elicit.js marks,
  edits, constraints, stages and widgets with minimal customization. Writing a new
  mark with the `authoring` kit does not count as minimal. Explain in `verdict`,
  `whyNot` and `needs`, and give the closest alternative as a variant if there is one.

Two things never decide the status on their own:

- **Other readers' answers.** Elicit.js is client-side; collecting answers is a
  server's job. If the piece shows a crowd (a histogram of guesses, "you beat 55%
  of readers"), draw it from a static, clearly labelled illustrative sample (or the
  real one if you find it), list `social-feedback` in `needs`, and say so in `gaps`.
- **The page around the chart.** Headlines, prose, a quiz's sequence of questions
  and the score are the page's job, not the library's. Build them with the `ui`
  helpers below. But the **answer must come from an Elicit.js chart or widget**
  (it is in `getData()`). If the only way to answer is an HTML control you built
  yourself, Elicit.js didn't do the elicitation.

Be honest and specific. The analysis is only useful if a `full` really is full.

### Code

`code` is a string of JavaScript that is **displayed verbatim and executed**. It runs
as the body of an async function, so `await` works. In scope:

- every mark, element, constraint and universal edit, bare (`point`, `line`, `bar`,
  `text`, `image`, `geoPolygon`, `axisX`, `clamp`, `move`, `slide`, `select`, …);
  scoped edits under `edit.*` (`edit.line.draw()`, `edit.geo.move()`, …);
- `Elicit`, `edit`, `when`, `guides`, `widgets`, `elements`, `layout`, `looks`,
  `format`, `themes`, `authoring`, `d3`, `topojson`;
- `mount(x)`: mounts what `Elicit(...)` returns (its `dom()`), or appends a DOM
  node. You may mount several charts and nodes; they stack in a centred column.
  Every mounted chart's `getData()` is shown under the view;
- `ui`, small helpers for the page around a chart:
  - `ui.question(md)`: the prompt line, inline markdown (`**bold**`);
  - `ui.button(label, onClick)`: a button styled like a news quiz's "Guess";
  - `ui.row(...nodes)`: a centred row of nodes;
  - `ui.note(md)`: a paragraph; set `el.innerHTML = ui.md(text)` later to reveal;
  - `ui.input(attrs)`: a text input; `ui.md(text)`: inline markdown to HTML;
- `h(tag, attrs, ...children)`: a hyperscript helper for anything else;
- data loaders, cached:
  - `await fetchData(url)`: JSON / CSV / TSV by extension (`{ type: 'text' }` for text).
    Use CDNs only (the page runs from `file://`, so it can't read local files):
    `https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json`,
    `https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json` (or `-10m`, `-110m`);
  - `await vegaData('us-10m.json')`: a Vega dataset by file name.

**Data.** Put small data inline in the code: a quiz's few questions and answers, a
time series of a few dozen points. Keep it short and readable.

**Pictures.** Don't hot-link or embed copyrighted photos (news photos, TV stills,
portraits). Use names, initials, emoji, d3 symbols, or a small hand-written SVG as a
`data:` URI in the `image` mark. Say in `gaps` what the original showed.

**Look.** Match the original's look where it carries meaning (538's black handle on
a grey track, the NYT's red "your guess" line, party colours on a map). Otherwise use
the Data & Dialogue Lab colours: teal `#50AEB7` for ink, blue `#2B5D87` for handles
and accents; no stroke on shapes. Keep width ≤ 460 so the two panels sit side by side.

**The reveal.** Most pieces reveal the truth after the reader commits. Recreate it.
A verified idiom: give the row an empty `truth` column drawn by its own mark with no
edit (a mark draws nothing while the column is `null`), give the answer's edit
`stage: 0` and the chart `stage: 0`, and let the button do both:

```js
const chart = mount(Elicit({ stage: 0, data: [{ q: "guns", guess: 50, truth: null }], …
  marks: [
    point({ fill: "#d33", channels: { x: { field: "truth" } } }),                 // the truth, once set
    point({ channels: { x: { field: "guess", edit: slide({ axis: "x", stage: 0 }) } } }),
  ] }))
mount(ui.row(ui.button("Guess", () => { chart.set("truth", 66, { index: 0 }); chart.nextStage() })))
```

Only edits carry a `stage`; marks and guides don't. Context rows (`context: true`),
`chart.setData(...)` and a `ui.note` are other ways to show the answer. Whichever you
use, the reveal should show the guess and the truth together, like the original.

**Highlighting.** End a line with `//! short note` to highlight it as part of what
makes the elicitation work. The note is inline markdown; since `code` is a template
literal, escape backticks inside it as `` \` ``. Highlight the edit(s), the
constraint(s), `lock`, the stage switch, the reveal: 1–6 lines per view. Don't
highlight boilerplate.

### Variants

A variant asks the **same belief** in a way the original didn't, to show what the
strategy could become. The VIBE spreadsheet codes nearly every piece as eliciting no
uncertainty, so the most useful variants usually add it: a best guess plus a range
(`widgets.interval`), a distribution (`widgets.probabilityTokens`,
`widgets.histogram`), a cone around a drawn line (`widgets.lineCone`). Others: a
ranking instead of a rating, an allocation, a confidence rating after a binary
choice. 0–2 per entry; only when they show something worth seeing.

### Prose

Write the library's name as **Elicit.js**. `why`, `strategy`, `gaps` and `whyNot`
follow `../../STYLE.md`: terse, active voice, second person in `why`, British
spelling (colour, behaviour), backtick every identifier. No personal names other
than the publication and the page's own bylines where they help find a source; no
local file paths.

## Checking your work (required)

```sh
cd explorations/vibe
node tools/check.mjs --file entries/<your-file>.js --shot <your-scratch-dir>/shots
node tools/check.mjs row-06 row-10 --shot <dir>
```

For every view it reports errors, `[elicit]` warnings, the SVG nodes drawn, and a
smoke test: whether a real drag on a mark, and a click in the plot, changed
`getData()`. It exits non-zero on any error, warning or empty chart. **All must be
clean.** A warning means the spec is wrong (or the guard has a false positive; then
say so in your report). Never silence warnings.

The smoke test is a hint. **Verify** every gesture and every reveal it can't: write
a throwaway Playwright script in your scratch dir (`require` `playwright` from
`../../../elicitjs/node_modules`) that opens `file://…/vibe/index.html#/<id>`, clicks
the view's tab (`.tabs .tab[data-index="<k>"]`), performs the gesture, presses the
button, and reads `window.VIBE_STATE.blocks[k].charts[i].getData()`. A view that
doesn't actually elicit anything is worse than none.

**Look at the screenshots** (`<id>.compare.png`, `<id>.view-<k>.png`) with the Read
tool, next to the original screenshot. Fix clipped marks, overlapping labels, empty
margins and unreadable colours.

## Final report

Reply with: counts by status; for each entry one line (id, status, what you built
or why not, and the availability of the original); every library bug or surprising
behaviour you hit (with a minimal spec); any warning you believe is a false
positive; any feature key you added; any site bug. Keep it factual and short.
