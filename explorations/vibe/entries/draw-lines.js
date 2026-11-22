// draw-lines.js — "you draw it" trend pieces: rows 12, 13, 15, 16, 22.
// Five pieces, one technique, five builds: a freehand line from nothing (12), a
// line continuing a known record (13, 15), one endpoint on a slope chart (16),
// and a dot that leaves a trail as you drag it (22).

VIBE.add({
  id: 'row-12',
  status: 'full',
  verdict: 'A freehand `edit.line.draw()` over an empty chart, sampled at every income percentile; the button reveals the Chetty curve as grey dots under your line and scores it against an illustrative crowd.',
  original: {
    availability: 'live',
    links: [
      { label: 'Original (NYT, paywalled)', url: 'https://www.nytimes.com/interactive/2015/05/28/upshot/you-draw-it-how-family-income-affects-childrens-college-chances.html' },
      { label: 'Wayback Machine, 29 May 2015', url: 'https://web.archive.org/web/20150529022905/http://www.nytimes.com/interactive/2015/05/28/upshot/you-draw-it-how-family-income-affects-childrens-college-chances.html' },
      { label: 'Data: national statistics by parent income percentile (Opportunity Insights)', url: 'https://opportunityinsights.org/wp-content/uploads/2018/04/Statistics_By_Parent_or_child_Income_Percentile.xlsx' },
    ],
    summary: 'The Upshot gives you an empty chart: parents’ income percentile from the poorest (1st) to the richest (100th) along x, the share of their children who attend college (0–100%) up y. You draw the relationship freehand, left to right. The reveal lays the real curve over your line and tells you how you did.',
    steps: [
      'You press on the empty chart and draw a line across all 100 percentiles.',
      'Once the line reaches the richest end, the page reveals reality: grey dots, one per percentile, under your maroon line, labelled **Your guess** and **Reality**.',
      'A headline grades you (“Not the worst!”), and bullets compare you with other readers (“more accurate than about 55 percent of people who have tried so far”) and point out your biggest miss (“you overestimated … for the very poorest … You guessed around 52 percent”).',
    ],
    answers: 'Share of children who ever attended college at ages 18–21, by parents’ income percentile (Chetty, Hendren, Kline and Saez, 2014): 25% at the 1st percentile, about 58% at the 50th, 94% at the 100th. The crowd comparison came from the NYT’s server; it is not recoverable.',
  },
  strategy: {
    elicits: 'A whole function: the college share (0–100%) at each of 100 income percentiles, i.e. the shape and level of a trend.',
    technique: 'Freehand drawing on a blank, labelled line chart with no anchor point. The reveal overlays the truth on the drawing, then scores it against other readers.',
    inElicit: '`edit.line.draw()` with `samples` at every percentile turns one stroke into 100 rows; drawing again overwrites them. The edit has `stage: 0`, so the button retires it and a stage-gated `guides.custom` draws the real curve and the two labels. The page computes the score from `getData()`.',
  },
  recreation: {
    title: 'Draw it freehand',
    question: 'For children in each income percentile, what share attended college?',
    try: 'Press on the chart and draw a line from the poorest (left) to the richest (right), then press **Show me how I did**.',
    why: '`edit.line.draw()` samples your stroke at the 100 percentiles in `samples`, so the answer is one row per percentile however fast you draw. `into: \'new\'` makes every stroke repaint the percentiles it crosses, so you can redraw any stretch. `stage: 0` on the edit and `nextStage()` on the button freeze the drawing at the reveal, and the reality dots are a guide gated on `stage`, so the answer key never enters `getData()`.',
    uses: ['edit.line.draw()', 'samples', 'into', 'stage', 'guides.custom()', 'nextStage()'],
    code: `// Share of children who attended college at 18–21, by parents' income
// percentile 1..100 (Chetty, Hendren, Kline & Saez 2014).
const reality = [25, 26, 27, 28, 29, 30, 31, 31, 32, 32, 33, 34, 34, 35, 36, 36,
  37, 38, 38, 39, 40, 40, 41, 42, 42, 43, 43, 44, 44, 45, 46, 47, 47, 48, 49, 49,
  50, 51, 51, 52, 52, 53, 53, 54, 54, 55, 56, 56, 57, 58, 58, 59, 59, 61, 61, 61,
  62, 63, 64, 64, 65, 65, 66, 67, 67, 68, 69, 70, 70, 71, 72, 73, 73, 74, 75, 75,
  76, 77, 78, 79, 79, 80, 81, 82, 82, 83, 84, 85, 86, 87, 88, 88, 89, 90, 91, 91,
  92, 93, 93, 94];
const pcts = d3.range(1, 101);
const maroon = '#93355A', grey = '#8a8a8a';
const label = (text, x, y, fill, anchor = 'middle') =>
  ({ type: 'text', text, x, y, fill, fontSize: 13, textAnchor: anchor });

const head = mount(h('h3', { style: 'margin:0;min-height:28px;font:700 22px Georgia,serif;text-align:center' }));
const chart = mount(Elicit({
  width: 460, height: 330, theme: 'nyt', stage: 0,
  margins: { top: 30, right: 22, bottom: 44, left: 40 },
  schema: {
    pct:     { type: 'quantitative', domain: [1, 100] },
    college: { type: 'quantitative', domain: [0, 100] },
  },
  data: [],                                              // nothing seeded: you draw it all
  axes: {
    x: { tickValues: [1, 20, 40, 60, 80, 100], grid: true,
         tickFormat: (d) => d === 1 ? '1st\\nPoorest' : d === 100 ? '100th\\nRichest' : d + 'th' },
    y: { tickValues: [0, 20, 40, 60, 80, 100], tickFormat: (d) => d ? d + '%' : '', grid: true,
         title: 'Percent of children who attended college', titleAngle: 0, titleAnchor: 'end' },
  },
  guides: [
    guides.custom(({ scales, stage, data }) => {                 //! reality appears at the reveal
      if (stage < 1) return [];
      // Each label sits on the side of its line away from the other line.
      const g = (p) => data.find((d) => d.pct === p)?.college ?? reality[p - 1];
      const side = (p, mine, other) => scales.y.encode(mine) + (mine >= other ? -12 : 20);
      return [
        ...reality.map((v, i) => ({ type: 'circle', cx: scales.x.encode(i + 1),
          cy: scales.y.encode(v), r: 2.4, fill: grey })),
        label('Reality', scales.x.encode(75), side(75, reality[74], g(75)), grey),
        label('Your guess', scales.x.encode(25), side(25, g(25), reality[24]), maroon),
      ];
    }),
  ],
  marks: [
    lineY({
      stroke: maroon, strokeWidth: 3, curve: 'catmullRom', handles: 'hit',
      channels: { x: { field: 'pct' }, y: { field: 'college' } },
      edits: [edit.line.draw({ samples: pcts, into: 'new', stage: 0 })],   //! every stroke paints the percentiles it crosses
    }),
  ],
}));

// The page around the chart: grade the drawing, compare it with other readers.
// The crowd is an ILLUSTRATIVE sample of mean errors (percentage points); the
// NYT's real one lived on its server.
const crowd = [5, 6, 7, 8, 8, 9, 10, 10, 11, 12, 12, 13, 14, 15, 16, 17, 19, 21, 24, 28];
const note = ui.note('');
mount(ui.row(ui.button('Show me how I did', () => {
  const drawn = chart.getData().filter((d) => d.college != null);
  if (drawn.length < 90) { note.innerHTML = ui.md('Draw all the way from the **poorest** to the **richest** end first.'); return; }
  chart.nextStage();                                     //! retire the edit, reveal reality
  const err = d3.mean(drawn, (d) => Math.abs(d.college - reality[d.pct - 1]));
  const beat = Math.round(100 * crowd.filter((e) => e > err).length / crowd.length);
  const g1 = Math.round(d3.least(drawn, (d) => d.pct).college);
  head.textContent = err < 6 ? 'Nailed it!' : err < 14 ? 'Not the worst!' : 'Not quite.';
  note.innerHTML = ui.md('You drew a more accurate picture than about **' + beat +
    ' percent** of readers in an illustrative sample. ' +
    (Math.abs(g1 - 25) < 6 ? 'You got the very poorest about right: ' :
      'You ' + (g1 > 25 ? 'over' : 'under') + 'estimated the chances for the very poorest children. ') +
    'In reality, about one in four of them go to college (you guessed around ' + g1 + ' percent).');
})));
mount(note);`,
  },
  variants: [
    {
      title: 'Draw a band',
      question: 'For children in each income percentile, what range of college shares are you fairly sure covers the truth?',
      try: 'Sweep along the top edge to paint the upper bound, then along the bottom edge for the lower bound. Press **Show me how I did**.',
      why: 'Each edge of the `areaY` span carries its own `edit.line.sweep()`, so a stroke near the top paints the upper bound and one near the bottom the lower. `ordering` keeps the low edge under the high one. The reveal counts how many of the 100 real points your band covers.',
      uses: ['areaY', 'edit.line.sweep()', 'ordering()', 'stage'],
      code: `const reality = [25, 26, 27, 28, 29, 30, 31, 31, 32, 32, 33, 34, 34, 35, 36, 36,
  37, 38, 38, 39, 40, 40, 41, 42, 42, 43, 43, 44, 44, 45, 46, 47, 47, 48, 49, 49,
  50, 51, 51, 52, 52, 53, 53, 54, 54, 55, 56, 56, 57, 58, 58, 59, 59, 61, 61, 61,
  62, 63, 64, 64, 65, 65, 66, 67, 67, 68, 69, 70, 70, 71, 72, 73, 73, 74, 75, 75,
  76, 77, 78, 79, 79, 80, 81, 82, 82, 83, 84, 85, 86, 87, 88, 88, 89, 90, 91, 91,
  92, 93, 93, 94];
const maroon = '#93355A';
const knots = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

const chart = mount(Elicit({
  width: 460, height: 320, theme: 'nyt', stage: 0,
  margins: { top: 30, right: 22, bottom: 44, left: 40 },
  schema: {
    pct: { type: 'quantitative', domain: [1, 100] },
    lo:  { type: 'quantitative', domain: [0, 100] },
    hi:  { type: 'quantitative', domain: [0, 100] },
  },
  data: knots.map((pct) => ({ pct, lo: 30, hi: 70 })),   // a wide band to start from
  constraints: [ordering({ field: ['lo', 'hi'] })],     //! the low edge stays under the high one
  axes: {
    x: { tickValues: [1, 20, 40, 60, 80, 100], grid: true,
         tickFormat: (d) => d === 1 ? '1st\\nPoorest' : d === 100 ? '100th\\nRichest' : d + 'th' },
    y: { tickValues: [0, 20, 40, 60, 80, 100], tickFormat: (d) => d ? d + '%' : '', grid: true,
         title: 'Percent of children who attended college', titleAngle: 0, titleAnchor: 'end' },
  },
  guides: [
    guides.custom(({ scales, stage }) => stage < 1 ? [] : reality.map((v, i) => ({
      type: 'circle', cx: scales.x.encode(i + 1), cy: scales.y.encode(v), r: 2.4, fill: '#8a8a8a' }))),
  ],
  marks: [
    areaY({
      fill: maroon, fillOpacity: 0.3, stroke: 'none', curve: 'monotoneX', handleColor: maroon,
      channels: {
        x: { field: 'pct' },
        y1: { field: 'lo', edit: edit.line.sweep({ stage: 0 }) },   //! paint the lower bound
        y2: { field: 'hi', edit: edit.line.sweep({ stage: 0 }) },   //! paint the upper bound
      },
    }),
  ],
}));

const note = ui.note('');
mount(ui.row(ui.button('Show me how I did', () => {
  chart.nextStage();
  const band = chart.getData();
  const at = (f, p) => d3.scaleLinear(band.map((d) => d.pct), band.map((d) => d[f]))(p);
  const inside = reality.filter((v, i) => v >= at('lo', i + 1) && v <= at('hi', i + 1)).length;
  const width = d3.mean(band, (d) => d.hi - d.lo);
  note.innerHTML = ui.md('Your band covers **' + inside + ' of 100** percentiles, with an average width of ' +
    Math.round(width) + ' points. A narrow band that still covers most dots is the goal.');
})));
mount(note);`,
    },
  ],
  needs: ['social-feedback'],
  gaps: [
    'The “better than X% of readers” line compares you with a static, illustrative sample of 20 errors, not the readers the NYT collected.',
    'The NYT smoothed the drawn line and graded it with its own error measure; this uses the mean absolute gap over the 100 percentiles.',
  ],
});

VIBE.add({
  id: 'row-13',
  status: 'full',
  verdict: 'The Bush years are context rows; `edit.line.draw()` samples your stroke at 2009–2016 and continues the red record from 2008, and the button, enabled once every year is drawn, reveals the real Obama-years line.',
  original: {
    availability: 'live',
    links: [
      { label: 'Original (NYT, paywalled)', url: 'https://www.nytimes.com/interactive/2017/01/15/us/politics/you-draw-obama-legacy.html' },
      { label: 'Coverage listing the seven charts (Gigazine)', url: 'https://gigazine.net/gsc_news/en/20170116-draw-obama-presidency' },
      { label: 'FlowingData note', url: 'https://flowingdata.com/2017/01/17/draw-the-patterns-of-obamas-presidency/' },
      { label: 'Data: unemployment rate, annual averages (BLS)', url: 'https://data.bls.gov/timeseries/LNU04000000' },
    ],
    summary: 'Seven charts ask what happened under President Obama: the unemployment rate, deportations, health spending, federal debt, unauthorised Mexican immigrants, violent crime and troops abroad. Each shows the Bush years (2001–2008) as a red line over a grey area and leaves the Obama years (2009–2016) blank. You draw the line for the Obama years, then ask to see how you did.',
    steps: [
      'You read the prompt (“Under President Obama, the **unemployment rate** …”) and the record from 2000 to 2008: 4.0% rising to 5.8%.',
      'You draw from 2009 to 2016 in the region marked **OBAMA YEARS**. The button **Show me how I did.** stays greyed out until the line reaches 2016.',
      'Pressing it draws the real line over yours and explains what happened. The next chart follows below.',
    ],
    answers: 'Unemployment rate, annual average (BLS): 9.3% in 2009, peaking at 9.6% in 2010, then falling every year to 4.9% in 2016. The other six charts’ data were not recovered.',
  },
  strategy: {
    elicits: 'A trend continued from a known record: one value per year for 2009–2016.',
    technique: 'A partly drawn line chart. The given years are fixed and shaded; the blank years invite a freehand continuation from the last known point. The reveal overlays the truth.',
    inElicit: '`context: true` makes the seeded Bush years read-only and keeps them out of `getData()`. The 2008 row also seeds your column, so your line starts where the record ends. `edit.line.draw()` with `samples` at 2009–2016 upserts one row per year, `stage: 0` retires it on the reveal, and a stage-gated guide draws the real line. The page enables the button once all eight years are drawn.',
  },
  recreation: {
    title: 'Draw the Obama years',
    question: 'Under President Obama, the **unemployment rate** …',
    try: 'Draw the line from 2009 to 2016 in the empty region, then press **Show me how I did.**',
    why: '`context: true` turns the Bush years into given rows that you cannot change, and your 2009–2016 rows are the only ones in `getData()`. `edit.line.draw()` snaps your stroke to the eight `samples`. The button listens to `change` and stays disabled until every year is drawn, as in the original.',
    uses: ['context', 'edit.line.draw()', 'samples', 'stage', 'guides.custom()', 'nextStage()'],
    code: `// U.S. unemployment rate, annual average (BLS, LNU04000000).
const bush  = [[2000, 4.0], [2001, 4.7], [2002, 5.8], [2003, 6.0], [2004, 5.5],
               [2005, 5.1], [2006, 4.6], [2007, 4.6], [2008, 5.8]];
const obama = [[2009, 9.3], [2010, 9.6], [2011, 8.9], [2012, 8.1], [2013, 7.4],
               [2014, 6.2], [2015, 5.3], [2016, 4.9]];
const red = '#E3241B', blue = '#4F94CD', ink = '#222';
const label = (t, x, y, fill, o = {}) => ({ type: 'text', text: t, x, y, fill,
  fontSize: 12, textAnchor: 'middle', ...o });

const chart = mount(Elicit({
  width: 460, height: 300, theme: 'nyt', stage: 0,
  margins: { top: 16, right: 18, bottom: 28, left: 40 },
  schema: {
    year: { type: 'quantitative', domain: [2000, 2016] },
    bush: { type: 'quantitative', domain: [0, 11] },
    rate: { type: 'quantitative', domain: [0, 11] },
  },
  // 2008 also seeds your column, so the line you draw continues the record.
  data: bush.map(([year, v]) => ({ year, bush: v, rate: year === 2008 ? v : null })),
  context: true,                                         //! the Bush years are given, not elicited
  axes: {
    x: { tickValues: [2000, 2004, 2008, 2012, 2016], grid: true,
         tickFormat: (d) => d === 2000 ? '2000' : "'" + String(d).slice(2) },
    y: { tickValues: [0, 2, 4, 6, 8, 10], tickFormat: () => '', grid: true, line: false, tickSize: 0 },
  },
  guides: [
    guides.custom(({ scales: { x, y }, data, stage }) => {
      const drawn = data.some((d) => d.year > 2008 && d.rate != null);
      return [
        label('BUSH YEARS', x.encode(2004), y.encode(0.8), red),
        label('OBAMA YEARS', x.encode(2012.5), y.encode(0.8), blue),
        label('4.0%', x.encode(2000) - 7, y.encode(4.0) + 4, ink, { fontWeight: 'bold', textAnchor: 'end' }),
        label('5.8%', x.encode(2008) - 7, y.encode(5.8) - 8, ink, { fontWeight: 'bold', textAnchor: 'end' }),
        { type: 'circle', cx: x.encode(2000), cy: y.encode(4.0), r: 4.5, fill: blue },
        { type: 'circle', cx: x.encode(2008), cy: y.encode(5.8), r: 4.5, fill: red },
        ...(drawn || stage > 0 ? [] : [
          label('Draw the line', x.encode(2012.5), y.encode(9.2), ink, { fontSize: 14 }),
          label('for the Obama years.', x.encode(2012.5), y.encode(9.2) + 18, ink, { fontSize: 14 }),
        ]),
      ];
    }),
    guides.custom(({ scales: { x, y }, data, stage }) => {   //! the real line, once revealed
      if (stage < 1) return [];
      const yours = data.find((d) => d.year === 2012)?.rate ?? 8.1;
      const pts = [[2008, 5.8], ...obama];
      return [
        { type: 'path', fill: 'none', stroke: blue, strokeWidth: 3,
          points: pts.map(([a, b]) => [x.encode(a), y.encode(b)]) },
        ...obama.map(([a, b]) => ({ type: 'circle', cx: x.encode(a), cy: y.encode(b), r: 2.5, fill: blue })),
        label('9.6%', x.encode(2010), y.encode(9.6) - 10, blue, { fontWeight: 'bold' }),
        label('4.9%', x.encode(2016) + 2, y.encode(4.9) + 18, blue, { fontWeight: 'bold', textAnchor: 'end' }),
        // Each label sits on the side of its line away from the other line.
        label('Actual', x.encode(2012), y.encode(8.1) + (yours > 8.1 ? 20 : -14), blue, { fontWeight: 'bold' }),
        label('Your guess', x.encode(2012), y.encode(yours) + (yours > 8.1 ? -14 : 20), ink),
      ];
    }),
  ],
  marks: [
    areaY({ fill: '#efefef', stroke: 'none', channels: { x: { field: 'year' }, y: { field: 'bush' } } }),
    lineY({ stroke: red, strokeWidth: 3, channels: { x: { field: 'year' }, y: { field: 'bush' } } }),
    lineY({
      stroke: ink, strokeWidth: 3, handleSize: 3, curve: 'monotoneX',
      channels: { x: { field: 'year' }, y: { field: 'rate' } },
      edits: [edit.line.draw({ samples: d3.range(2009, 2017), into: 'new', stage: 0 })],   //! one row per Obama year
    }),
  ],
}));

const note = ui.note('');
const button = ui.button('Show me how I did.', () => {
  chart.nextStage();                                     //! retire the edit, reveal the truth
  button.disabled = true;
  const yours = chart.getData();
  const err = d3.mean(yours, (d) => Math.abs(d.rate - new Map(obama).get(d.year)));
  note.innerHTML = ui.md('Unemployment peaked at **9.6% in 2010** and then fell every year, to **4.9%** in 2016. ' +
    'Your line was off by ' + err.toFixed(1) + ' points a year on average.');
}, { disabled: true });
chart.on('change', () => { button.disabled = chart.getData().length < 8; });   //! only a finished line counts
mount(ui.row(button));
mount(note);`,
  },
  variants: [
    {
      title: 'Guess, then a range',
      question: 'Under President Obama, the **unemployment rate** … and how sure are you?',
      try: 'Sweep across the Obama years to shape the dark line, press **Next**, then sweep near the band’s top and bottom edges to set your range. Press **Show me how I did.**',
      why: 'Three stages on one chart. In stage 0 `edit.line.sweep()` shapes a seeded line; `ordering` drags the zero-width band along with it. **Next** widens the band with `chart.set()` and moves to stage 1, where each band edge has its own sweep. Stage 2 reveals the truth and counts the years your band covered.',
      uses: ['context', 'edit.line.sweep()', 'areaY', 'ordering()', 'stage', 'chart.set()'],
      code: `const bush  = [[2000, 4.0], [2001, 4.7], [2002, 5.8], [2003, 6.0], [2004, 5.5],
               [2005, 5.1], [2006, 4.6], [2007, 4.6], [2008, 5.8]];
const obama = [[2009, 9.3], [2010, 9.6], [2011, 8.9], [2012, 8.1], [2013, 7.4],
               [2014, 6.2], [2015, 5.3], [2016, 4.9]];
const red = '#E3241B', blue = '#4F94CD', ink = '#222';
const xy = { x: { field: 'year' } };

const chart = mount(Elicit({
  width: 460, height: 300, theme: 'nyt', stage: 0,
  stageLabels: ['guess', 'range', 'revealed'],
  margins: { top: 16, right: 18, bottom: 28, left: 40 },
  schema: {
    year: { type: 'quantitative', domain: [2000, 2016] },
    bush: { type: 'quantitative', domain: [0, 12] },
    rate: { type: 'quantitative', domain: [0, 12] },
    lo:   { type: 'quantitative', domain: [0, 12] },
    hi:   { type: 'quantitative', domain: [0, 12] },
  },
  data: [
    ...bush.map(([year, v]) => ({ year, bush: v, ...(year === 2008 ? { rate: v, lo: v, hi: v } : {}) })),
    ...obama.map(([year]) => ({ year, rate: 5.8, lo: 5.8, hi: 5.8 })),   // flat from 2008
  ],
  context: (d) => d.year <= 2008,
  constraints: [ordering({ field: ['lo', 'rate', 'hi'] })],   //! the band always holds your line
  axes: {
    x: { tickValues: [2000, 2004, 2008, 2012, 2016], grid: true,
         tickFormat: (d) => d === 2000 ? '2000' : "'" + String(d).slice(2) },
    y: { tickValues: [0, 2, 4, 6, 8, 10, 12], tickFormat: (d) => d + '%', grid: true },
  },
  guides: [
    guides.custom(({ scales: { x, y }, stage }) => stage < 2 ? [] : [{
      type: 'path', fill: 'none', stroke: blue, strokeWidth: 3,
      points: [[2008, 5.8], ...obama].map(([a, b]) => [x.encode(a), y.encode(b)]) }]),
  ],
  marks: [
    areaY({ fill: '#efefef', stroke: 'none', channels: { ...xy, y: { field: 'bush' } } }),
    lineY({ stroke: red, strokeWidth: 3, channels: { ...xy, y: { field: 'bush' } } }),
    areaY({
      fill: ink, fillOpacity: 0.15, stroke: 'none', handleColor: ink,
      channels: { ...xy,
        y1: { field: 'lo', edit: edit.line.sweep({ stage: 1 }) },   //! stage 1: the low edge
        y2: { field: 'hi', edit: edit.line.sweep({ stage: 1 }) } },  //! stage 1: the high edge
    }),
    lineY({
      stroke: ink, strokeWidth: 3, handleSize: 3,
      channels: { ...xy, y: { field: 'rate', edit: edit.line.sweep({ stage: 0 }) } },   //! stage 0: your line
    }),
  ],
}));

const note = ui.note('');
const button = ui.button('Next: how sure are you?', () => {
  if (chart.getStage() === 0) {
    chart.getData().forEach((d, index) => {               // open a ±1.5-point band around your line
      chart.set('hi', Math.min(12, d.rate + 1.5), { index });
      chart.set('lo', Math.max(0, d.rate - 1.5), { index });
    });
    chart.nextStage();
    button.textContent = 'Show me how I did.';
    return;
  }
  chart.nextStage();
  button.disabled = true;
  const truth = new Map(obama);
  const rows = chart.getData();
  const inside = rows.filter((d) => truth.get(d.year) >= d.lo && truth.get(d.year) <= d.hi).length;
  note.innerHTML = ui.md('Your range covered the real rate in **' + inside + ' of 8** years. ' +
    'It peaked at 9.6% in 2010 and fell to 4.9% by 2016.');
});
mount(ui.row(button));
mount(note);`,
    },
  ],
  needs: [],
  gaps: [
    'Only the unemployment chart is recreated. The other six (deportations, health spending, debt, unauthorised immigrants, violent crime, troops) need series that were not recovered.',
    'The NYT’s drawn line, and its reveal text after each chart, are approximated: the guess is a dark line and the note gives the peak, the 2016 value and your average miss.',
  ],
});

VIBE.add({
  id: 'row-15',
  status: 'full',
  verdict: 'The 1968–1990 record is context in the same column you draw into, so one line runs from the record into your stroke; `edit.line.draw()` fills 1991–2016 and the button reveals the real decline.',
  original: {
    availability: 'live',
    links: [
      { label: 'Original (NYT, paywalled)', url: 'https://www.nytimes.com/interactive/2017/04/14/upshot/drug-overdose-epidemic-you-draw-it.html' },
      { label: 'Data: motor-vehicle traffic deaths (NHTSA FARS)', url: 'https://www-fars.nhtsa.dot.gov/Main/index.aspx' },
      { label: 'Data: drug overdose deaths 1999–2016 (NCHS Data Brief 294)', url: 'https://www.cdc.gov/nchs/products/databriefs/db294.htm' },
    ],
    summary: 'The Upshot asks how the drug overdose epidemic compares with other causes of death. Each chart shows a cause’s annual U.S. deaths up to a point and leaves the rest blank: car accidents first (known to 1990), then guns and HIV, then overdoses. You draw the missing years and ask to see how you did.',
    steps: [
      'You read the prompt (“Since 1990, the number of Americans who have died every year from **car accidents** …”) and the record from 1968 (52,879) to 1990 (44,600).',
      'You draw the line from 1990 to 2016 where it says “Draw the line for the missing years.” **Show me how I did.** is greyed out until you have.',
      'The reveal draws the real line over yours. A link, “I don’t want to play; just tell me the answers”, skips the drawing.',
      'Later charts set gun deaths, HIV deaths and finally overdoses against the same scale.',
    ],
    answers: 'Motor-vehicle deaths fell from 44,599 in 1990 to a low of 32,479 in 2011, then rose to 37,806 in 2016 (NHTSA FARS). Drug overdose deaths rose from 16,849 in 1999 to 63,632 in 2016 (NCHS). The NYT’s 1968 label (52,879) comes from a slightly different series than NHTSA’s 52,725.',
  },
  strategy: {
    elicits: 'A trend continued from a long record: annual deaths for each of 26 missing years.',
    technique: 'A line chart with the past drawn over a grey area and the future blank. You draw freehand from the last known point; the reveal overlays the truth.',
    inElicit: 'The record and your answer share the `deaths` column: `context` marks the seeded years as given, so one `lineY` runs from the record into your stroke, while a second column under the record carries the grey area. `edit.line.draw()` with `samples` at 1991–2016 writes one row per year. A stage-gated guide is the answer key.',
  },
  recreation: {
    title: 'Draw the missing years',
    question: 'Since 1990, the number of Americans who have died every year from **car accidents** …',
    try: 'Draw from 1990 to 2016 in the blank part, then press **Show me how I did.** Or skip straight to the answer.',
    why: 'Your rows and the context rows share one column, so the line you draw joins the record at 1990 with no seam. `into: \'new\'` makes every stroke repaint the years it crosses, so you can redraw a stretch. The skip link and the button both call `nextStage()`, which retires the drawing edit.',
    uses: ['context', 'edit.line.draw()', 'samples', 'into', 'stage', 'nextStage()'],
    code: `// U.S. motor-vehicle deaths per year (NHTSA FARS), 1968–2016.
const deaths = [52725, 53543, 52627, 52542, 54589, 54052, 45196, 44525, 45523,
  47878, 50331, 51093, 51091, 49301, 43945, 42589, 44257, 43825, 46087, 46390,
  47087, 45582, 44599,                                   // 1968–1990: given
  41508, 39250, 40150, 40716, 41817, 42065, 42013, 41501, 41717, 41945, 42196,
  43005, 42884, 42836, 43510, 42708, 41259, 37423, 33883, 32999, 32479, 33782,
  32893, 32744, 35485, 37806];                           // 1991–2016: the answer
const all = deaths.map((n, i) => ({ year: 1968 + i, n }));
const blue = '#7DA2CF', ink = '#222', fmt = d3.format(',');
const label = (t, x, y, fill, o = {}) => ({ type: 'text', text: t, x, y, fill,
  fontSize: 12, textAnchor: 'middle', ...o });

const chart = mount(Elicit({
  width: 460, height: 300, theme: 'nyt', stage: 0,
  margins: { top: 22, right: 18, bottom: 28, left: 18 },
  schema: {
    year:   { type: 'quantitative', domain: [1968, 2016] },
    deaths: { type: 'quantitative', domain: [0, 60000] },
    known:  { type: 'quantitative', domain: [0, 60000] },
  },
  data: all.filter((d) => d.year <= 1990).map(({ year, n }) => ({ year, deaths: n, known: n })),
  context: true,                                         //! 1968–1990 is the record
  axes: {
    x: { tickValues: [1968, 1980, 1990, 2000, 2010, 2016], grid: true,
         tickFormat: (d) => d === 1968 ? '1968' : "'" + String(d).slice(2) },
    y: false,
  },
  guides: [
    guides.custom(({ scales: { x, y }, data, stage }) => [
      label('52,725', x.encode(1968) + 2, y.encode(52725) - 10, ink, { fontWeight: 'bold', textAnchor: 'start' }),
      label('44,599', x.encode(1990) + 4, y.encode(44599) - 12, ink, { fontWeight: 'bold', textAnchor: 'start' }),
      ...(stage > 0 || data.some((d) => d.year > 1990) ? [] : [
        label('Draw the line', x.encode(2004), y.encode(41000), ink, { fontSize: 14 }),
        label('for the missing years.', x.encode(2004), y.encode(41000) + 18, ink, { fontSize: 14 }),
      ]),
    ]),
    guides.custom(({ scales: { x, y }, stage }) => stage < 1 ? [] : [   //! the answer key, once revealed
      { type: 'path', fill: 'none', stroke: ink, strokeWidth: 2,
        points: all.filter((d) => d.year >= 1990).map((d) => [x.encode(d.year), y.encode(d.n)]) },
      label('Actual', x.encode(2011), y.encode(32479) + 18, ink, { fontWeight: 'bold' }),
    ]),
  ],
  marks: [
    areaY({ fill: '#f0f0f0', stroke: 'none', channels: { x: { field: 'year' }, y: { field: 'known' } } }),
    lineY({
      stroke: blue, strokeWidth: 3, handleSize: 2.5, curve: 'monotoneX',
      channels: { x: { field: 'year' }, y: { field: 'deaths' } },
      edits: [edit.line.draw({ samples: d3.range(1991, 2017), into: 'new', stage: 0 })],   //! one row per missing year
    }),
  ],
}));

const note = ui.note('');
const reveal = () => {
  chart.nextStage();                                     //! drawing is over
  button.disabled = true;
  const yours = new Map(chart.getData().map((d) => [d.year, d.deaths]));
  note.innerHTML = ui.md('Deaths fell to **' + fmt(32479) + '** in 2011, then rose to **' + fmt(37806) +
    '** in 2016' + (yours.has(2016) ? ' (you drew ' + fmt(Math.round(yours.get(2016) / 100) * 100) + ').' : '.') +
    ' Overdoses killed **' + fmt(63632) + '** Americans in 2016.');
};
const button = ui.button('Show me how I did.', reveal, { disabled: true });
chart.on('change', () => { button.disabled = chart.getData().length < 26; });
mount(ui.row(button));
mount(h('p', { style: 'text-align:center;margin:4px 0;font-size:12px' },
  h('a', { href: '#', onclick: (e) => { e.preventDefault(); reveal(); } }, 'I don’t want to play; just tell me the answers.')));
mount(note);`,
  },
  variants: [
    {
      title: 'Two causes at once',
      question: 'From 1999 to 2016, how many Americans died each year in **car accidents**, and how many from **drug overdoses**?',
      try: 'Both lines start at their 1999 value. Sweep near one line to reshape it, then the other. Press **Show me how I did.**',
      why: 'One `lineY` grouped by the `series` channel draws two lines, and `edit.line.sweep()` locks onto the line nearest where your stroke starts, so you shape each without disturbing the other. The 1999 rows are context, so both lines start from fact.',
      uses: ['series', 'edit.line.sweep()', 'context', 'stage'],
      code: `// 1999–2016. Car: NHTSA FARS. Overdoses: NCHS Data Brief 294.
const truth = {
  'Car accidents':  [41717, 41945, 42196, 43005, 42884, 42836, 43510, 42708, 41259,
                     37423, 33883, 32999, 32479, 33782, 32893, 32744, 35485, 37806],
  'Drug overdoses': [16849, 17415, 19394, 23518, 25785, 27424, 29813, 34425, 36010,
                     36450, 37004, 38329, 41340, 41502, 43982, 47055, 52404, 63632],
};
const colours = { 'Car accidents': '#7DA2CF', 'Drug overdoses': '#C0392B' };
const causes = Object.keys(truth), years = d3.range(1999, 2017), fmt = d3.format(',');

const chart = mount(Elicit({
  width: 460, height: 300, theme: 'nyt', stage: 0,
  margins: { top: 16, right: 18, bottom: 28, left: 44 },
  schema: {
    cause:  { type: 'categorical', domain: causes },
    year:   { type: 'quantitative', domain: [1999, 2016] },
    deaths: { type: 'quantitative', domain: [0, 70000] },
  },
  // Both lines start flat at their 1999 value.
  data: causes.flatMap((cause) => years.map((year) => ({ cause, year, deaths: truth[cause][0] }))),
  context: (d) => d.year === 1999,
  axes: { x: { tickFormat: 'd', grid: true }, y: { tickFormat: '~s', grid: true } },
  scales: { stroke: { range: causes.map((c) => colours[c]) } },
  guides: [
    guides.custom(({ scales: { x, y }, stage }) => causes.flatMap((c) => [
      { type: 'text', text: c, x: x.encode(1999) + 4, y: y.encode(truth[c][0]) - 8, fill: colours[c], fontSize: 12 },
      ...(stage < 1 ? [] : [{                                   //! the real lines, once revealed
        type: 'path', fill: 'none', stroke: colours[c], strokeWidth: 2, strokeDash: '5 3',
        points: years.map((yr, i) => [x.encode(yr), y.encode(truth[c][i])]) }]),
    ])),
  ],
  marks: [
    lineY({
      strokeWidth: 3, handleSize: 3,
      channels: {
        series: { field: 'cause' },
        stroke: { field: 'cause' },
        x: { field: 'year' },
        y: { field: 'deaths', edit: edit.line.sweep({ stage: 0 }) },   //! paints the nearest line only
      },
    }),
  ],
}));

const note = ui.note('');
mount(ui.row(ui.button('Show me how I did.', () => {
  chart.nextStage();
  const at2016 = (c) => chart.getData().find((d) => d.cause === c && d.year === 2016).deaths;
  note.innerHTML = ui.md('Dashed lines are the truth. In 2016 overdoses (**' + fmt(63632) +
    '**) killed far more people than car accidents (**' + fmt(37806) + '**). You drew ' +
    fmt(Math.round(at2016('Drug overdoses') / 100) * 100) + ' and ' +
    fmt(Math.round(at2016('Car accidents') / 100) * 100) + '.');
})));
mount(note);`,
    },
  ],
  needs: [],
  gaps: [
    'Only the car-accident chart is recreated as the original asked it. The NYT’s gun and HIV charts are left out: their series and given years were not recovered. The variant sets overdoses beside car deaths instead.',
    'The record uses NHTSA’s series (1968: 52,725; 1990: 44,599); the NYT’s labels read 52,879 and 44,600.',
    'The NYT drew the reader’s line in its own style and wrote a reveal paragraph per chart; here the answer is a dark line and a one-line note.',
  ],
});

VIBE.add({
  id: 'row-16',
  status: 'full',
  verdict: 'A slope chart with the Obama segment as context and one draggable 2019 point at the end of a dashed red segment; `move()` on its y channel is the whole answer, and the button sets a `truth` column that draws the real endpoint.',
  original: {
    availability: 'live',
    links: [
      { label: 'Original (NYT Opinion, paywalled)', url: 'https://www.nytimes.com/interactive/2020/10/05/opinion/trump-record-quiz.html' },
      { label: 'Data: NHIS early release, uninsured 2019 (CDC)', url: 'https://www.cdc.gov/nchs/data/nhis/earlyrelease/insur202009-508.pdf' },
      { label: 'Data: NHIS early release, uninsured 2016 (CDC)', url: 'https://www.cdc.gov/nchs/data/nhis/earlyrelease/insur201705.pdf' },
    ],
    summary: 'NYT Opinion asks you to guess President Trump’s record on several topics by dragging circles. Each question shows the Obama years as a solid blue segment between two labelled circles and the Trump years as a dashed red segment ending in a draggable 2019 circle. You drag that circle up or down to where you think the value ended up.',
    steps: [
      'You read the question (“1. How did the **share of Americans who are uninsured** change under Mr. Trump?”) and the Obama segment: 14.7% in 2012, 9.0% in 2016.',
      'You drag the 2019 circle, marked **DRAG** with up and down arrows, to your guess. The dashed segment follows it.',
      'The page reveals the real 2019 value beside your guess, then moves on to the next topic.',
    ],
    answers: 'The uninsured share of all ages in CDC’s National Health Interview Survey was 14.7% in 2012 and 9.0% in 2016, matching the chart, and 10.3% in 2019. The NYT’s own 2019 value and its other topics were not recovered.',
  },
  strategy: {
    elicits: 'One number, a 2019 endpoint, framed as the direction and size of a change from a known 2016 value.',
    technique: 'A slope chart: two given points, one draggable endpoint constrained to the 2019 vertical. The dashed segment turns the point estimate into a visible trend from the last known value.',
    inElicit: 'Three rows. 2012 and 2016 are `context`; 2019 carries the answer in the `trump` column, which a dashed `lineY` joins to 2016. A `point` with `move()` on its y channel only is the draggable circle, and `clamp` keeps it on the chart. The button writes the true value into a `truth` column and advances the stage, which retires the drag.',
  },
  recreation: {
    title: 'Drag the 2019 point',
    question: '1. How did the **share of Americans who are uninsured** change under Mr. Trump?',
    try: 'Drag the red circle at 2019 up or down, then press **Show me**.',
    why: 'The `move()` sits on the point’s y channel only, so the circle slides along the 2019 line and nothing else changes. The dashed segment is a `lineY` over the same column, so it follows the drag. The reveal is the verified idiom: an empty `truth` column drawn by its own marks, filled by `chart.set()`.',
    uses: ['point', 'move()', 'clamp()', 'context', 'strokeDash', 'chart.set()', 'stage'],
    code: `// Share of all ages without health insurance (CDC, NHIS).
const blue = '#3C96D2', red = '#EE4B57', grey = '#bbb';
const xy = (f) => ({ x: { field: 'year' }, y: { field: f } });
const label = (t, x, y, fill, o = {}) => ({ type: 'text', text: t, x, y, fill,
  fontSize: 13, textAnchor: 'middle', ...o });

const chart = mount(Elicit({
  width: 460, height: 270, stage: 0,
  margins: { top: 40, right: 100, bottom: 30, left: 30 },
  schema: {
    year:  { type: 'quantitative', domain: [2012, 2019] },
    obama: { type: 'quantitative', domain: [0, 20] },
    trump: { type: 'quantitative', domain: [0, 20] },
    truth: { type: 'quantitative', domain: [0, 20] },
  },
  data: [
    { year: 2012, obama: 14.7 },
    { year: 2016, obama: 9.0, trump: 9.0, truth: 9.0 },
    { year: 2019, trump: 9.0, truth: null },             // your guess; the truth comes later
  ],
  context: (d) => d.year < 2019,                         //! only 2019 is yours
  constraints: [clamp({ field: 'trump', min: 0, max: 20 })],
  axes: {
    x: { tickValues: [2012, 2016, 2019], tickFormat: 'd', line: false, tickSize: 0,
         grid: { stroke: '#ddd' } },
    y: false,
  },
  guides: [
    guides.custom(({ scales: { x, y }, data, stage }) => {
      const you = data.find((d) => d.year === 2019);
      const pct = (v) => v.toFixed(1) + '%';
      return [
        label('OBAMA', x.encode(2014), -20, blue),
        label('TRUMP', x.encode(2017.5), -20, red),
        label('14.7%', x.encode(2012), y.encode(14.7) - 14, blue, { fontWeight: 'bold' }),
        label('9.0%', x.encode(2016), y.encode(9.0) - 14, blue, { fontWeight: 'bold' }),
        ...(stage < 1 ? [                                 // the DRAG affordance
          label('DRAG', x.encode(2019) + 14, y.encode(you.trump) + 4, '#888', { textAnchor: 'start' }),
          label('▲', x.encode(2019), y.encode(you.trump) - 12, red, { fontSize: 10 }),
          label('▼', x.encode(2019), y.encode(you.trump) + 20, red, { fontSize: 10 }),
        ] : [
          label('Actual ' + pct(you.truth), x.encode(2019) + 12, y.encode(you.truth) + 4, red, { textAnchor: 'start', fontWeight: 'bold' }),
          label('You ' + pct(you.trump), x.encode(2019) + 12, y.encode(you.trump) + (you.trump < you.truth ? 16 : -8), '#888', { textAnchor: 'start' }),
        ]),
      ];
    }),
  ],
  marks: [
    lineY({ stroke: blue, strokeWidth: 5, channels: xy('obama') }),
    lineY({ stroke: red, strokeWidth: 4, strokeDash: '10 7', channels: xy('trump') }),
    lineY({ stroke: red, strokeWidth: 4, channels: xy('truth') }),   // empty until the reveal
    point({ fill: red, size: 6, channels: xy('truth') }),
    point({
      fill: 'white', stroke: red, strokeWidth: 3, size: 7,
      channels: { x: { field: 'year' }, y: { field: 'trump', edit: move({ stage: 0 }) } },   //! drag up or down only
    }),
    point({ fill: 'white', stroke: blue, strokeWidth: 3, size: 7, channels: xy('obama') }),
  ],
}));

const button = ui.button('Show me', () => {
  chart.set('truth', 10.3, { index: 0 });                //! the real 2019 value
  chart.nextStage();                                      //! retire the drag
  button.disabled = true;
});
mount(ui.row(button));
mount(h('p', { style: 'font-size:12px;color:#888;margin:2px 0' }, 'Source: Centers for Disease Control and Prevention'));`,
  },
  variants: [
    {
      title: 'Guess with a range',
      question: 'How did the **share of Americans who are uninsured** change under Mr. Trump? Drag your best guess, then the ends of a range you are fairly sure of.',
      try: 'Drag the big circle to your best guess, and the two small circles to the top and bottom of your range. Press **Show me**.',
      why: 'The 2019 row carries three answers, `lo`, `trump` and `hi`, each a `point` with `move()` on y. `ordering` keeps them in order and pushes a neighbour along when you drag past it. An `areaY` from the 2016 point to the range makes a cone of possible trends, the slope-chart form of `widgets.lineCone`.',
      uses: ['point', 'move()', 'ordering()', 'areaY', 'context', 'chart.set()'],
      code: `const blue = '#3C96D2', red = '#EE4B57';
const xy = (f, edit) => ({ x: { field: 'year' }, y: { field: f, edit } });
const domain = [0, 20];

const chart = mount(Elicit({
  width: 460, height: 270, stage: 0,
  margins: { top: 24, right: 90, bottom: 30, left: 30 },
  schema: {
    year: { type: 'quantitative', domain: [2012, 2019] },
    obama: { type: 'quantitative', domain }, trump: { type: 'quantitative', domain },
    lo: { type: 'quantitative', domain }, hi: { type: 'quantitative', domain },
    truth: { type: 'quantitative', domain },
  },
  data: [
    { year: 2012, obama: 14.7 },
    { year: 2016, obama: 9.0, trump: 9.0, lo: 9.0, hi: 9.0 },
    { year: 2019, trump: 9.0, lo: 7.0, hi: 11.0, truth: null },
  ],
  context: (d) => d.year < 2019,
  constraints: [
    ordering({ field: ['lo', 'trump', 'hi'] }),           //! range ends stay either side of the guess
    clamp({ field: 'lo', min: 0, max: 20 }), clamp({ field: 'hi', min: 0, max: 20 }),
  ],
  axes: { x: { tickValues: [2012, 2016, 2019], tickFormat: 'd', line: false, tickSize: 0, grid: true },
          y: { tickValues: [5, 10, 15, 20], tickFormat: (d) => d + '%', grid: true, line: false } },
  guides: [
    guides.custom(({ scales: { x, y }, data, stage }) => {
      const r = data.find((d) => d.year === 2019);
      const say = (t, v, fill) => ({ type: 'text', text: t, x: x.encode(2019) + 12, y: y.encode(v) + 4, fill, fontSize: 12 });
      return stage < 1
        ? [say('high ' + r.hi.toFixed(1) + '%', r.hi, '#888'), say('low ' + r.lo.toFixed(1) + '%', r.lo, '#888')]
        : [say('Actual ' + r.truth.toFixed(1) + '%', r.truth, red)];
    }),
  ],
  marks: [
    areaY({ fill: red, fillOpacity: 0.15, stroke: 'none',      //! the cone from 2016 to your range
      channels: { x: { field: 'year' }, y1: { field: 'lo' }, y2: { field: 'hi' } } }),
    lineY({ stroke: blue, strokeWidth: 5, channels: xy('obama') }),
    lineY({ stroke: red, strokeWidth: 4, strokeDash: '10 7', channels: xy('trump') }),
    point({ fill: red, size: 6, channels: xy('truth') }),
    point({ fill: 'white', stroke: red, strokeWidth: 2, size: 4, channels: xy('lo', move({ stage: 0 })) }),
    point({ fill: 'white', stroke: red, strokeWidth: 2, size: 4, channels: xy('hi', move({ stage: 0 })) }),
    point({ fill: 'white', stroke: red, strokeWidth: 3, size: 7, channels: xy('trump', move({ stage: 0 })) }),
    point({ fill: 'white', stroke: blue, strokeWidth: 3, size: 7, channels: xy('obama') }),
  ],
}));

const note = ui.note('');
const button = ui.button('Show me', () => {
  chart.set('truth', 10.3, { index: 0 });
  chart.nextStage();
  button.disabled = true;
  const r = chart.getData()[0];
  note.innerHTML = ui.md('The uninsured share rose to **10.3%** in 2019. ' +
    (r.lo <= 10.3 && 10.3 <= r.hi ? 'Your range (' : 'Your range missed it (') +
    r.lo.toFixed(1) + '–' + r.hi.toFixed(1) + '%)' + (r.lo <= 10.3 && 10.3 <= r.hi ? ' covered it.' : '.'));
});
mount(ui.row(button));
mount(note);`,
    },
  ],
  needs: [],
  gaps: [
    'Only the uninsured question is recreated. The quiz’s other topics, and its true 2019 values, were not recovered; the 2019 value here is CDC’s NHIS figure for all ages (10.3%), the series whose 2012 and 2016 values match the chart.',
    'The reveal’s wording in the original is unknown; this one labels the actual value and your guess at the 2019 end.',
  ],
});

VIBE.add({
  id: 'row-22',
  status: 'full',
  verdict: 'You drag one red dot and it leaves a trail: a `move()` on the dot plus a `constraints.custom` rule that writes every year the dot crosses into the trail column, so the trail is the answer; the button reveals the real bed count.',
  original: {
    availability: 'live',
    links: [
      { label: 'The Guardian (live)', url: 'https://www.theguardian.com/society/ng-interactive/2018/jul/02/nhs-at-70-how-well-do-you-know-the-health-service' },
      { label: 'Interactive bundle with the data', url: 'https://interactive.guim.co.uk/atoms/2018/07/NHS-draw-it/v/1540998271586/app.js' },
      { label: 'Question and reveal text', url: 'https://interactive.guim.co.uk/docsdata-test/1XjLC7-Y8gkFUHDyyufY0Rpm4lEUbqCCjuImzHVRHBlk.json' },
    ],
    summary: 'For the NHS’s 70th birthday, the Guardian asks you to draw five trends: beds, doctors, female GPs, spending per person and future funding. Each chart starts from a short known stretch. For beds, a grey segment rises from 543,000 in 1951 to a red dot at 1955, labelled “Drag the dot”. Dragging the dot to the right draws your line year by year.',
    steps: [
      'You read the question (“**How has the number of beds in the NHS changed?** There were over half a million in 1951”).',
      'You drag the red dot across the years; it leaves a line behind it.',
      'Pressing **Guess** reveals the **Answer** line and a band of **Most readers’ guesses**, with the headline “The number of beds has dropped by almost 70% since 1951” and a paragraph on why.',
    ],
    answers: 'UK NHS beds (the Guardian’s series): 543,000 in 1951, 561,000 in 1955, 536,000 in 1970, 458,000 in 1980, 338,000 in 1990, 242,000 in 2000, 186,000 in 2010 and 169,000 in 2016. The crowd band came from the Guardian’s server and is not recoverable.',
  },
  strategy: {
    elicits: 'A trend continued from a known start: the bed count for each year from 1956 to 2016.',
    technique: 'A single draggable handle at the end of the known line. Dragging it forward draws the line behind it, so the gesture is “move one point” but the answer is a whole series. The reveal overlays the truth and a crowd band.',
    inElicit: 'The dot is one row with its own `dot` column and a `point` mark with `move()`. A `constraints.custom` rule runs on every drag tick: it snaps the dot to a whole year inside 1955–2016 and writes the trail rows between the dot’s last position and its new one, erasing any beyond it. The trail is an ordinary `lineY` over the `beds` column, and the 1951 and 1955 rows are `context`.',
  },
  recreation: {
    title: 'Drag the dot',
    question: '**How has the number of beds in the NHS changed?** There were over half a million in 1951.',
    try: 'Drag the red dot to the right, up and down as you go, until it reaches 2016. Drag back to redo a stretch. Press **Guess**.',
    why: 'The drag only moves the dot. The trail comes from the dataset invariant: a `constraints.custom` sees the dot’s old and new position on every tick and fills the years in between, so a fast drag skips none and dragging back erases. `getData()` holds the trail, one row per year.',
    uses: ['point', 'move()', 'constraints.custom()', 'context', 'stage', 'guides.custom()'],
    code: `// UK NHS beds (the Guardian's series; gaps are years it did not publish).
const beds = [[1951, 543e3], [1955, 561e3], [1960, 560e3], [1965, 551e3], [1970, 536e3],
  [1975, 497e3], [1980, 458e3], [1981, 455e3], [1982, 453e3], [1983, 446e3], [1984, 431e3],
  [1985, 422e3], [1986, 409e3], [1987, 388e3], [1988, 372e3], [1989, 356e3], [1990, 338e3],
  [1991, 323e3], [1992, 308e3], [1993, 292e3], [1994, 282e3], [1995, 273e3], [1996, 262e3],
  [1997, 256e3], [1998, 250e3], [1999, 244e3], [2000, 242e3], [2001, 240e3], [2002, 237e3],
  [2003, 236e3], [2004, 232e3], [2005, 226e3], [2006, 216e3], [2007, 209e3], [2008, 208e3],
  [2009, 204e3], [2010, 186e3], [2011, 181e3], [2012, 178e3], [2013, 176e3], [2014, 176e3],
  [2015, 170e3], [2016, 169e3]];
const start = 1955, end = 2016, red = '#C70000', blue = '#005689', grey = '#767676';
const fmt = d3.format(',');

// The dot leaves a trail: every year it crosses takes the value on the straight
// segment from where it was to where it is; years past it are erased.
const trail = constraints.custom(({ data, oldData }) => {   //! the trail is a dataset rule
  const i = data.findIndex((d) => d.dot != null);
  const was = oldData[i];
  const dot = { ...data[i], year: Math.max(start, Math.min(end, Math.round(data[i].year))),
                dot: Math.max(0, Math.min(9e5, data[i].dot)) };
  const t0 = was.year, v0 = was.dot;
  return data.map((d, k) => {
    if (k === i) return dot;
    if (d.dot != null || d.year <= start) return d;       // the dot itself, the given years
    if (d.year > dot.year) return { ...d, beds: null };   // ahead of the dot: erased
    if (d.year === dot.year) return { ...d, beds: Math.round(dot.dot) };
    if (d.year <= t0) return d;                           // behind where it was: kept
    const f = (d.year - t0) / (dot.year - t0);            // crossed by this move
    return { ...d, beds: Math.round(v0 + (dot.dot - v0) * f) };
  });
});

const chart = mount(Elicit({
  width: 460, height: 320, stage: 0,
  margins: { top: 14, right: 16, bottom: 26, left: 16 },
  schema: {
    year: { type: 'quantitative', domain: [1948, 2018] },
    hist: { type: 'quantitative', domain: [0, 9e5] },
    beds: { type: 'quantitative', domain: [0, 9e5] },
    dot:  { type: 'quantitative', domain: [0, 9e5] },
  },
  data: [
    { year: 1951, hist: 543e3 }, { year: 1955, hist: 561e3, beds: 561e3 },   // given
    ...d3.range(start + 1, end + 1).map((year) => ({ year, beds: null })),    // your trail
    { year: start, dot: 561e3 },                                               // the dot
  ],
  context: (d) => d.year <= start && d.dot == null,
  constraints: [trail],
  axes: {
    x: { tickValues: d3.range(1948, 2019, 10), tickFormat: 'd', tickSize: 0 },
    y: { tickValues: d3.range(0, 9e5, 2e5), grid: { strokeDash: '2 3' }, line: false, tickSize: 0,
         tickPadding: -4, labelAlign: 'start', labelOffset: -8,
         tickFormat: (v) => v === 8e5 ? '800,000 beds' : fmt(v) },
  },
  guides: [
    guides.custom(({ scales: { x }, height }) => [{ type: 'rect', background: true,   // the grey panel, behind everything
      x: x.encode(1951), y: 0, width: x.encode(2016) - x.encode(1951), height, fill: '#f1f1f1' }]),
    guides.custom(({ scales: { x, y }, data, stage }) => {
      const dot = data.find((d) => d.dot != null);
      return stage > 0 || dot.year > start + 3 ? [] : [{ type: 'text', text: 'Drag the dot',
        x: x.encode(dot.year) + 12, y: y.encode(dot.dot) + 4, fill: red, fontSize: 12, fontWeight: 'bold' }];
    }),
    guides.custom(({ scales: { x, y }, stage }) => {      //! the answer and the crowd, once you guess
      if (stage < 1) return [];
      const crowdLo = [[1955, 561e3], [1985, 520e3], [2016, 440e3]];   // ILLUSTRATIVE
      const crowdHi = [[2016, 700e3], [1985, 640e3], [1955, 561e3]];
      return [
        { type: 'path', fill: grey, opacity: 0.25, stroke: 'none', closed: true,
          points: [...crowdLo, ...crowdHi].map(([a, b]) => [x.encode(a), y.encode(b)]) },
        { type: 'text', text: 'Most readers’ guesses (illustrative)', x: x.encode(1990), y: y.encode(690e3),
          fill: grey, fontSize: 11, textAnchor: 'middle' },
        { type: 'path', fill: 'none', stroke: blue, strokeWidth: 3,
          points: beds.map(([a, b]) => [x.encode(a), y.encode(b)]) },
        { type: 'text', text: 'Answer', x: x.encode(1996), y: y.encode(262e3) + 22, fill: blue, fontSize: 12, fontWeight: 'bold' },
      ];
    }),
  ],
  marks: [
    lineY({ stroke: grey, strokeWidth: 2, channels: { x: { field: 'year' }, y: { field: 'hist' } } }),
    lineY({ stroke: red, strokeWidth: 2.5, channels: { x: { field: 'year' }, y: { field: 'beds' } } }),
    point({
      fill: red, size: 7,
      channels: { x: { field: 'year' }, y: { field: 'dot' } },
      edits: [move({ channels: ['x', 'y'], stage: 0 })],   //! you only ever move the dot
    }),
  ],
}));

const note = ui.note('');
const button = ui.button('Guess', () => {
  chart.nextStage();
  button.disabled = true;
  const yours = chart.getData().find((d) => d.year === end && d.dot == null).beds;
  note.innerHTML = ui.md('The number of beds has **dropped by almost 70%** since 1951, to ' +
    fmt(169e3) + ' in 2016. You drew ' + fmt(Math.round(yours / 1000) * 1000) + '.');
}, { disabled: true });
chart.on('change', () => {                                // a guess needs the line to reach 2016
  button.disabled = chart.getStage() > 0 || chart.getData().find((d) => d.dot != null).year < end;
});
mount(ui.row(button));
mount(note);`,
  },
  variants: [],
  needs: ['social-feedback'],
  gaps: [
    'The “Most readers’ guesses” band is an illustrative shape, not the Guardian’s collected guesses.',
    'Only the beds chart is recreated; the page’s other four (doctors, female GPs, spending per person, future funding) are left out, though their data ships in the same bundle.',
    'The original’s illustration (a bed) and its reveal paragraph are reduced to the headline sentence.',
  ],
});
