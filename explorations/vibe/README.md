# VIBE recreations

The real-world belief-elicitation pieces in the VIBE example set (FiveThirtyEight,
The New York Times, The Guardian, CNN), each set beside its Elicit.js recreation
where one is possible, with the elicitation strategy it uses. Pieces Elicit.js
can't recreate say why, and which missing features would unlock them.

- **`index.html`**: the site. Open it directly in a browser (it works from
  `file://`) or serve the folder with any static server. Maps and some data load
  from jsDelivr, so it needs a network connection.
- **`cgf14556-sup-0001-s2.xlsx`** and **`Screenshots of Belief-Driven Elicitation Examples 2/`**:
  the source material, the VIBE example table and one screenshot per example.
  Screenshot "Row N" is the (N − 5)th example in the sheet; Row 30 has no sheet row.
- **`analysis/ANALYSIS.md`**: what can be recreated, what can't, and why.

## What's in the folder

| Path | What |
|---|---|
| `index.html`, `assets/` | The single-page site (no build step). `assets/catalog.js` is generated from the spreadsheet. |
| `vendor/elicit-bundle.js` | Elicit.js + d3 + topojson-client, built from the sibling `elicitjs` repository. |
| `entries/` | One file per group of examples: each example's research notes, strategy, recreation and verdict. `features.js` is the feature-gap vocabulary. |
| `tools/` | Build and check scripts (below). |

## Rebuilding

```sh
cd tools && npm install
python3 build-catalog.py   # regenerate assets/catalog.js from the spreadsheet (needs openpyxl)
node build-vendor.mjs      # rebundle vendor/ (after an Elicit.js change)
node check.mjs --all       # render every entry in Chromium; fail on errors/warnings
node build-analysis.mjs    # embed analysis/ANALYSIS.md in the site
```

`check.mjs` uses the `elicitjs` repository's Playwright install. `AUTHORING.md`
documents the entry format.
