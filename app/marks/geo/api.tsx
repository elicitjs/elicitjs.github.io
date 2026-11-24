import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "projection (ElicitSpec)",
    json: ['spec'],
    summary: (
      <>
        Chart option. Accepts a named projection (fits the world), an options object fitted to a GeoJSON <code className="inline">domain</code>, or a live <code className="inline">d3.geo*</code> instance (required when setting <code className="inline">center</code> / <code className="inline">scale</code> directly or mutating the view to zoom and pan). Auto axes default off when set.
      </>
    ),
    signatures: [
      "projection: \"mercator\" | \"albers-usa\" | \"equal-earth\" | \"orthographic\" | …",
      "projection: { type, domain?, rotate?, parallels?, clipAngle?, precision?, inset?, … }",
      "projection: d3.geoMercator().center([lon, lat]).scale(s).translate([w / 2, h / 2])",
    ],
    options: [
      {
        name: "type",
        type: "string | fn",
        default: "—",
        desc: "Named projection (e.g. \"mercator\", \"albers-usa\", \"equal-earth\", \"orthographic\", \"identity\") or a d3.geo* factory.",
      },
      {
        name: "domain",
        type: "GeoJSON",
        default: "{ type: \"Sphere\" }",
        desc: (
          <>
            GeoJSON FeatureCollection, Feature, or Geometry fitted into the plot frame. Pass{" "}
            <code className="inline">{'{'} type: "MultiPoint", coordinates: [[w, s], [e, n]] {'}'}</code>{" "}
            to frame a lon/lat box with no polygon winding issues.
          </>
        ),
      },
      {
        name: "inset / insetTop / …",
        type: "number",
        default: "0",
        desc: "Pixel padding inside the plot frame when fitting domain.",
      },
      {
        name: "rotate",
        type: "[λ, φ, γ?]",
        default: "—",
        desc: "Spherical rotation in degrees. Pass [-lon, -lat] to centre a globe or conic projection on [lon, lat].",
      },
      {
        name: "parallels / clipAngle / precision",
        type: "d3-geo",
        default: "— / — / 0.15",
        desc: "Forwarded to the underlying d3-geo projection.",
      },
    ],
  },
  {
    name: "geoBasemap({ geojson, … })",
    json: ['plot.geoBasemap'],
    summary: (
      <>
        Inert background map. Pass topology as a mark option — <code className="inline">geojson</code> — not as <code className="inline">Elicit</code> data. Load your own: <code className="inline">const map = await fetch("…").then(r ={'>'} r.json())</code> then <code className="inline">geoBasemap({'{'} geojson: map {'}'})</code>. A FeatureCollection draws <b>one path per feature</b> so boundaries show.
      </>
    ),
    signatures: [
      "geoBasemap({ geojson, fill, stroke, strokeWidth, id }) → Feature",
    ],
    options: [
      {
        name: "geojson",
        type: "GeoJSON",
        default: "—",
        desc: "FeatureCollection, Feature, or Geometry. Required for a visible basemap.",
      },
      {
        name: "fill / stroke / strokeWidth",
        type: "style",
        default: "'#e2e8f0' / '#94a3b8' / 0.75",
        desc: "Chrome styling (also via channels).",
      },
    ],
  },
  {
    name: "geoTile({ url, … })",
    json: ['plot.geoTile'],
    summary: (
      <>
        Raster basemap from a slippy-map tile server (OSM, CARTO, satellite, or your own). Requires <code className="inline">projection: "mercator"</code> or a <code className="inline">d3.geoMercator()</code> instance: tiles are pre-rendered in Web Mercator, so other projections draw nothing and log a warning. Inert chrome, like <code className="inline">geoBasemap</code> — compose both to draw boundaries over imagery.
      </>
    ),
    signatures: [
      "geoTile() → Feature  // OSM standard + attribution",
      "geoTile({ url, subdomains, tileSize, opacity, attribution, attributionSize, minZoom, maxZoom, zoomOffset, id }) → Feature",
    ],
    options: [
      {
        name: "url",
        type: "string | fn",
        default: "OSM standard",
        desc: (
          <>
            Template <code className="inline">{'{'}s{'}'}/{'{'}z{'}'}/{'{'}x{'}'}/{'{'}y{'}'}</code>, or a function of the tile.
          </>
        ),
      },
      {
        name: "subdomains",
        type: "string[]",
        default: "[]",
        desc: (
          <>
            Hosts to rotate <code className="inline">{'{'}s{'}'}</code> across (e.g. a, b, c).
          </>
        ),
      },
      {
        name: "opacity",
        type: "number",
        default: "1",
        desc: "Dim the imagery so overlaid data reads.",
      },
      {
        name: "attribution",
        type: "string | null",
        default: "\"© OpenStreetMap contributors\"",
        desc: "Drawn bottom-right. A licence condition of every tile service — only pass null if you render the credit yourself.",
      },
      {
        name: "attributionSize",
        type: "number",
        default: "9",
        desc: "Attribution font size in px.",
      },
      {
        name: "zoomOffset / minZoom / maxZoom",
        type: "number",
        default: "0 / 0 / 19",
        desc: "Nudge or clamp the chosen zoom level (picked from the fitted scale).",
      },
      {
        name: "tileSize",
        type: "number",
        default: "256",
        desc: "Edge length of one tile in px. Set it for a server that serves retina tiles.",
      },
    ],
    returns: "A Feature emitting image nodes into the background layer, keyed by {z}/{x}/{y} so on-screen tiles survive a re-render without re-fetching.",
  },
  {
    name: "geoPoint / geoPolygon / geoLine / geoText / geoRect",
    json: ['plot.geoPoint', 'plot.geoPolygon', 'plot.geoLine', 'plot.geoText', 'plot.geoRect'],
    summary: (
      <>
        Editable overlays. Import from <code className="inline">elicit.plot</code>. <code className="inline">geoText</code> is <code className="inline">text</code> with the projection doing the placement — it shares the node shape, so <code className="inline">editText</code> / <code className="inline">cycle</code> / <code className="inline">rotate</code> work on it unchanged.
      </>
    ),
    signatures: [
      "geoPoint({ channels: { lon, lat, size, fill }, edits }) → Feature",
      "geoPolygon({ channels: { geometry, fill } }) → Feature",
      "geoLine({ channels: { coordinates }, curve, showVertices }) → Feature  // one line per row",
      "geoLine({ channels: { lon, lat, series, order }, connect }) → Feature  // one path across rows",
      "geoText({ channels: { lon, lat, text }, dx, dy, format }) → Feature",
      "geoRect({ channels: { west, south, east, north } }) → Feature",
    ],
    options: [
      {
        name: "showVertices",
        type: "boolean",
        default: "row mode: false",
        desc: (
          <>
            <code className="inline">geoLine</code> only. Draw a draggable circle at each
            vertex. On by default for a <code className="inline">coordinates</code> line,
            whose vertices it owns; off for a <code className="inline">lon</code>/
            <code className="inline">lat</code> line, whose dots belong to a sibling{" "}
            <code className="inline">geoPoint</code>.
          </>
        ),
      },
      {
        name: "curve",
        type: "string",
        default: "'linear'",
        desc: (
          <>
            <code className="inline">geoLine</code> interpolation between vertices, e.g.{" "}
            <code className="inline">"catmullRom"</code>.
          </>
        ),
      },
      {
        name: "connect",
        type: "'sequence' | 'domain'",
        default: "'sequence'",
        desc: (
          <>
            <code className="inline">geoLine</code> row order when no{" "}
            <code className="inline">order</code> channel is given. A route follows the rows
            as written, so this is the opposite default to <code className="inline">line</code>.
          </>
        ),
      },
      {
        name: "handles / handleSize / handleColor",
        type: "boolean | 'hit' / number / string",
        default: "true / 5 / theme",
        desc: (
          <>
            <code className="inline">geoLine</code> vertex grips, as on{" "}
            <code className="inline">line</code>.
          </>
        ),
      },
      {
        name: "format",
        type: "string | fn",
        default: "String",
        desc: (
          <>
            <code className="inline">geoText</code> display formatter for the{" "}
            <code className="inline">text</code> channel. Display-only.
          </>
        ),
      },
    ],
    channels: [
      {
        name: "lon / lat",
        type: "quantitative",
        desc: "Position in degrees. One dot per row on geoPoint, the anchor on geoText; on geoLine, connects the rows into one path.",
      },
      {
        name: "geometry",
        type: "GeoJSON",
        desc: "geoPolygon path geometry on each row.",
      },
      {
        name: "coordinates",
        type: "[[lon,lat],…]",
        desc: "geoLine vertex list (one line per row).",
      },
      {
        name: "text",
        type: "string",
        desc: (
          <>
            geoText label content (raw, unscaled). Retype it with <code className="inline">editText()</code>.
          </>
        ),
      },
      {
        name: "fontSize / textAnchor / lineAnchor / angle",
        type: "literal",
        desc: (
          <>
            geoText glyph channels — same as the <code className="inline">text</code> mark.
          </>
        ),
      },
      {
        name: "dx / dy",
        type: "px",
        desc: "geoText visual nudge off the anchor (does not move the lon/lat a drag writes).",
      },
      {
        name: "west/south/east/north",
        type: "quantitative",
        desc: "geoRect geographic AABB.",
      },
      {
        name: "fill / stroke / size",
        type: "style",
        desc: "Ordinary style scales (not projected).",
      },
    ],
    returns: "Features emitting path / circle / text / rect nodes in projected pixel space.",
  },
  {
    name: "edit.geo.*",
    json: ['edit.geo.move', 'edit.geo.create', 'edit.geo.draw', 'edit.geo.dragVertex', 'edit.geo.removeVertex', 'edit.geo.brush', 'edit.geo.createRect'],
    summary: (
      <>
        Geo-scoped edits (<code className="inline">scope: "geo"</code>). Invert the pointer through the chart projection.
      </>
    ),
    signatures: [
      "edit.geo.move() — move a geoPoint",
      "edit.geo.create() — click to place a lon/lat row",
      "edit.geo.draw({ minDist }) — drag to author a coordinates list (minDist: 8 px per vertex)",
      "edit.geo.dragVertex() — move a geoLine vertex handle",
      "edit.geo.removeVertex({ min }) — click a vertex away (min: 2 vertices kept)",
      "edit.geo.brush({ move, edgeInset }) — resize/move a geoRect",
      "edit.geo.createRect({ width, height, edgeInset }) — click open map to mint a bbox (degrees)",
    ],
  },
];
