// entries/spatial.js: 2-D positions, maps and placement.
// row-08 (538 swing-o-matic), row-14 (NYT Singapore map quiz), row-20 (NYT Game of
// Thrones quadrant), row-21 (NYT heartland maps), row-24 (Guardian coalition builder).

VIBE.add({
  id: 'row-08',
  status: 'full',
  verdict: 'Five one-point charts, one per voting bloc, each drag a vote share and a turnout; every drag re-runs FiveThirtyEight’s own model on its archived state data and redraws a tile map with the electoral and popular vote.',
  original: {
    availability: 'archived',
    links: [
      { label: 'Wayback Machine, 5 Oct 2016 (Clinton v Trump version)', url: 'https://web.archive.org/web/20161005000000/http://projects.fivethirtyeight.com/2016-swing-the-election/' },
      { label: 'Wayback Machine, 12 Dec 2015 (first version)', url: 'https://web.archive.org/web/20151212154713/http://projects.fivethirtyeight.com/2016-swing-the-election/' },
      { label: 'Model and state presets (archived bundle.js)', url: 'https://web.archive.org/web/20161005000000/http://projects.fivethirtyeight.com/2016-swing-the-election/js/bundle.js' },
      { label: 'FlowingData on the piece, Dec 2015', url: 'https://flowingdata.com/2015/12/04/how-various-demographic-groups-can-change-the-election-result/' },
    ],
    summary: 'FiveThirtyEight’s “Swing-O-Matic” (by Aaron Bycoffe and David Wasserman, first published December 2015, updated to Clinton v Trump in October 2016) starts from the 2012 result with each demographic group resized for four years of population change. Five small panels, one per group, each hold one draggable point: its x is the group’s vote split from 100% Democratic to 100% Republican, its y the group’s turnout. Two square-tile maps and the electoral and popular vote totals update as you drag. The live URL now redirects to ABC News.',
    steps: [
      'The page opens on the 2012-based defaults: Clinton 332 electoral votes, Trump 206; popular vote 51.6% to 46.6%.',
      'You drag the point in any of the five panels (“Drag this”); labels read the group’s vote (“60%R”) and turnout (“55%”).',
      'Each state recomputes from how much of its electorate the group makes up; tiles flip between the Clinton and Trump maps and the totals update.',
      'Toggles split white voters by gender instead of education and add a third-party slider; a table below lists every state.',
    ],
    answers: 'No answer to reveal: the piece is a what-if. Its defaults, which the recreation reproduces from the archived presets: non-college white 60% R, 55% turnout; college white 54% R, 78%; Black 93% D, 63%; Hispanic/Latino 71% D, 47%; Asian/other 69% D, 48%.',
  },
  strategy: {
    elicits: 'A scenario, not a fact: for each of five voting blocs, a two-number belief (vote split and turnout) about what 2016 could look like, and through the model, which states that would flip.',
    technique: 'Direct manipulation of a 2-D point per bloc in a small diverging frame (blue and red halves), with live labels. A derived tile map and the electoral count give feedback as you drag; the explanation is the prose beside each bloc.',
    inElicit: 'Each bloc is its own one-row `Elicit` chart: a `point` with `move` on both axes, `clamp` and `snap` to whole percentages, and two `guides.region` halves. A `guides.custom` draws 538’s crosshair and labels from the row. A sixth chart draws the state tiles with `rect` and `text`; on every `change` the page re-runs the model and calls `setData` on it, and a `guides.custom` reads the electoral and popular vote off its rows.',
  },
  recreation: {
    title: 'Drag five blocs',
    question: 'What would it take to turn blue states red?',
    try: 'Drag the dot in any panel; watch the map and the totals.',
    why: 'Each panel’s `move({ channels: ["x", "y"] })` writes the bloc’s vote and turnout in one gesture. The map is a plain chart over the model’s output: `on("change")` feeds the five answers to the model and `setData` redraws the tiles live, mid-drag.',
    uses: ['move()', 'clamp()', 'snap()', 'guides.region', 'guides.custom', 'rect', 'setData'],
    code: `// FiveThirtyEight's presets, in thousands. Per state: electoral votes, tile column
// and row, then for each bloc: eligible citizens / voters / Democratic / Republican votes.
const presets = \`
AL 9 6 6  1882/984/141/834 672/513/120/389 946/564/524/31 68/32/22/9 88/47/27/18
AK 3 0 1  239/129/41/82 124/96/36/55 17/9/9/1 29/14/10/4 126/70/37/32
AZ 11 2 5  2007/1020/334/666 1040/787/299/472 183/96/89/6 994/379/281/95 378/171/115/53
AR 6 5 5  1322/596/147/432 398/290/83/199 327/149/137/10 67/30/22/8 64/32/21/11
CA 55 1 4  6851/3675/1665/1892 5160/3974/2050/1797 1611/966/902/48 6933/3299/2384/851 4135/1982/1472/472
CO 9 3 4  1600/1149/547/574 1332/1147/533/586 141/81/75/5 557/286/214/65 186/99/65/32
CT 7 10 3  1111/606/322/277 860/667/342/316 232/140/130/10 279/134/106/27 117/58/39/17
DE 3 11 4  327/194/92/100 158/126/66/59 142/85/80/4 37/17/12/5 28/13/9/4
DC 3 9 4  18/7/6/1 185/130/117/11 237/159/148/8 30/13/11/1 27/12/9/3
FL 29 8 7  6154/3644/1365/2245 2852/2274/916/1336 2009/1223/1150/67 2570/1688/1019/657 555/259/174/83
GA 16 7 6  2827/1415/260/1144 1463/1101/233/859 2192/1337/1239/73 297/138/97/37 293/142/93/46
HI 4 0 7  149/70/45/25 126/94/62/30 22/10/10/1 86/36/26/10 633/251/184/63
ID 4 2 2  749/413/116/285 268/208/68/135 5/3/2/0 80/37/27/10 43/23/14/9
IL 20 6 2  3928/2046/842/1162 2396/1828/976/814 1321/925/871/51 926/346/282/62 481/234/155/74
IN 11 6 3  3020/1485/548/908 1108/829/323/490 420/268/241/23 170/78/55/21 116/58/38/19
IA 6 5 3  1498/1005/503/483 620/519/269/241 59/33/30/2 67/33/24/9 55/29/19/9
KS 6 4 5  1127/575/195/367 606/460/143/306 115/56/51/4 127/55/39/15 93/46/29/16
KY 8 6 4  2278/1150/360/769 676/511/187/315 250/130/118/11 51/24/17/6 70/35/23/11
LA 8 4 6  1567/836/99/719 606/467/64/393 1074/680/632/44 97/44/32/12 102/51/30/19
ME 4 11 0  696/447/237/197 310/255/157/91 7/4/4/0 11/6/4/2 26/15/9/6
MD 10 10 4  1397/828/328/479 1114/890/464/403 1243/868/815/43 197/101/71/27 289/152/103/45
MA 11 10 2  2123/1326/766/536 1837/1496/875/594 264/166/153/11 376/179/127/48 302/147/100/44
MI 16 7 2  4141/2533/1197/1307 1754/1417/679/722 998/618/579/37 228/111/70/37 281/143/95/45
MN 10 5 2  2199/1633/804/790 1303/1138/603/507 170/100/91/6 97/50/36/14 221/120/80/37
MS 6 5 6  1015/512/54/455 337/254/29/224 806/524/487/29 36/14/10/4 35/16/9/7
MO 10 5 4  2694/1510/542/937 1120/877/337/522 499/325/304/19 108/52/37/14 140/76/50/26
MT 3 3 2  489/285/96/180 217/172/81/86 3/2/2/0 20/10/7/3 60/34/25/8
NE 5 4 4  802/441/138/294 377/293/113/175 54/29/27/1 69/33/23/9 42/22/15/7
NV 6 2 3  842/456/207/244 340/263/117/143 165/92/84/6 332/164/116/39 217/115/57/54
NH 4 11 1  625/411/202/203 343/285/155/126 8/5/4/0 23/12/8/3 27/15/10/5
NJ 14 9 3  2272/1233/534/685 1684/1302/649/638 788/540/507/30 812/416/342/70 531/255/187/66
NM 5 3 5  406/223/85/131 276/215/101/106 29/14/13/1 596/303/199/87 169/56/37/17
NY 29 9 2  5091/2191/1050/1105 3671/2637/1437/1156 1885/1193/1113/71 1880/927/818/103 1118/401/294/105
NC 15 7 5  3393/1930/485/1415 1699/1336/531/785 1550/1193/1125/66 251/119/81/37 311/193/115/72
ND 3 4 2  361/205/71/128 141/111/45/63 6/3/3/0 12/6/4/2 34/19/11/7
OH 18 7 3  5188/3040/1286/1699 2117/1683/773/880 998/741/699/37 198/101/57/43 243/138/89/47
OK 7 3 6  1526/680/146/534 547/397/99/298 200/103/96/7 137/63/45/18 388/138/81/56
OR 7 1 3  1639/996/478/481 823/663/396/243 46/24/22/2 185/87/63/24 205/104/67/34
PA 20 8 3  5480/2938/1354/1543 2555/1969/890/1052 960/605/557/39 438/210/167/38 330/172/113/55
RI 4 11 3  429/222/132/85 211/160/101/56 31/16/15/1 69/32/23/9 42/20/13/7
SC 9 8 5  1661/812/170/631 797/595/144/443 974/600/555/39 92/40/29/11 90/44/25/17
SD 3 4 3  382/209/74/131 169/131/54/74 7/4/3/0 14/6/4/2 58/33/19/13
TN 11 6 5  2790/1237/300/915 1072/776/218/544 791/455/426/27 99/46/33/12 129/69/45/23
TX 38 3 7  5801/2701/511/2160 3441/2529/552/1948 2200/1279/1191/70 4835/1728/1152/535 892/373/249/116
UT 6 2 4  1072/542/101/429 567/428/91/327 17/9/8/1 149/71/50/19 92/48/30/17
VT 3 10 1  310/165/101/60 163/126/91/31 4/2/2/0 7/3/2/1 11/6/4/2
VA 13 8 4  2424/1488/464/996 1747/1413/667/719 1152/791/738/51 286/145/93/48 413/220/140/77
WA 12 1 2  2524/1557/786/729 1418/1149/634/483 168/94/86/6 331/164/117/44 555/339/246/88
WV 5 7 4  1109/446/138/298 265/187/67/115 47/25/23/2 14/7/5/2 29/15/10/5
WI 10 6 1  2595/1804/864/918 1184/1006/535/458 239/185/173/11 152/74/49/23 154/84/53/28
WY 3 3 3  266/145/33/107 117/91/24/64 5/3/2/0 31/15/10/4 18/10/6/3\`;
const blocs = [
  { key: "ncw", name: "Non-college white" }, { key: "cw", name: "College white" },
  { key: "black", name: "Black" }, { key: "latino", name: "Hispanic/Latino" },
  { key: "other", name: "Asian/other" },
];
const states = presets.trim().split("\\n").map((line) => {
  const [st, ev, col, row, ...g] = line.trim().split(/\\s+/);
  return { st, ev: +ev, col: +col, row: +row, g: g.map((s) => s.split("/").map(Number)) };
});
// National starting point per bloc: Republican share of its votes, and turnout.
blocs.forEach((b, k) => {
  const [C, T, D, R] = [0, 1, 2, 3].map((j) => d3.sum(states, (s) => s.g[k][j]));
  Object.assign(b, { r0: R / T, d0: D / T, t0: T / C, third: 1 - (R + D) / T });
});

// 538's model: a bloc's national shift moves the bloc in every state in proportion.
// Returns one row per state for the map.
function tally(answers) {
  return states.map((s) => {
    let d = 0, r = 0, t = 0;
    blocs.forEach((b, k) => {
      const [C, T, D, R] = s.g[k];
      if (!T) return;
      const a = answers[k], dv = a.vote / 100 - b.r0, dt = a.turnout / 100 - b.t0;
      const shift = dv >= 0 ? dv / b.d0 : dv / b.r0;
      const lift = dt >= 0 ? dt / (1 - b.t0) : dt / b.t0;
      const tr = T / C, voters = (tr + (lift >= 0 ? lift * (1 - tr) : lift * tr)) * C;
      const dShare = D / T - (shift >= 0 ? shift * D / T : shift * R / T);
      d += dShare * voters; r += ((D + R) / T - dShare) * voters; t += voters;
    });
    return { state: s.st, col: s.col, row: 7 - s.row, ev: s.ev, voters: Math.round(t), dem: d / t, rep: r / t };
  });
}

const BLUE = "#008fd5", RED = "#ff2700";
const pct = (v) => Math.round(v) + "%";
// One panel per bloc: x is the Republican share of the bloc's vote, y its turnout.
const panels = blocs.map((b) => Elicit({
  width: 150, height: 170,
  margins: { top: 40, right: 36, bottom: 30, left: 34 },
  data: [{ bloc: b.name, vote: +(b.r0 * 100).toFixed(1), turnout: +(b.t0 * 100).toFixed(1) }],
  schema: {
    bloc: { type: "categorical" },
    vote: { type: "quantitative", domain: [0, 100] },
    turnout: { type: "quantitative", domain: [0, 100] },
  },
  constraints: [clamp({ field: ["vote", "turnout"] }), snap({ field: ["vote", "turnout"], step: 1 })], //! whole percentages, inside the panel
  axes: {
    x: { tickValues: [0, 50, 100], tickFormat: (v) => (v === 50 ? "" : "100%"), title: "◀ VOTE ▶", fontSize: 9 },
    y: { tickValues: [0, 50, 100], tickFormat: (v) => (v === 50 ? "" : v + "%"), title: "TURNOUT", fontSize: 9 },
  },
  guides: [
    guides.region({ x: [0, 50], fill: BLUE, opacity: 0.18 }),
    guides.region({ x: [50, 100], fill: RED, opacity: 0.18 }),
    // 538's crosshair: a stem to the top label, an arm to the right label.
    guides.custom(({ data, scales, width }) => {
      const d = data[0], x = scales.x(d.vote), y = scales.y(d.turnout);
      const dem = (1 - b.third) * 100 - d.vote;
      const label = d.vote >= dem ? pct(d.vote) + "R" : pct(dem) + "D";
      return [
        { type: "line", x1: x, y1: 0, x2: x, y2: y, stroke: "#3c3c3c", strokeWidth: 2 },
        { type: "line", x1: x, y1: y, x2: width, y2: y, stroke: "#3c3c3c", strokeWidth: 2 },
        { type: "text", x: width / 2, y: -26, text: b.name.toUpperCase(), textAnchor: "middle", fontSize: 10, fill: "#222" },
        { type: "text", x, y: -5, text: label, textAnchor: "middle", fontSize: 11, fontWeight: 700, fill: "#222" },
        { type: "text", x: width + 4, y: y + 4, text: pct(d.turnout), textAnchor: "start", fontSize: 11, fontWeight: 700, fill: "#222" },
      ];
    }),
  ],
  marks: [
    point({
      size: 7, fill: "#3c3c3c",
      channels: { x: { field: "vote" }, y: { field: "turnout" } },
      edits: [move({ channels: ["x", "y"] })], //! drag the bloc's vote share and turnout at once
    }),
  ],
}));

// The derived view: one tile per state, recomputed from the five answers.
const shade = (d) => {
  const lead = Math.max(d.dem, d.rep) / (d.dem + d.rep);
  return d3.interpolateRgb("#f0f0f0", d.dem > d.rep ? BLUE : RED)(Math.min(1, 0.1 + (lead - 0.5) * 2.2));
};
const map = Elicit({
  width: 440, height: 316, axes: false,
  margins: { top: 64, right: 20, bottom: 10, left: 20 },
  data: tally(panels.map((p) => p.getData()[0])),
  schema: {
    state: { type: "categorical" },
    col: { type: "quantitative", domain: [-0.5, 11.5] },
    row: { type: "quantitative", domain: [-0.5, 7.5] },
    ev: { type: "quantitative" }, voters: { type: "quantitative" }, dem: { type: "quantitative" }, rep: { type: "quantitative" },
  },
  guides: [
    guides.custom(({ data, width }) => { //! electoral votes and popular vote, read off the derived rows
      const evD = d3.sum(data, (d) => (d.dem > d.rep ? d.ev : 0)), evR = 538 - evD;
      const votes = d3.sum(data, (d) => d.voters);
      const popD = d3.sum(data, (d) => d.dem * d.voters) / votes, popR = d3.sum(data, (d) => d.rep * d.voters) / votes;
      const side = (x, anchor, name, ev, pop, colour, won) => [
        { type: "text", x, y: -44, text: name, textAnchor: anchor, fontSize: 17, fill: "#222" },
        { type: "text", x, y: -26, text: "Electoral votes: " + ev + (won ? " ✓" : ""), textAnchor: anchor, fontSize: 11, fontWeight: won ? 700 : 400, fill: won ? colour : "#333" },
        { type: "text", x, y: -12, text: "Popular vote: " + (pop * 100).toFixed(1) + "%", textAnchor: anchor, fontSize: 11, fill: "#333" },
      ];
      return [
        ...side(0, "start", "CLINTON", evD, popD, BLUE, evD >= 270),
        ...side(width, "end", "TRUMP", evR, popR, RED, evR >= 270),
      ];
    }),
  ],
  marks: [
    rect({ width: 36, height: 36, fill: shade, channels: { x: { field: "col" }, y: { field: "row" } } }),
    text({ text: (d) => d.state, fontSize: 10, fontWeight: 600, fill: "#333", channels: { x: { field: "col" }, y: { field: "row" } } }),
  ],
});

mount(map);
const strip = mount(h("div", { style: "display:flex;flex-wrap:wrap;justify-content:center;gap:4px 10px" }));
panels.forEach((p) => {
  mount(p);
  strip.append(p.dom());
  p.on("change", () => map.setData(tally(panels.map((q) => q.getData()[0])))); //! every drag re-runs the model and redraws the map
});`,
  },
  needs: [],
  gaps: [
    'One tile map coloured by margin, the layout 538 used on narrow screens; the desktop page shows two maps and flips each tile between them.',
    'Maine and Nebraska are winner-take-all here; 538 allocates their congressional-district votes separately. The defaults still give 332 to 206.',
    'The third-party slider, the split of white voters by gender, the per-state table and the shareable link are left out.',
    'The five panels wrap three and two to fit the column; the original sets them in one row.',
  ],
});

VIBE.add({
  id: 'row-14',
  status: 'full',
  verdict: 'The four lettered labels are clickable `geoPoint`s on a real map of South and Southeast Asia; one click records the answer, locks the map, rings Singapore and says whether you were right.',
  original: {
    availability: 'archived',
    links: [
      { label: 'Wayback Machine, 23 Apr 2018', url: 'https://web.archive.org/web/20180423125036/https://www.nytimes.com/interactive/2018/04/23/learning/23SingaporeGeographyQuizLN.html' },
      { label: 'Original (NYT Learning Network; blocks automated access)', url: 'https://www.nytimes.com/interactive/2018/04/23/learning/23SingaporeGeographyQuizLN.html' },
    ],
    summary: 'A Learning Network “Country of the Week” quiz compiled by Michael Gonchar. It opens with a map question, “Click or tap on Singapore.”, over a map of South and Southeast Asia with four lettered places: A (Sri Lanka), B (Singapore), C (Brunei) and D (Taiwan). Four multiple-choice questions on language, geography, politics and the economy follow, then a score.',
    steps: [
      'You click or tap one of the four letters on the map.',
      'The answer locks and the piece responds: “Well done!”, or “No, that’s Sri Lanka.” (Brunei, Taiwan).',
      'A line reports what share of readers answered correctly.',
      'Four text multiple-choice questions follow, then “[N] out of [M]”.',
    ],
    answers: 'B is Singapore. The archived page carries the quiz’s own feedback strings; the share of readers who answered correctly was filled in live and is not archived.',
  },
  strategy: {
    elicits: 'A category: which of four labelled places you believe is Singapore.',
    technique: 'A click on a map, with the options drawn as letters on the places themselves. Feedback is immediate ground truth plus a crowd statistic.',
    inElicit: 'The options are rows with a `lon`/`lat` and a `pick` column; a `geoPoint` encodes `pick` as its fill and carries `cycle()`, so a click writes `"yes"`. `geoBasemap` draws world-atlas countries under a Mercator projection fitted to the region, and a `geoPolygon` tints the four countries. The click’s `change` moves the chart to stage 1, which disables the `cycle` edit, and sets a ring row on Singapore.',
  },
  recreation: {
    title: 'Click a label',
    question: 'Click or tap on Singapore.',
    try: 'Click one of the four lettered labels.',
    why: 'The answer lives in the data: `cycle()` on the label’s `fill` channel turns `pick` from `"no"` to `"yes"`. The edit carries `stage: 0`, so `nextStage()` in the change handler locks the map after one click, as the quiz does.',
    uses: ['geoPoint', 'cycle()', 'geoBasemap', 'geoPolygon', 'nextStage()'],
    code: `const world = await fetchData("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json");
const countries = topojson.feature(world, world.objects.countries);
const shapeOf = (name) => countries.features.find((f) => f.properties.name === name).geometry;
// The four answers the quiz labels on its map.
const answers = [
  { letter: "A", name: "Sri Lanka", lon: 80.7, lat: 7.9 },
  { letter: "B", name: "Singapore", lon: 103.82, lat: 1.36 },
  { letter: "C", name: "Brunei", lon: 114.7, lat: 4.6 },
  { letter: "D", name: "Taiwan", lon: 121.0, lat: 23.8 },
];
const NAVY = "#053e69";

const chart = mount(Elicit({
  width: 440, height: 440, stage: 0,
  margins: { top: 0, right: 0, bottom: 0, left: 0 },
  projection: { type: "mercator", domain: { type: "MultiPoint", coordinates: [[68, -12], [128, 41]] } },
  data: answers.map((a) => ({ ...a, geometry: shapeOf(a.name), pick: "no", ringLon: null, ringLat: null })),
  schema: {
    letter: { type: "categorical" }, name: { type: "categorical" }, geometry: { type: "categorical" },
    lon: { type: "quantitative", domain: [-180, 180] }, lat: { type: "quantitative", domain: [-90, 90] },
    pick: { type: "categorical", domain: ["no", "yes"] }, //! the answer: which label you clicked
    ringLon: { type: "quantitative", domain: [-180, 180] }, ringLat: { type: "quantitative", domain: [-90, 90] },
  },
  marks: [
    geoBasemap({ geojson: { type: "Sphere" }, fill: "#d7e0e7" }),
    geoBasemap({ geojson: countries, fill: "#faf6ec", stroke: "#a8a283", strokeWidth: 0.6 }),
    geoPolygon({ fill: "#f4c9a4", stroke: "#e0a77a", strokeWidth: 0.6, channels: { geometry: { field: "geometry", scale: null } } }),
    // The truth: a green ring, drawn once its columns are set.
    geoPoint({ size: 15, fill: "none", stroke: "#2e8540", strokeWidth: 3, channels: { lon: { field: "ringLon" }, lat: { field: "ringLat" } } }),
    geoPoint({
      size: 11, stroke: NAVY, strokeWidth: 1.5,
      channels: {
        lon: { field: "lon" }, lat: { field: "lat" },
        fill: { field: "pick", scale: { range: ["#ffffff", NAVY] }, edit: cycle({ stage: 0 }) }, //! a click marks this label as your answer
      },
    }),
    geoText({ text: (d) => d.letter, fontSize: 12, fontWeight: 700, fill: (d) => (d.pick === "yes" ? "#fff" : NAVY), channels: { lon: { field: "lon" }, lat: { field: "lat" } } }),
  ],
}));

const note = mount(ui.note(""));
chart.on("change", (rows) => {
  const picked = rows.find((d) => d.pick === "yes");
  if (!picked || chart.getStage() > 0) return;
  chart.nextStage(); //! one click answers: the labels lock and the truth appears
  chart.set("ringLon", 103.82, { index: 1 });
  chart.set("ringLat", 1.36, { index: 1 });
  note.innerHTML = ui.md(picked.name === "Singapore"
    ? "**Well done!** Singapore is B, at the tip of the Malay Peninsula."
    : "**No, that’s " + picked.name + ".** Singapore is B, at the tip of the Malay Peninsula.")
    + "<br><small>68% of readers answered this correctly. (Illustrative: the real figure is not archived.)</small>";
});`,
  },
  variants: [{
    title: 'Pin and ring',
    question: 'Where is Singapore? Drop the pin on it, and size the ring to show how far off you might be.',
    try: 'Drag the pin; drag the ring’s edge; then press Guess.',
    why: 'Without labelled options the answer becomes a location. `edit.geo.move()` inverts the pointer through the projection to a longitude and latitude, and `resize()` on the ring writes a radius in kilometres, scaled from the same fitted projection, so the reveal can say whether Singapore fell inside it.',
    uses: ['edit.geo.move()', 'resize()', 'geoPoint', 'clamp()'],
    code: `const world = await fetchData("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json");
const countries = topojson.feature(world, world.objects.countries);
const view = { type: "MultiPoint", coordinates: [[68, -12], [128, 41]] };
// Pixels per km near the equator, from the same fitted projection the chart uses.
const merc = d3.geoMercator().fitSize([440, 440], view);
const pxPerKm = (merc([104, 1])[0] - merc([103, 1])[0]) / 111.32;
const NAVY = "#053e69";

const chart = mount(Elicit({
  width: 440, height: 440, stage: 0,
  margins: { top: 0, right: 0, bottom: 0, left: 0 },
  projection: { type: "mercator", domain: view },
  data: [{ lon: 98, lat: 15, km: 600, trueLon: null, trueLat: null }],
  schema: {
    lon: { type: "quantitative", domain: [-180, 180] }, lat: { type: "quantitative", domain: [-90, 90] },
    km: { type: "quantitative", domain: [0, 2000] },
    trueLon: { type: "quantitative", domain: [-180, 180] }, trueLat: { type: "quantitative", domain: [-90, 90] },
  },
  constraints: [clamp({ field: "km", min: 50, max: 2000 })],
  marks: [
    geoBasemap({ geojson: { type: "Sphere" }, fill: "#d7e0e7" }),
    geoBasemap({ geojson: countries, fill: "#faf6ec", stroke: "#a8a283", strokeWidth: 0.6 }),
    geoPoint({
      fill: NAVY, fillOpacity: 0.12, stroke: NAVY, strokeWidth: 1.5,
      channels: {
        lon: { field: "lon" }, lat: { field: "lat" },
        size: { field: "km", scale: { range: [0, 2000 * pxPerKm] }, edit: resize({ stage: 0 }) }, //! the ring is how far off you might be, in km
      },
    }),
    geoPoint({
      size: 6, fill: NAVY, stroke: "#fff", strokeWidth: 1.5,
      channels: { lon: { field: "lon" }, lat: { field: "lat" } },
      edits: [edit.geo.move({ stage: 0 })], //! drag the pin through the projection
    }),
    geoPoint({ size: 6, fill: "#2e8540", stroke: "#fff", strokeWidth: 1.5, channels: { lon: { field: "trueLon" }, lat: { field: "trueLat" } } }),
    geoText({ text: () => "Singapore", fontSize: 12, fontWeight: 700, fill: "#2e8540", dy: -12, channels: { lon: { field: "trueLon" }, lat: { field: "trueLat" } } }),
  ],
}));

const note = mount(ui.note(""));
mount(ui.row(ui.button("Guess", () => {
  if (chart.getStage() > 0) return;
  chart.set("trueLon", 103.82);
  chart.set("trueLat", 1.36);
  chart.nextStage(); //! the reveal: pin and ring lock, Singapore appears
  const g = chart.getData()[0];
  const off = Math.round(d3.geoDistance([g.lon, g.lat], [103.82, 1.36]) * 6371);
  note.innerHTML = ui.md("Your pin is **" + off.toLocaleString() + " km** from Singapore. "
    + (off <= g.km ? "It is inside your ring of " : "It is outside your ring of ") + Math.round(g.km) + " km.");
})));`,
  }],
  needs: ['social-feedback'],
  gaps: [
    'Only the map question is recreated; the four text multiple-choice questions and the score are the page around it.',
    'The share of readers who answered correctly is an illustrative figure, labelled as such: the real one was filled in live and is not archived.',
    'world-atlas’s 50m countries stand in for the NYT basemap: no rivers, and Singapore is a speck at this scale, so the click target is the label, as in the original.',
    'The letters sit in circles; the original sets them as underlined serif letters.',
  ],
});

VIBE.add({
  id: 'row-20',
  status: 'full',
  verdict: 'Characters start in a strip above a good–evil, ugly–beautiful quadrant chart; you drag each onto it, and the reveal draws the readers’ consensus from the piece’s own data beside each pick.',
  original: {
    availability: 'archived',
    links: [
      { label: 'Wayback Machine, 9 Aug 2017', url: 'https://web.archive.org/web/20170809171616/https://www.nytimes.com/interactive/2017/08/09/upshot/game-of-thrones-chart.html' },
      { label: 'Readers’ consensus per character (the piece’s mean.json)', url: 'https://static01.nyt.com/newsgraphics/2017/07/17/got-matrix/cc5ea0f11921bb19f826d105cfdb67fe844f022e/mean.json' },
      { label: 'Original (NYT Upshot; blocks automated access)', url: 'https://www.nytimes.com/interactive/2017/08/09/upshot/game-of-thrones-chart.html' },
    ],
    summary: 'The Upshot asks readers to plot 50 “Game of Thrones” characters in two dimensions: moral goodness (Evil to Good) and external beauty (Ugly to Beautiful). A strip of portraits sits above a square chart with arrowed axes through its centre; you drag each portrait onto the chart, tap to place it, or swipe to skip. The article then shows the aggregate of readers and 338 fans surveyed by Morning Consult, and each character’s spread of answers with your pick.',
    steps: [
      'The current character is enlarged in the strip; you drag it onto the chart or tap a spot to place it.',
      'The next character comes up; swiping up skips one.',
      '“Thanks for playing!” The chart shows every character at the readers’ consensus.',
      'Below, a small chart per character shows the distribution of answers, labelled “Consensus” and “Your pick”.',
    ],
    answers: 'The consensus positions come from the piece’s own `mean.json` (moral 0 = evil to 1 = good; physical 0 = beautiful to 1 = ugly). For example Daenerys sits at 0.885 moral, 0.025 physical; Cersei at 0.357, 0.428; Ramsay at 0.183, 0.500.',
  },
  strategy: {
    elicits: 'A 2-D point estimate per character: how good and how beautiful you judge them, on two bipolar scales.',
    technique: 'Drag-and-drop from a strip onto a quadrant scatter plot (or tap to place). Feedback is social: the crowd’s average and spread for each character.',
    inElicit: 'One chart holds the strip and the quadrants: rows above `y = 1` are unplaced. A `point` with `move` on both axes drags a character, and `clamp` on `y` turns any drag out of the strip into a landing on the chart. A `guides.custom` draws the shaded square, the grid and the four arrowed labels. The reveal sets each placed row’s `cx`/`cy`, which a second `point` and the guide draw as the consensus with a link to your pick.',
  },
  recreation: {
    title: 'Drag onto quadrants',
    question: 'Where does each character belong: good or evil, beautiful or ugly?',
    try: 'Drag characters from the strip onto the chart, then press Show the consensus.',
    why: 'Placement is a position, so `move({ channels: ["x", "y"], mode: "relative" })` writes both columns. The strip is part of the same plane, above the quadrant’s domain; the `clamp` on `y` repairs the first drag into the square, which is what “dropping onto the chart” means here.',
    uses: ['move()', 'clamp()', 'guides.custom', 'nextStage()'],
    code: `// Twelve of the piece's 50 characters, with the readers' consensus from the piece's
// own data (moral: 0 evil → 1 good; physical: 0 beautiful → 1 ugly).
const cast = [
  ["Cersei", 0.357, 0.428], ["Daenerys", 0.885, 0.025], ["Jon", 0.781, 0.349],
  ["Tyrion", 0.677, 0.442], ["Arya", 0.799, 0.416], ["Jaime", 0.597, 0.274],
  ["Sansa", 0.783, 0.192], ["Hodor", 0.735, 0.615], ["Ramsay", 0.183, 0.500],
  ["Brienne", 0.681, 0.430], ["Littlefinger", 0.397, 0.385], ["The Hound", 0.530, 0.599],
];
const crowd = new Map(cast.map(([name, moral, physical]) => [name, { x: moral * 2 - 1, y: 1 - physical * 2 }]));
const PINK = "#d81b8c", INK = "#2B5D87";
// The strip above the chart: y > 1 is "not placed yet".
const seed = cast.map(([name], i) => ({
  name, x: -0.82 + (i % 6) * 0.328, y: i < 6 ? 1.42 : 1.17, cx: null, cy: null,
}));

const chart = mount(Elicit({
  width: 440, height: 560, stage: 0, axes: false,
  margins: { top: 14, right: 12, bottom: 18, left: 12 },
  data: seed,
  schema: {
    name: { type: "categorical" },
    x: { type: "quantitative", domain: [-1, 1] },
    y: { type: "quantitative", domain: [-1, 1.55] },
    cx: { type: "quantitative", domain: [-1, 1] },
    cy: { type: "quantitative", domain: [-1, 1] },
  },
  constraints: [clamp({ field: "x", min: -0.94, max: 0.94 }), clamp({ field: "y", min: -0.94, max: 0.96 })], //! a drag out of the strip lands on the chart
  guides: [
    guides.custom(({ scales, data }) => {
      const X = scales.x, Y = scales.y, t = (x, y, text, anchor = "middle", fill = "#222") =>
        ({ type: "text", x: X(x), y: Y(y), text, textAnchor: anchor, fontSize: 13, fill });
      const lines = [-2, -1, 1, 2].flatMap((k) => [
        { type: "line", x1: X(k / 3), x2: X(k / 3), y1: Y(-1), y2: Y(1), stroke: "#e4e4e4" },
        { type: "line", x1: X(-1), x2: X(1), y1: Y(k / 3), y2: Y(k / 3), stroke: "#e4e4e4" },
      ]);
      const empty = data.every((d) => d.y > 1);
      return [
        { type: "rect", x: X(-1), y: Y(1), width: X(1) - X(-1), height: Y(-1) - Y(1), fill: "#f6f6f6" },
        ...lines,
        { type: "line", x1: X(0), x2: X(0), y1: Y(-0.9), y2: Y(0.9), stroke: "#555" },
        { type: "line", x1: X(-0.74), x2: X(0.74), y1: Y(0), y2: Y(0), stroke: "#555" },
        t(0, 0.93, "↑ Beautiful"), t(0, -0.97, "Ugly ↓"),
        t(-0.98, -0.02, "← Evil", "start"), t(0.98, -0.02, "Good →", "end"),
        ...(empty ? [t(0, 0.45, "Drag characters onto the chart", "middle", PINK)] : []),
        // After the reveal: a line from your pick to the readers' consensus.
        ...data.filter((d) => d.cx != null).map((d) =>
          ({ type: "line", x1: X(d.x), y1: Y(d.y), x2: X(d.cx), y2: Y(d.cy), stroke: PINK, strokeWidth: 1.5 })),
      ];
    }),
  ],
  marks: [
    point({ size: 6, fill: PINK, channels: { x: { field: "cx" }, y: { field: "cy" } } }),
    point({
      size: 14, fill: INK, stroke: "#fff", strokeWidth: 1.5,
      channels: { x: { field: "x" }, y: { field: "y" } },
      edits: [move({ channels: ["x", "y"], mode: "relative", stage: 0 })], //! drag a character from the strip onto the quadrants
    }),
    text({ text: (d) => d.name.replace("The ", "").slice(0, 2), fontSize: 10, fontWeight: 700, fill: "#fff", channels: { x: { field: "x" }, y: { field: "y" } } }),
    text({ text: (d) => d.name, fontSize: 9, fill: "#444", dy: 21, channels: { x: { field: "x" }, y: { field: "y" } } }),
  ],
}));

const note = mount(ui.note(""));
mount(ui.row(ui.button("Show the consensus", () => {
  if (chart.getStage() > 0) return;
  const rows = chart.getData();
  const shown = rows.some((d) => d.y <= 1) ? rows.filter((d) => d.y <= 1) : rows;
  shown.forEach((d) => {
    const c = crowd.get(d.name), index = rows.indexOf(d);
    chart.set("cx", c.x, { index }); //! the reveal: each consensus point appears beside your pick
    chart.set("cy", c.y, { index });
  });
  chart.nextStage();
  note.innerHTML = ui.md("Pink dots are where readers and surveyed fans put each character, on average.");
})));`,
  },
  variants: [{
    title: 'Box what fits',
    question: 'Where does Jaime Lannister belong? Draw a box around every place you would accept.',
    try: 'Drag the box’s edges or corners, or its middle; then press Show the consensus.',
    why: 'A point hides how sure you are. `brushRect()` turns the answer into a range on both axes at once (`x1`–`x2` for morality, `y1`–`y2` for beauty), and the reveal checks whether the readers’ average falls inside it.',
    uses: ['brushRect()', 'clamp()', 'guides.custom'],
    code: `// Readers' consensus for Jaime Lannister, from the piece's data, on a −1…1 frame.
const consensus = { x: 0.194, y: 0.452 };
const PINK = "#d81b8c", INK = "#2B5D87";

const chart = mount(Elicit({
  width: 440, height: 440, stage: 0, axes: false,
  margins: { top: 12, right: 12, bottom: 12, left: 12 },
  data: [{ who: "Jaime", x1: -0.3, x2: 0.3, y1: -0.3, y2: 0.3, cx: null, cy: null }],
  schema: {
    who: { type: "categorical" },
    x1: { type: "quantitative", domain: [-1, 1] }, x2: { type: "quantitative", domain: [-1, 1] },
    y1: { type: "quantitative", domain: [-1, 1] }, y2: { type: "quantitative", domain: [-1, 1] },
    cx: { type: "quantitative", domain: [-1, 1] }, cy: { type: "quantitative", domain: [-1, 1] },
  },
  constraints: [clamp({ field: ["x1", "x2", "y1", "y2"] })],
  guides: [
    guides.region({ x: [-1, 1], y: [-1, 1], fill: "#f6f6f6", opacity: 1 }),
    guides.custom(({ scales, data }) => {
      const X = scales.x, Y = scales.y, t = (x, y, text, anchor = "middle") =>
        ({ type: "text", x: X(x), y: Y(y), text, textAnchor: anchor, fontSize: 13, fill: "#222" });
      return [
        { type: "line", x1: X(0), x2: X(0), y1: Y(-0.9), y2: Y(0.9), stroke: "#555" },
        { type: "line", x1: X(-0.74), x2: X(0.74), y1: Y(0), y2: Y(0), stroke: "#555" },
        t(0, 0.93, "↑ Beautiful"), t(0, -0.97, "Ugly ↓"),
        t(-0.98, -0.02, "← Evil", "start"), t(0.98, -0.02, "Good →", "end"),
        { ...t((data[0].x1 + data[0].x2) / 2, Math.max(data[0].y1, data[0].y2) - 0.08, "Jaime"), fill: INK, fontWeight: 700 },
      ];
    }),
  ],
  marks: [
    rect({
      fill: INK, fillOpacity: 0.25, stroke: INK,
      channels: { x1: { field: "x1" }, x2: { field: "x2" }, y1: { field: "y1" }, y2: { field: "y2" } },
      edits: [brushRect({ edgeInset: 12, stage: 0 })], //! drag an edge to widen what you would accept, the middle to move it
    }),
    point({ size: 7, fill: PINK, channels: { x: { field: "cx" }, y: { field: "cy" } } }),
  ],
}));

const note = mount(ui.note(""));
mount(ui.row(ui.button("Show the consensus", () => {
  if (chart.getStage() > 0) return;
  chart.set("cx", consensus.x);
  chart.set("cy", consensus.y);
  chart.nextStage(); //! the reveal: the readers' average appears, and the box locks
  const d = chart.getData()[0];
  const inside = consensus.x >= Math.min(d.x1, d.x2) && consensus.x <= Math.max(d.x1, d.x2)
    && consensus.y >= Math.min(d.y1, d.y2) && consensus.y <= Math.max(d.y1, d.y2);
  note.innerHTML = ui.md("The pink dot is where readers put Jaime, on average: it is **" + (inside ? "inside" : "outside") + "** your box.");
})));`,
  }],
  needs: ['social-feedback'],
  gaps: [
    'Twelve of the 50 characters, shown by initials and first names; the original uses HBO portraits.',
    'Only drag places a character; “tap to place” and “swipe to skip” are left out, and all twelve wait in the strip at once.',
    'The consensus is the piece’s real average, loaded as static data; the per-character distributions (contours) are not drawn.',
  ],
});

VIBE.add({
  id: 'row-21',
  status: 'partial',
  verdict: 'You pick one of nine heartland maps in a 3 × 3 grid of `geoPolygon` cards and see illustrative reader tallies; two maps are county surfaces from public data and one is the Census Midwest, but six are state-level stand-ins for the piece’s county and blurred-region maps.',
  original: {
    availability: 'archived',
    links: [
      { label: 'Wayback Machine, 4 Jan 2017', url: 'https://web.archive.org/web/20170104131908/http://www.nytimes.com/interactive/2017/01/03/upshot/where-is-americas-heartland-pick-your-map.html' },
      { label: 'Original (NYT Upshot; blocks automated access)', url: 'https://www.nytimes.com/interactive/2017/01/03/upshot/where-is-americas-heartland-pick-your-map.html' },
      { label: 'Heartland Forward: the top map drew only 22%', url: 'https://heartlandforward.org/research/perspectives-on-defining-the-american-heartland/' },
      { label: '2016 county results used for “Trump’s America” (via jsDelivr)', url: 'https://github.com/tonmcg/US_County_Level_Election_Results_08-20' },
    ],
    summary: 'Emily Badger and Kevin Quealy ask readers, before reading further, which of nine maps best describes the heartland. The maps define it as the Midwest, far from the coasts, the breadbasket, manufacturing America, German-settled America, predominantly white America, Trump’s America, baseball’s Central divisions, and a television taste test. You pick one and press “Count my vote!”; the article then walks through each map with the share of readers who chose it.',
    steps: [
      'You read the prompts (big cities? state lines? Texas? Pennsylvania?) and click one of nine maps.',
      'You press “Count my vote!”; “Thanks for your vote!” unlocks the article.',
      '“Here’s how your answer compares with those of other Times readers”: each map returns with “[N]% of Times readers chose this option” and its data.',
    ],
    answers: 'The per-map shares were filled in live and are not archived. Heartland Forward reports that the most popular map drew 22%.',
  },
  strategy: {
    elicits: 'A category: which of nine regional definitions matches your idea of the heartland.',
    technique: 'A single click on one of nine small multiple maps, then a commit button. Feedback is social: the share of readers choosing each.',
    inElicit: 'Each map is a row whose `card` geometry is a rectangle in one identity-projected frame; `geoBasemap` layers draw the nine maps, shifted into their cells from us-atlas’s pre-projected Albers file. `cycle()` on the card’s `fill` writes `pick`, and a `constraints.custom` clears every other pick so one map wins. The button sets each row’s `share` and moves to stage 1, which locks the cards.',
  },
  recreation: {
    title: 'Pick a map',
    question: 'Which of the nine maps below best describes what you think of as the heartland?',
    try: 'Click a map, then press Count my vote!',
    why: '`cycle({ stage: 0 })` on each card’s `fill` channel makes a click write `pick: "yes"`, and the custom constraint repairs the rest to `"no"`, so `getData()` always holds one choice. Basemaps draw beneath data marks, so the cards are near-transparent layers over their maps.',
    uses: ['geoPolygon', 'cycle()', 'constraints.custom', 'geoBasemap', 'geoText', 'nextStage()'],
    code: `// us-atlas's counties, already projected to a 975 × 610 Albers frame.
const us = await fetchData("https://cdn.jsdelivr.net/npm/us-atlas@3/counties-albers-10m.json");
const vote = await fetchData("https://cdn.jsdelivr.net/gh/tonmcg/US_County_Level_Election_Results_08-20@master/2016_US_County_Level_Presidential_Results.csv");
const counties = us.objects.counties.geometries, states = us.objects.states.geometries;
const stateIs = (names) => (g) => names.includes(g.properties.name);
const merge = (geoms) => topojson.merge(us, geoms);

// Counties you must cross to reach the ocean (breadth-first from the coast).
const albers = d3.geoAlbersUsa().scale(1300).translate([487.5, 305]);
const feats = topojson.feature(us, us.objects.counties).features;
const lonlat = feats.map((f) => albers.invert(d3.geoPath().centroid(f)) || [0, 0]);
const use = new Map();
const arcsOf = (g) => (g.type === "Polygon" ? g.arcs.flat() : g.arcs.flat(2));
counties.forEach((g) => arcsOf(g).forEach((a) => use.set(a < 0 ? ~a : a, (use.get(a < 0 ? ~a : a) || 0) + 1)));
const oceanStates = ["23", "33", "25", "44", "09", "36", "34", "10", "24", "51", "37", "45", "13", "12", "01", "28", "22", "48", "06", "41", "53"];
const coastal = counties.map((g, i) => {
  const st = g.id.slice(0, 2), [lon, lat] = lonlat[i];
  if (!oceanStates.includes(st) || !arcsOf(g).some((a) => use.get(a < 0 ? ~a : a) === 1)) return false;
  if (st === "48") return lon > -98 && lat < 30.5;        // Texas: the Gulf, not the Rio Grande
  if (st === "53") return lon < -122;                     // Washington: Puget Sound and the Pacific
  if (st === "23") return !(lat > 44.6 && lon < -69.9);   // Maine: not the Canadian border
  if (st === "36") return lat < 41.6;                     // New York: not the Lakes
  if (st === "06") return lon < -116.2;                   // California: not the desert border
  return true;
});
const hops = counties.map(() => Infinity), queue = [];
coastal.forEach((c, i) => { if (c) { hops[i] = 0; queue.push(i); } });
const near = topojson.neighbors(counties);
while (queue.length) { const i = queue.shift(); near[i].forEach((j) => { if (hops[j] === Infinity) { hops[j] = hops[i] + 1; queue.push(j); } }); }
const lower48 = (g) => !["02", "15", "72"].includes(g.id.slice(0, 2));
const trump = new Map(vote.map((d) => [String(d.combined_fips).padStart(5, "0"), d.per_gop]));

const midwest = ["North Dakota", "South Dakota", "Nebraska", "Kansas", "Minnesota", "Iowa", "Missouri", "Wisconsin", "Illinois", "Michigan", "Indiana", "Ohio"];
// The nine definitions. Two are county maps from public data; the rest are
// state-level stand-ins for the piece's county surfaces (see the gaps).
const maps = [
  { title: "Synonym for “the Midwest”", layers: [
    [merge(states.filter(stateIs(["Montana", "Wyoming", "Oklahoma", "Arkansas", "Kentucky", "West Virginia", "Pennsylvania"]))), 0.4],
    [merge(states.filter(stateIs(midwest))), 1]] },
  { title: "Far from the coasts", layers: [6, 10, 14].map((k, j) =>
    [merge(counties.filter((g, i) => lower48(g) && hops[i] >= k && hops[i] < Infinity)), 0.35 + j * 0.3]) },
  { title: "America’s breadbasket", layers: [[merge(states.filter(stateIs(["North Dakota", "South Dakota", "Nebraska", "Kansas", "Iowa", "Oklahoma", "Texas", "Montana", "Illinois", "Missouri", "Indiana", "Minnesota"]))), 1]] },
  { title: "Home to manufacturing", layers: [[merge(states.filter(stateIs(["Indiana", "Wisconsin", "Michigan", "Iowa", "Ohio", "Kentucky", "Alabama", "Arkansas", "Mississippi", "Tennessee", "South Carolina", "Kansas", "Minnesota", "North Carolina"]))), 1]] },
  { title: "German-settled America", layers: [[merge(states.filter(stateIs(["North Dakota", "South Dakota", "Wisconsin", "Nebraska", "Minnesota", "Iowa", "Kansas", "Ohio", "Pennsylvania", "Indiana", "Missouri", "Wyoming", "Montana"]))), 1]] },
  { title: "Predominantly white", layers: [[merge(states.filter(stateIs(["Vermont", "Maine", "New Hampshire", "West Virginia", "Idaho", "Iowa", "Wyoming", "Montana", "North Dakota", "Kentucky", "Utah", "Nebraska", "Wisconsin", "South Dakota", "Minnesota", "Oregon", "Indiana", "Kansas"]))), 1]] },
  { title: "Trump’s America", layers: [[merge(counties.filter((g) => lower48(g) && trump.get(g.id) > 0.5)), 1]] },
  { title: "Baseball’s Central divisions", layers: [[merge(states.filter(stateIs(["Minnesota", "Wisconsin", "Illinois", "Missouri", "Ohio", "Michigan", "Kansas", "Iowa", "Indiana", "Kentucky", "Nebraska", "North Dakota", "South Dakota"]))), 1]] },
  { title: "A cultural taste test", layers: [[merge(states.filter(stateIs(["Arkansas", "Louisiana", "Mississippi", "Alabama", "Tennessee", "Kentucky", "West Virginia", "Missouri", "Oklahoma", "Indiana", "Ohio", "Iowa", "Kansas"]))), 1]] },
];

// Nine panels in one identity-projected frame: shift each map into its cell.
const CW = 1035, CH = 880, nation = topojson.feature(us, us.objects.nation);
const shift = (geo, dx, dy) => JSON.parse(JSON.stringify(geo), (k, v) =>
  Array.isArray(v) && typeof v[0] === "number" && v.length === 2 ? [v[0] + dx, v[1] + dy] : v);
const borders = topojson.mesh(us, us.objects.states, (a, b) => a !== b);
const scenery = [];
const rows = maps.map((m, k) => {
  const dx = (k % 3) * CW + 30, dy = Math.floor(k / 3) * CH + 210;
  scenery.push(geoBasemap({ geojson: shift(nation, dx, dy), fill: "#eeeeee" }));
  m.layers.forEach(([geo, o]) => scenery.push(geoBasemap({ geojson: shift(geo, dx, dy), fill: "#ffc72c", fillOpacity: o })));
  scenery.push(geoBasemap({ geojson: shift(borders, dx, dy), fill: "none", stroke: "#fff", strokeWidth: 0.5 }));
  const [x0, y0, x1, y1] = [dx - 30, dy - 210, dx - 30 + CW - 40, dy - 210 + CH - 40];
  return {
    map: m.title, pick: "no", share: null,
    card: { type: "Polygon", coordinates: [[[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]]] },
    tx: x0 + 40, ty: y0 + 85,
  };
});

const chart = mount(Elicit({
  width: 440, height: 375, stage: 0,
  margins: { top: 0, right: 0, bottom: 0, left: 0 },
  projection: { type: "identity", domain: { type: "MultiPoint", coordinates: [[0, 0], [3 * CW - 40, 3 * CH - 40]] } },
  data: rows,
  schema: {
    map: { type: "categorical" }, card: { type: "categorical" },
    pick: { type: "categorical", domain: ["no", "yes"] }, //! the answer: the map you pick
    share: { type: "quantitative", domain: [0, 100] },
    tx: { type: "quantitative", domain: [0, 3 * CW] }, ty: { type: "quantitative", domain: [0, 3 * CH] },
  },
  constraints: [
    constraints.custom(({ data, activeIndex, active }) => (active && active.pick === "yes" //! one pick at a time
      ? data.map((d, i) => (i === activeIndex ? d : { ...d, pick: "no" })) : undefined)),
  ],
  marks: [
    geoPolygon({
      strokeWidth: 1.5,
      stroke: (d) => (d.pick === "yes" ? "#222" : "#d0d0d0"),
      channels: {
        geometry: { field: "card", scale: null },
        // Basemaps draw beneath data marks, so the cards are a clear layer on top.
        fill: { field: "pick", scale: { range: ["rgba(255,255,255,0.01)", "rgba(255,199,44,0.12)"] }, edit: cycle({ stage: 0 }) }, //! click a map to pick it
      },
    }),
    ...scenery,
    geoText({ text: (d) => d.map, fontSize: 9, fill: "#333", textAnchor: "start", channels: { lon: { field: "tx" }, lat: { field: "ty" } } }),
    geoText({ text: (d) => (d.share == null ? "" : d.share + "% of readers"), fontSize: 10, fontWeight: 700, fill: "#b8860b", textAnchor: "start", dy: 11, channels: { lon: { field: "tx" }, lat: { field: "ty" } } }),
  ],
}));

// Illustrative shares: the piece's real tallies are not archived (no map passed 22%).
const shares = [22, 18, 9, 8, 6, 7, 10, 9, 11];
mount(ui.row(ui.button("Count my vote!", () => {
  if (!chart.getData().some((d) => d.pick === "yes") || chart.getStage() > 0) return;
  shares.forEach((s, index) => chart.set("share", s, { index })); //! the reveal: how other readers voted
  chart.nextStage();
})));`,
  },
  variants: [{
    title: 'Paint your own',
    question: 'Where is the heartland? Click every state you would include.',
    try: 'Click states to add or drop them, then press Done.',
    why: 'Nine maps limit the answer to nine regions. One `geoPolygon` row per state with `cycle()` on its `fill` lets you draw any region, and the reveal outlines the Census Bureau’s Midwest to compare.',
    uses: ['geoPolygon', 'cycle()', 'nextStage()'],
    code: `const us = await fetchData("https://cdn.jsdelivr.net/npm/us-atlas@3/states-albers-10m.json");
const states = topojson.feature(us, us.objects.states).features
  .filter((f) => !["Alaska", "Hawaii", "Puerto Rico"].includes(f.properties.name));
// The Census Bureau's Midwest, to compare against once you are done.
const midwest = ["North Dakota", "South Dakota", "Nebraska", "Kansas", "Minnesota", "Iowa", "Missouri", "Wisconsin", "Illinois", "Michigan", "Indiana", "Ohio"];

const chart = mount(Elicit({
  width: 440, height: 290, stage: 0,
  margins: { top: 4, right: 4, bottom: 4, left: 4 },
  projection: { type: "identity", domain: { type: "MultiPoint", coordinates: [[0, 0], [975, 610]] } },
  data: states.map((f) => ({ state: f.properties.name, geometry: f.geometry, heartland: "no", census: null })),
  schema: {
    state: { type: "categorical" }, geometry: { type: "categorical" },
    heartland: { type: "categorical", domain: ["no", "yes"] }, //! the answer: in or out, per state
    census: { type: "categorical", domain: ["Midwest"] },
  },
  marks: [
    geoPolygon({
      stroke: "#fff", strokeWidth: 0.8,
      channels: {
        geometry: { field: "geometry", scale: null },
        fill: { field: "heartland", scale: { range: ["#eeeeee", "#ffc72c"] }, edit: cycle({ stage: 0 }) }, //! click a state to add it; click again to drop it
      },
    }),
    // After the reveal: the Census Midwest, outlined.
    geoPolygon({ fill: "none", stroke: (d) => (d.census ? "#222" : "none"), strokeWidth: 1.2, channels: { geometry: { field: "geometry", scale: null } } }),
  ],
}));

const note = mount(ui.note(""));
mount(ui.row(ui.button("Done", () => {
  if (chart.getStage() > 0) return;
  chart.getData().forEach((d, index) => { if (midwest.includes(d.state)) chart.set("census", "Midwest", { index }); });
  chart.nextStage(); //! the reveal: the Census Midwest appears over your map
  const mine = chart.getData().filter((d) => d.heartland === "yes").map((d) => d.state);
  const shared = mine.filter((s) => midwest.includes(s)).length;
  note.innerHTML = ui.md("Your heartland has **" + mine.length + " states**. It includes " + shared + " of the Census Bureau’s 12 Midwestern states (outlined).");
})));`,
  }],
  needs: ['choropleth-variants', 'social-feedback'],
  gaps: [
    '“Far from the coasts” is computed: counties counted inland from the ocean by county adjacency, with hand rules for the land borders. “Trump’s America” uses 2016 county results. Both are close to the original.',
    'The Midwest map is the Census Bureau’s 12 states, exact, with the survey’s fringe states approximated from the screenshot.',
    'Six are state-level stand-ins, chosen from the definitions: farmland, manufacturing jobs, German ancestry, white share, baseball fandom and TV taste. The originals are county surfaces with holes for cities; the county data behind them (USDA, BLS, ACS, Facebook likes) is not on a CDN.',
    'The blurred, feathered regions of the original have no equivalent: `geoBasemap` fills shapes, with no blur.',
    'The reader shares are illustrative (the real tallies are not archived; the top one was 22%).',
    'The article that follows the vote, one map at a time with its data, is left out.',
  ],
  whyNot: 'The elicitation (one pick among nine maps, then a commit) works in Elicit.js. What a reader would notice is the maps themselves: six of the nine are drawn from state sets instead of the original county surfaces and blurred regions, because that county data is not available here and Elicit.js has no blur for a feathered region.',
});

VIBE.add({
  id: 'row-24',
  status: 'full',
  verdict: 'Party bubbles sized by projected seats are dragged into a grey zone that counts your seats against a majority; `layout.dodge` keeps bubbles apart, and the piece’s own verdict on each pair explains the coalition you built.',
  original: {
    availability: 'live',
    links: [
      { label: 'The Guardian, 7 May 2015 (live)', url: 'https://www.theguardian.com/politics/ng-interactive/2015/may/07/election-2015-interactive-coalition-builder' },
      { label: 'Seats and pair verdicts (the piece’s spreadsheet JSON)', url: 'https://interactive.guim.co.uk/spreadsheetdata/1kEJiSPchMy6MCSThHDw5xaA37_LgFxJgTz7dLNhnSEI.json' },
    ],
    summary: 'On polling day 2015 the Guardian (Chia-Jung Apple C Fardel, Carlo Zapponi, Troy Griggs and Seán Clarke) asked readers to build a government from its seat projection: Con 273, Lab 273, SNP 52, LD 27, DUP 9, Ukip 3, PC 3, SDLP 3, Green 1. Party bubbles, sized by seats and showing the leaders, sit above a grey “You have” zone; you drag parties into it, and it counts your seats against a majority. Each pairing gets a verdict and a reason.',
    steps: [
      '“Start by dragging either Labour or Conservatives” into the grey zone.',
      'The zone reads “You have 310 seats (just 16 short of majority)”; bubbles settle at the bottom of the zone.',
      'Adding a party shows how well it matches the others (“This is a match” to “Don’t count on it”), and the leaders’ faces look happy or angry.',
      'Below, “Your coalition” lists your parties, whether the seats make a majority, and the reasoning for every pair.',
    ],
    answers: 'No answer to reveal. The piece counts a majority as 326 in its text (“short of majority”) while the standfirst says 323 “probably” survives a confidence vote. The actual result was Con 331, Lab 232, SNP 56, LD 8, DUP 8, PC 3, SDLP 3, Ukip 1, Green 1.',
  },
  strategy: {
    elicits: 'A cluster: which parties you believe could govern together, built under a seat-count goal.',
    technique: 'Drag bubbles into a zone; a running total and per-pair explanations give feedback. No ground truth: the piece prompts reflection.',
    inElicit: 'Parties are rows with `x`, `y` and a seat count; a `point` sized by a pixel `r` channel carries `move`. Membership is position: a `constraints.custom` writes `inGovt` from `y`, so `getData()` names your coalition. `layout.dodge` pushes bubbles apart, `guides.region` shades the zone and a `guides.custom` sums the seats in it. The pair verdicts are page text on `change`.',
  },
  recreation: {
    title: 'Drag into the zone',
    question: 'Can you form a stable government?',
    try: 'Drag party bubbles down into the grey zone; drag one back out to drop it.',
    why: 'The zone is just a range of `y`, so one `move` edit both places a bubble and changes its membership. The `guides.custom` reads the live rows, so the seat count and “short of majority” follow every drag without any extra state.',
    uses: ['move()', 'layout.dodge()', 'constraints.custom', 'guides.region', 'guides.custom'],
    code: `// The Guardian's projection on polling day, 7 May 2015 (Sinn Féin don't take their seats).
const parties = [
  { party: "con", label: "Con", seats: 273, colour: "#005789", x: 20, y: 80 },
  { party: "lab", label: "Lab", seats: 273, colour: "#E31F26", x: 62, y: 78 },
  { party: "snp", label: "SNP", seats: 52, colour: "#FCDD03", x: 84, y: 90 },
  { party: "libdem", label: "LD", seats: 27, colour: "#FFB900", x: 42, y: 92 },
  { party: "dup", label: "DUP", seats: 9, colour: "#99002e", x: 7, y: 90 },
  { party: "ukip", label: "Ukip", seats: 3, colour: "#7D0069", x: 40, y: 72 },
  { party: "pc", label: "PC", seats: 3, colour: "#868686", x: 93, y: 78 },
  { party: "sdlp", label: "SDLP", seats: 3, colour: "#008587", x: 83, y: 69 },
  { party: "green", label: "Green", seats: 1, colour: "#33A22B", x: 70, y: 95 },
];
// The piece's verdict on every pair, and its reason in one line.
const verdicts = { aa: "This is a match", a: "This is probably a goer", n: "This could work", r: "This isn’t plain sailing", rr: "Don’t count on it" };
const pairs = {
  "con,lab": ["r", "Traditional rivals for swing voters in England."],
  "con,snp": ["rr", "Fundamentally different guiding principles; the SNP pledged to vote down a Tory government."],
  "con,libdem": ["a", "The Lib Dems say they will ally with the largest party, but may be too few this time."],
  "con,green": ["r", "Uneasy bedfellows, despite the ‘greenest government ever’ pledge."],
  "con,ukip": ["a", "Lots in common, but no love lost between the personalities."],
  "con,dup": ["a", "A natural partnership, though the DUP is the less pliant unionist party."],
  "con,pc": ["r", "Radical secessionists and conservative unionists."],
  "con,sdlp": ["rr", "Irish nationalists, republicans and socialists: the Tories are none of those."],
  "lab,snp": ["n", "Similar views on much, but Miliband says he will not do any deal with the SNP."],
  "lab,libdem": ["n", "A natural partnership five years ago, but a lot has happened since."],
  "lab,green": ["a", "Labour are the Greens’ natural partner among the larger parties."],
  "lab,ukip": ["r", "At odds on most substantial matters, above all Europe."],
  "lab,dup": ["r", "Most Labour supporters think of the DUP as essentially Tories."],
  "lab,pc": ["a", "Both broadly leftwing, progressive parties."],
  "lab,sdlp": ["aa", "Traditional partners, in a sort of electoral pact."],
  "snp,libdem": ["n", "Shared interests in social justice and constitutional reform."],
  "snp,green": ["a", "The Greens and the SNP see eye to eye, generally."],
  "snp,ukip": ["rr", "Europe alone would seem an insurmountable barrier."],
  "snp,dup": ["r", "Fundamental differences on the value of the United Kingdom."],
  "snp,pc": ["aa", "Both leftwing, both for independence, never competing for voters."],
  "snp,sdlp": ["aa", "Anti-austerity nationalists who don’t stand against each other."],
  "libdem,green": ["a", "Often after the same voters, but able to cooperate."],
  "libdem,ukip": ["r", "Progressive europhiles and conservative europhobes."],
  "libdem,dup": ["r", "A progressive-traditionalist clash, mostly tonal."],
  "libdem,pc": ["a", "Both reasonably progressive, both keen on constitutional reform."],
  "libdem,sdlp": ["a", "Should be able to work together, aside from austerity."],
  "green,ukip": ["rr", "Ukip is the most openly anti-green of the parties."],
  "green,dup": ["r", "Nothing much driving it, but little obstructing it."],
  "green,pc": ["a", "Both progressive, both environmentally aware."],
  "green,sdlp": ["a", "Anti-austerity leftists with environmental awareness."],
  "ukip,dup": ["a", "Both traditionalist unionist parties, though rivals for votes in Northern Ireland."],
  "ukip,pc": ["r", "Conservative unionists and secessionary progressives."],
  "ukip,sdlp": ["rr", "Contrasting views on Europe, and on nearly everything else."],
  "dup,sdlp": ["r", "Traditional rivals in Northern Ireland, who might agree on the province’s interests."],
  "pc,dup": ["r", "Progressives and traditionalists, who may cooperate as two small parties."],
  "pc,sdlp": ["aa", "Anti-austerity Celtic nationalists who don’t stand against each other."],
};
const ZONE = 58, MAJORITY = 326;
const radius = d3.scaleSqrt().domain([1, 273]).range([13, 30]);

const chart = mount(Elicit({
  width: 440, height: 500, axes: false,
  margins: { top: 12, right: 12, bottom: 12, left: 12 },
  data: parties.map((p) => ({ ...p, r: radius(p.seats), inGovt: false })),
  schema: {
    party: { type: "categorical" }, label: { type: "categorical" }, colour: { type: "categorical" },
    seats: { type: "quantitative" }, r: { type: "quantitative" }, inGovt: { type: "categorical", domain: [false, true] },
    x: { type: "quantitative", domain: [0, 100] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  constraints: [
    clamp({ field: ["x", "y"] }),
    constraints.custom(({ active }) => (active ? { inGovt: active.y < ZONE } : undefined)), //! a party is in your government while it sits in the grey zone
  ],
  layout: [layout.dodge({ gap: 4 })], //! bubbles push each other apart instead of overlapping
  guides: [
    guides.region({ y: [0, ZONE], fill: "#ececec", opacity: 1 }),
    guides.custom(({ data, scales }) => { //! the running total, read off the rows in the zone
      const sum = d3.sum(data, (d) => (d.y < ZONE ? d.seats : 0));
      const top = scales.y(ZONE), left = scales.x(0) + 8;
      return [
        { type: "text", x: left, y: top + 20, text: "You have", fontSize: 15, fontWeight: 700, fill: "#222" },
        { type: "text", x: left, y: top + 46, text: sum + (sum === 1 ? " seat" : " seats"), fontSize: 24, fill: "#222" },
        { type: "text", x: left, y: top + 64, text: sum >= MAJORITY ? "(a majority)" : "(just " + (MAJORITY - sum) + " short of majority)", fontSize: 11, fill: "#999" },
        ...(sum === 0 ? [{ type: "text", x: left, y: scales.y(98), text: "Start by dragging Labour or the Conservatives", fontSize: 11, fill: "#999" }] : []),
      ];
    }),
  ],
  marks: [
    point({
      stroke: "#fff", strokeWidth: 1.5,
      fill: (d) => d.colour,
      channels: { x: { field: "x" }, y: { field: "y" }, size: { field: "r", scale: null } },
      edits: [move({ channels: ["x", "y"], mode: "relative" })], //! drag a party into or out of the zone
    }),
    text({ text: (d) => d.label + " " + d.seats, fontSize: 10, fontWeight: 700, fill: "#333", dy: (d) => d.r + 10, channels: { x: { field: "x" }, y: { field: "y" } } }),
  ],
}));

const note = mount(ui.note(""));
const explain = (rows) => {
  const inside = rows.filter((d) => d.inGovt).map((d) => d.party);
  const lines = [];
  inside.forEach((a, i) => inside.slice(i + 1).forEach((b) => {
    const [mark, why] = pairs[a + "," + b] || pairs[b + "," + a];
    const name = (p) => parties.find((q) => q.party === p).label;
    lines.push("**" + name(a) + " + " + name(b) + ": " + verdicts[mark] + ".** " + why);
  }));
  note.innerHTML = lines.map(ui.md).join("<br>");
};
chart.on("change", explain);`,
  },
  needs: [],
  gaps: [
    'Bubbles are party colours with names; the original shows leaders’ photos, whose expressions turn happy or angry with each pairing.',
    '`layout.dodge` keeps bubbles from overlapping, but nothing pulls them to the floor of the zone the way the original’s force layout does.',
    'Every party can be dragged from the start; the original asks you to begin with Labour or the Conservatives.',
    'Each pair’s reason is a one-line paraphrase of the piece’s text; the verdicts are its own.',
  ],
});
