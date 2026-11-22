// Univariate slider guesses: FiveThirtyEight's poll quizzes and the Guardian's
// "how well do you know…" quizzes. Each asks for one number on a track, then
// reveals the truth beside the guess.

// ---------------------------------------------------------------- row-06 · 538 guns

VIBE.add({
  id: 'row-06',
  status: 'full',
  verdict: 'A black handle dragged along a 0–100 track; **Guess** retires the edit and a stage-gated guide draws the polling average, each poll, and the party averages.',
  original: {
    availability: 'archived',
    links: [
      { label: 'Wayback Machine, 13 Mar 2018', url: 'https://web.archive.org/web/20180313021401/https://projects.fivethirtyeight.com/guns-parkland-polling-quiz/' },
      { label: 'Poll data (GitHub, poll-quiz-guns)', url: 'https://github.com/fivethirtyeight/data/tree/master/poll-quiz-guns' },
    ],
    summary: 'Published 9 March 2018, after the Parkland shooting. The reader guesses what share of Americans support stricter gun laws, then eight specific measures (raising the purchase age to 21, universal background checks, blocking sales to people with a history of mental illness, arming teachers, banning assault weapons, banning high-capacity magazines, outlawing all guns), each on its own 0–100 slider.',
    steps: [
      'The handle starts at **50%**; the track has ticks at 25, 50 and 75, and "◂ Less support / More support ▸" under the handle.',
      'The reader drags the handle and presses **Guess**.',
      'The reveal marks the polling average ("Avg."), each poll as a dot ("Individual polls"), and the Republican and Democratic averages, with "Got it!", "Close!" or "Not quite." and a takeaway paragraph.',
      'Each guess was written to a Firebase database; the page never showed other readers’ guesses.',
    ],
    answers: 'Stricter gun laws: polling average 66% over 11 polls (Feb 16 – Mar 6, 2018: NPR/Ipsos 75, YouGov 63, CNN/SSRS 70, CBS 65, Marist 73, YouGov 58, Quinnipiac 66, Morning Consult 68, Quinnipiac 63, YouGov 61, Morning Consult 69); Republicans 46%, Democrats 87%. Age 21: 76% (R 67, D 86). Background checks: 87% (R 84, D 92). Mental illness: 86% (R 87, D 88). Arming teachers: 42% (R 72, D 17). Source: the page’s bundle and `guns-polls.csv`.',
  },
  strategy: {
    elicits: 'A point estimate of a share of the public (0–100%).',
    technique: 'A horizontal range slider with a round handle and a live % read-out. The guess is committed with a button; the reveal draws the truth and its spread (each poll, each party) on the same track.',
    inElicit: 'A `point` on `x` with `move()` gated to `stage: 0`, a `text` mark for the read-out that follows the same field, and a `guides.custom()` track. The button calls `nextStage()`: the edit retires, and a second guide that draws only at stage 1 lays the polls and averages on the track.',
  },
  recreation: {
    title: 'Drag, then Guess',
    question: 'What share of Americans support **stricter gun laws**?',
    try: 'Drag the black handle, then press Guess.',
    why: 'The answer is the `guess` column, written by `move()` on `x` through the track’s own scale. `stage: 0` on the edit freezes the handle once you press Guess, and the reveal guide reads `stage` so it draws only afterwards.',
    uses: ['move()', 'clamp()', 'snap()', 'stage', 'guides.custom()'],
    code: `// 538's poll quiz, stricter gun laws (11 polls, Feb–Mar 2018)
const polls = [75, 63, 70, 65, 73, 58, 66, 68, 63, 61, 69];
const avg = Math.round(d3.mean(polls)), gop = 46, dem = 87;

mount(ui.question("What share of Americans support **stricter gun laws**?"));
const chart = mount(Elicit({
  width: 460, height: 160, stage: 0,
  margins: { top: 50, right: 18, bottom: 60, left: 18 },
  axes: false,
  data: [{ guess: 50 }],
  schema: { guess: { type: "quantitative", domain: [0, 100] } },
  constraints: [clamp({ field: "guess", min: 0, max: 100 }), snap({ field: "guess", step: 1 })],
  guides: [
    guides.custom(({ scales, height, data, stage }) => {   // the grey track and its labels
      const y = height / 2, x = scales.x.encode, g = data[0].guess;
      return [
        { type: "line", x1: x(0), x2: x(100), y1: y, y2: y, stroke: "#ccc", strokeWidth: 8, strokeLinecap: "round", background: true },
        ...[25, 50, 75].map((v) => ({ type: "line", x1: x(v), x2: x(v), y1: y - 9, y2: y + 9, stroke: "#999", strokeWidth: 1, background: true })),
        ...[0, 25, 50, 75, 100].filter((v) => Math.abs(v - g) > 7)   // a tick label hides under the read-out
          .map((v) => ({ type: "text", x: x(v), y: y - 22, text: String(v), textAnchor: "middle", fontSize: 11, fill: "#888" })),
        ...(stage > 0 ? [] : [
          { type: "text", x: x(g) - 6, y: y + 28, text: "◂ LESS SUPPORT", textAnchor: "end", fontSize: 10, fill: "#444" },
          { type: "text", x: x(g) + 6, y: y + 28, text: "MORE SUPPORT ▸", textAnchor: "start", fontSize: 10, fill: "#444" },
        ]),
      ];
    }),
    guides.custom(({ scales, height, stage }) => {   //! the reveal draws only once you have guessed
      if (stage < 1) return [];
      const y = height / 2, x = scales.x.encode;
      const party = (v, label, fill) => [
        { type: "circle", cx: x(v), cy: y, r: 5, fill },
        { type: "text", x: x(v), y: y + 30, text: label + " " + v + "%", textAnchor: "middle", fontSize: 11, fill },
      ];
      return [
        ...polls.map((v) => ({ type: "circle", cx: x(v), cy: y, r: 3.5, fill: "#fff", stroke: "#555", strokeWidth: 1 })),
        { type: "line", x1: x(avg), x2: x(avg), y1: y - 14, y2: y + 14, stroke: "#ED713A", strokeWidth: 3 },
        { type: "text", x: x(avg), y: y - 34, text: "Avg. " + avg + "%", textAnchor: "middle", fontSize: 12, fontWeight: 700, fill: "#ED713A" },
        ...party(gop, "GOP avg.", "#E0393E"),
        ...party(dem, "Dem. avg.", "#1F8BD4"),
        { type: "text", x: x(polls[0]), y: y + 46, text: "○ individual polls", textAnchor: "middle", fontSize: 10, fill: "#555" },
      ];
    }),
  ],
  marks: [
    point({
      size: 11, fill: "#222",
      channels: { x: { field: "guess", edit: move({ stage: 0 }) } },   //! drag the handle along the track
    }),
    text({                                             // the live read-out above the handle
      fontSize: 13, fill: "#222", dy: -22,
      channels: { x: { field: "guess" }, text: { fn: (d) => Math.round(d.guess) + "%" } },
    }),
  ],
}));

const note = mount(ui.note(""));
const guess = ui.button("Guess", () => {
  chart.nextStage();                                   //! commit: the edit retires, the reveal guide draws
  const g = chart.getData()[0].guess, off = Math.abs(g - avg);
  note.innerHTML = ui.md("**" + (off < 3 ? "Got it!" : off < 10 ? "Close!" : "Not quite.") + "** The polling average shows " + avg + "% support; you guessed " + g + "%.");
  guess.disabled = true;
});
mount(ui.row(guess));`,
  },
  variants: [
    {
      title: 'Average and spread',
      question: 'Where do the polls on **stricter gun laws** land? Set their average, then stretch the bar over most of the polls.',
      try: 'Drag the dot to move the whole bar, drag either end to widen it, then press Guess.',
      why: 'The 538 reveal shows 11 polls, not one number, so this asks for both: `move()` on the dot and on each end, `follow` to carry the ends with the dot, and `ordering` to keep `lo ≤ guess ≤ hi`. The reveal counts the polls inside your bar.',
      uses: ['move()', 'follow()', 'ordering()', 'snap()', 'ruleY()', 'stage'],
      code: `const polls = [75, 63, 70, 65, 73, 58, 66, 68, 63, 61, 69];
const pct = { type: "quantitative", domain: [0, 100] };

mount(ui.question("Where do the polls on **stricter gun laws** land?"));
const chart = mount(Elicit({
  width: 460, height: 130, stage: 0,
  margins: { top: 40, right: 18, bottom: 34, left: 18 },
  axes: { x: { tickValues: [0, 25, 50, 75, 100], tickFormat: (v) => v + "%" } },
  data: [{ lo: 35, guess: 50, hi: 65 }],
  schema: { lo: pct, guess: pct, hi: pct },
  constraints: [
    follow({ field: ["lo", "hi"], lead: "guess" }),   //! the bar travels with its centre
    ordering({ field: ["lo", "guess", "hi"] }),      //! lo ≤ guess ≤ hi
    clamp({ field: ["lo", "guess", "hi"], min: 0, max: 100 }),
    snap({ field: ["lo", "guess", "hi"], step: 1 }),
  ],
  guides: [
    guides.custom(({ scales, height, stage }) => stage < 1 ? [] : polls.map((v) => ({
      type: "circle", cx: scales.x.encode(v), cy: height / 2 - 20, r: 4, fill: "#ED713A",
    }))),
  ],
  marks: [
    ruleY({ stroke: "#bbb", strokeWidth: 8, channels: { x1: { field: "lo" }, x2: { field: "hi" } } }),
    point({ size: 6, fill: "#555", channels: { x: { field: "lo", edit: move({ stage: 0 }) } } }),   //! drag an end to widen
    point({ size: 6, fill: "#555", channels: { x: { field: "hi", edit: move({ stage: 0 }) } } }),
    point({ size: 11, fill: "#222", channels: { x: { field: "guess", edit: move({ stage: 0 }) } } }),
  ],
}));

const note = mount(ui.note(""));
const guess = ui.button("Guess", () => {
  chart.nextStage();
  const { lo, guess: g, hi } = chart.getData()[0];
  const inside = polls.filter((v) => v >= lo && v <= hi).length;
  note.innerHTML = ui.md("Your bar, " + lo + "–" + hi + "%, holds **" + inside + " of the " + polls.length + " polls** (orange). Their average is " + Math.round(d3.mean(polls)) + "%; you said " + g + "%.");
  guess.disabled = true;
});
mount(ui.row(guess));`,
    },
    {
      title: 'Five measures at once',
      question: 'What share of Americans support each of these measures?',
      try: 'Drag each handle along its row, then press Guess.',
      why: 'One row per measure on a band `y` scale turns five sliders into one chart, so you rank the measures as you guess them. `move({ channels: ["x"] })` keeps each handle on its row; the answers arrive in an empty `avg` column drawn by its own `point` and `ruleY`, which draw nothing until it is set.',
      uses: ['move()', 'stage', 'chart.set()', 'ruleY()'],
      code: `// 538's polling averages (Feb–Mar 2018), from its poll-quiz-guns data
const measures = [
  ["Stricter gun laws", 66], ["Purchase age of 21", 76], ["Background checks", 87],
  ["Block sales: mental illness", 86], ["Arming teachers", 42],
];

mount(ui.question("What share of Americans support each measure?"));
const chart = mount(Elicit({
  width: 460, height: 260, stage: 0,
  margins: { top: 10, right: 20, bottom: 30, left: 170 },
  axes: { x: { tickValues: [0, 25, 50, 75, 100], tickFormat: (v) => v + "%", grid: true }, y: { tickSize: 0 } },
  data: measures.map(([m]) => ({ measure: m, guess: 50, avg: null })),
  schema: {
    measure: { type: "categorical", domain: measures.map((d) => d[0]).reverse() },   // first question on top
    guess: { type: "quantitative", domain: [0, 100] },
    avg: { type: "quantitative", domain: [0, 100] },
  },
  constraints: [snap({ field: "guess", step: 1 })],
  marks: [
    ruleY({ stroke: "#ED713A", strokeWidth: 2, channels: { y: { field: "measure" }, x1: { field: "guess" }, x2: { field: "avg" } } }),
    point({ size: 6, fill: "#ED713A", channels: { y: { field: "measure" }, x: { field: "avg" } } }),   //! the averages, once set
    point({
      size: 9, fill: "#222",
      channels: { y: { field: "measure" }, x: { field: "guess", edit: move({ channels: ["x"], stage: 0 }) } },  //! one handle per row
    }),
  ],
}));

const note = mount(ui.note(""));
const guess = ui.button("Guess", () => {
  measures.forEach(([, v], i) => chart.set("avg", v, { index: i }));   //! reveal every average at once
  chart.nextStage();
  const off = d3.mean(chart.getData(), (d) => Math.abs(d.guess - d.avg));
  note.innerHTML = ui.md("Orange dots are the polling averages. You were off by **" + off.toFixed(0) + " points** on average.");
  guess.disabled = true;
});
mount(ui.row(guess));`,
    },
  ],
  needs: [],
  gaps: [
    'Only the first of the eight questions is recreated; the others use the same slider (the second variant asks five of them on one chart).',
    'The 538 typefaces, the beige card behind the slider and the takeaway paragraphs are left out.',
    'The original’s Firebase log of guesses is not reproduced; it was never shown to readers.',
  ],
});

// ---------------------------------------------------------------- row-10 · 538 Sanders

VIBE.add({
  id: 'row-10',
  status: 'full',
  verdict: 'The 538 slider with a grey handle, run through all six policy questions; **Guess** writes the poll result and its margin of error into empty columns, and **Next** reseeds the row.',
  original: {
    availability: 'archived',
    links: [
      { label: 'Wayback Machine, 13 Mar 2020', url: 'https://web.archive.org/web/20200313104105/https://projects.fivethirtyeight.com/sanders-poll-quiz/' },
    ],
    summary: 'Published 13 March 2020 as "Pop Quiz: Which Sanders Policies Are Popular?". Six questions, each a 0–100 slider: legal marijuana, Medicare for All, free public college, a wealth tax, decriminalising border crossings, and reparations for slavery. Each guess is answered by one named poll.',
    steps: [
      'The handle starts at **50%**, with ticks at 25, 50 and 75.',
      'The reader drags it and presses **Guess**.',
      'The slider fades; a marker shows the poll result, a band shows its **margin of error**, and a bar joins the guess to the result. A sentence names the poll and a takeaway paragraph follows.',
    ],
    answers: 'Legal marijuana 66% (Gallup, Oct 2019, ±3); Medicare for All 42% (NPR/PBS/Marist, Dec 2019, ±3.5); free public college 58% (NBC/WSJ, Sept 2019, ±3.27); a 2% wealth tax over $50m 68% (Fox News, Dec 2019, ±3); decriminalising border crossings 29% (NPR/PBS/Marist, Dec 2019, ±3.5); reparations 29% (AP-NORC, Sept 2019, ±3.8). Values and margins from the page’s archived bundle.',
  },
  strategy: {
    elicits: 'A point estimate of public support for a policy (0–100%).',
    technique: 'A horizontal slider and a **Guess** button, once per question. The reveal is the only place the piece shows uncertainty: the poll’s margin of error as a band.',
    inElicit: 'One row with an empty `poll`, `lo` and `hi`. A `ruleY` over `lo`–`hi` draws the margin, a `ruleY` from `guess` to `poll` draws the miss, and a `point` draws the poll; all three draw nothing until **Guess** calls `chart.set()`. **Next** calls `setData()` and `setStage(0)` for the next question.',
  },
  recreation: {
    title: 'Six questions',
    question: 'What percentage of Americans supports making **marijuana use legal**?',
    try: 'Drag the grey handle, press Guess, then Next for the next policy.',
    why: 'The answer is `guess`, written by `move()` at `stage: 0`. The reveal fills three empty columns with `chart.set()`, so the margin band, the miss and the poll marker appear only then. `setData()` plus `setStage(0)` starts the next question on the same chart.',
    uses: ['move()', 'snap()', 'stage', 'chart.set()', 'setData()', 'ruleY()'],
    code: `// Polls and margins of error from 538's quiz (Mar 2020)
const qs = [
  ["supports making **marijuana use legal**", 66, 3, "Gallup, Oct. 2019"],
  ["thinks **Medicare for All** is a good idea", 42, 3.5, "NPR/PBS/Marist, Dec. 2019"],
  ["of voters support **free tuition** at state colleges", 58, 3.27, "NBC/WSJ, Sept. 2019"],
  ["of voters favor a **2% wealth tax** over $50 million", 68, 3, "Fox News, Dec. 2019"],
  ["thinks **decriminalizing border crossings** is a good idea", 29, 3.5, "NPR/PBS/Marist, Dec. 2019"],
  ["thinks the government should pay **reparations** for slavery", 29, 3.8, "AP-NORC, Sept. 2019"],
];
const fresh = () => [{ guess: 50, poll: null, lo: null, hi: null }];
const pct = { type: "quantitative", domain: [0, 100] };
let k = 0;

const q = mount(ui.question(""));
const chart = mount(Elicit({
  width: 460, height: 120, stage: 0,
  margins: { top: 40, right: 18, bottom: 30, left: 18 },
  axes: false,
  data: fresh(),
  schema: { guess: pct, poll: pct, lo: pct, hi: pct },
  constraints: [snap({ field: "guess", step: 1 })],
  guides: [
    guides.custom(({ scales, height, data }) => {
      const y = height / 2, x = scales.x.encode, g = data[0].guess;
      return [
        { type: "line", x1: x(0), x2: x(100), y1: y, y2: y, stroke: "#bbb", strokeWidth: 6, strokeLinecap: "round", background: true },
        ...[25, 50, 75].map((v) => ({ type: "line", x1: x(v), x2: x(v), y1: y - 10, y2: y + 10, stroke: "#777", background: true })),
        ...[0, 25, 50, 75, 100].filter((v) => Math.abs(v - g) > 7)
          .map((v) => ({ type: "text", x: x(v), y: y - 26, text: String(v), textAnchor: "middle", fontSize: 11, fill: "#999" })),
      ];
    }),
  ],
  marks: [
    ruleY({ stroke: "#F3B48B", strokeWidth: 20, opacity: 0.6, channels: { x1: { field: "lo" }, x2: { field: "hi" } } }),  //! margin of error, once set
    ruleY({ stroke: "#555", strokeWidth: 3, channels: { x1: { field: "guess" }, x2: { field: "poll" } } }),
    point({
      size: 10, fill: "#bbb", stroke: "#444", strokeWidth: 1.5,
      channels: { x: { field: "guess", edit: move({ stage: 0 }) } },   //! the guess, live until Guess
    }),
    text({ fontSize: 13, fill: "#222", dy: -24, channels: { x: { field: "guess" }, text: { fn: (d) => d.guess + "%" } } }),
    point({ size: 6, fill: "#ED713A", stroke: "#fff", strokeWidth: 1.5, channels: { x: { field: "poll" } } }),   // drawn over the handle
    text({ fontSize: 12, fontWeight: 700, fill: "#ED713A", dy: 24, channels: { x: { field: "poll" }, text: { fn: (d) => d.poll + "%" } } }),
  ],
}));

const note = mount(ui.note(""));
const show = () => {
  q.innerHTML = ui.md((k + 1) + " of " + qs.length + ". What percentage of Americans " + qs[k][0] + "?");
  note.innerHTML = "";
};
const btn = ui.button("Guess", () => {
  if (chart.getStage() === 0) {
    const [, poll, moe, src] = qs[k];
    chart.set("poll", poll);                           //! the reveal fills the empty columns
    chart.set("lo", poll - moe);
    chart.set("hi", poll + moe);
    chart.nextStage();
    note.innerHTML = ui.md("**" + poll + "%** in the " + src + " poll (margin of error ±" + moe + "). You guessed " + chart.getData()[0].guess + "%.");
    btn.textContent = k < qs.length - 1 ? "Next" : "Done";
    btn.disabled = k === qs.length - 1;
  } else {
    k += 1;
    chart.setData(fresh());                            //! next question: a fresh row
    chart.setStage(0);
    btn.textContent = "Guess";
    show();
  }
});
mount(ui.row(btn));
show();`,
  },
  variants: [
    {
      title: 'Spread 20 tokens',
      question: 'Where does support for **legal marijuana** really lie? Spread 20 tokens over the ranges you think likely.',
      try: 'Click a column to drop a token (alt-click removes one), place all 20, then press Guess.',
      why: 'The original reveals a margin of error but never asks for one. `widgets.probabilityTokens` asks for a whole distribution: each token is one chance in 20. The widget takes `stage: 0`, and a stage-gated guide shades the bin the Gallup result fell in.',
      uses: ['widgets.probabilityTokens()', 'stage', 'guides.custom()'],
      code: `const bins = ["0–20", "20–40", "40–50", "50–60", "60–70", "70–80", "80–100"];
const spec = widgets.probabilityTokens({
  question: "Support for legal marijuana (%)",
  bins, maxTokens: 20, stage: 0,                       //! 20 tokens, each a 5% chance
  width: 460, height: 260,
});
spec.stage = 0;
spec.guides.push(guides.custom(({ scales, width, height, stage }) => {   //! after Guess: the poll's bin
  if (stage < 1) return [];
  const w = width / bins.length, cx = scales.x.encode("60–70");
  return [
    { type: "rect", x: cx - w / 2, y: 20, width: w, height: height - 20, fill: "#ED713A", opacity: 0.15 },
    { type: "text", x: cx, y: 14, text: "Gallup: 66% ± 3", textAnchor: "middle", fontSize: 12, fontWeight: 700, fill: "#ED713A" },
  ];
}));
const chart = mount(Elicit(spec));

const note = mount(ui.note(""));
const guess = ui.button("Guess", () => {
  const n = chart.getData().length;
  if (n < 20) { note.innerHTML = ui.md("Place all 20 tokens first (" + n + " so far)."); return; }
  chart.nextStage();
  const hit = chart.getData().filter((d) => d.bin === "60–70").length;
  note.innerHTML = ui.md("You gave the 60–70 range **" + hit * 5 + "%**. Gallup found 66%, with a margin of error of ±3.");
  guess.disabled = true;
});
mount(ui.row(guess));`,
    },
  ],
  needs: [],
  gaps: [
    'The marker, band and miss colours are approximations of the 538 styling; the band is labelled in the note, not on the chart.',
    'The verdict words and takeaway paragraphs after each reveal are left out.',
    'Each question reseeds the chart, so `getData()` holds the current question’s guess only.',
  ],
});

// ---------------------------------------------------------------- row-11 · 538 racism

VIBE.add({
  id: 'row-11',
  status: 'full',
  verdict: 'Two handles on one track, teal for Black and pink for white respondents, joined by a dark bar; no `ordering`, since either group can be higher. **Guess** draws the true pair and its gap beneath.',
  original: {
    availability: 'archived',
    links: [
      { label: 'Wayback Machine, 11 Jun 2020', url: 'https://web.archive.org/web/20200611044852/https://projects.fivethirtyeight.com/racism-polls/' },
    ],
    summary: 'Published 10 June 2020, after the police killing of George Floyd in Minneapolis. Eight questions, each asking what share of Black and of white respondents gave an answer. The reader sets both shares on one 0–100 track; the bar between the two handles is the racial gap.',
    steps: [
      'Two handles sit on a grey track: teal for Black respondents, pink for white respondents, with a dark bar between them.',
      'The reader drags each handle and presses **Guess**.',
      'The true shares appear with a sentence: "63% of white and 91% of black respondents said …, a difference of 28 points", and the source.',
    ],
    answers: 'White / Black: police treat Black and white people unequally 63 / 91 (YouGov, May 29–30, 2020); support the protests 49 / 77 (Morning Consult); race a major factor in Floyd’s death 55 / 88 (YouGov); police more likely to use excessive force on a Black person 49 / 87 (Monmouth); trust local police 77 / 36 (Axios/Ipsos); justice system treats whites better 57 / 94 (YouGov); not gone far enough on equal rights 37 / 78 (Pew, 2019); Black people will likely get equal rights 80 / 35 (Pew, 2019). Text of the archived page.',
  },
  strategy: {
    elicits: 'Two linked point estimates, and so their difference: the share of each group giving an answer (0–100%).',
    technique: 'Two handles on one slider, coloured by group, with the gap drawn as a bar. The gap, not either number, is what the piece is about.',
    inElicit: 'One row with `black` and `white` columns. Two `point` marks each `move()` their own column on the same `x` scale, and a `ruleY` from `black` to `white` draws the gap. There is deliberately no `ordering` constraint: on trust in police the white share is higher. The truth lives in two empty columns drawn on a second line.',
  },
  recreation: {
    title: 'Two handles, one gap',
    question: 'What percentage of **Black** and **white** respondents said Black and white people do not receive equal treatment from the police?',
    try: 'Drag the teal and pink handles, press Guess, then Next.',
    why: 'Each handle is a `point` whose `move()` writes its own column; the bar is a `ruleY` over both, so it stretches as you drag. With no `ordering`, the handles can cross. The reveal sets `tBlack` and `tWhite`, which a second set of marks draws on a lower line.',
    uses: ['move()', 'ruleY()', 'stage', 'chart.set()', 'setData()'],
    code: `const T = "#3EBFC4", P = "#F0577F";               // 538's teal (Black) and pink (white)
const qs = [
  ["said Black people and white people do not receive equal treatment from the police", 91, 63, "YouGov, May 29–30, 2020"],
  ["“strongly” or “somewhat” support the protests after Floyd’s death", 77, 49, "Morning Consult, May 31–June 1, 2020"],
  ["said race was a “major factor” in Floyd’s death", 88, 55, "YouGov, May 29–30, 2020"],
  ["said police are more likely to use excessive force if the person is Black", 87, 49, "Monmouth University, May 28–June 1, 2020"],
  ["trust local police to look out for them and their family", 36, 77, "Axios/Ipsos, May 29–June 1, 2020"],
  ["said the criminal justice system “treats whites better”", 94, 57, "YouGov, May 29–30, 2020"],
  ["said the country hasn’t gone far enough in giving Black people equal rights", 78, 37, "Pew Research Center, 2019"],
  ["said Black people will “very” or “somewhat” likely have equal rights eventually", 35, 80, "Pew Research Center, 2019"],
];
const fresh = () => [{ black: 40, white: 60, tBlack: null, tWhite: null }];
const pct = { type: "quantitative", domain: [0, 100] };
let k = 0;

const q = mount(ui.question(""));
const chart = mount(Elicit({
  width: 460, height: 150, stage: 0,
  margins: { top: 34, right: 18, bottom: 34, left: 18 },
  axes: false,
  data: fresh(),
  schema: { black: pct, white: pct, tBlack: pct, tWhite: pct },
  constraints: [snap({ field: ["black", "white"], step: 1 })],     // no ordering: either may be higher
  guides: [
    guides.custom(({ scales, height }) => {
      const y = height / 3, x = scales.x.encode;
      return [
        { type: "line", x1: x(0), x2: x(100), y1: y, y2: y, stroke: "#d4d4d4", strokeWidth: 8, strokeLinecap: "round", background: true },
        ...[25, 75].map((v) => ({ type: "line", x1: x(v), x2: x(v), y1: y - 12, y2: y + 12, stroke: "#999", background: true })),
        ...[0, 25, 50, 75, 100].map((v) => ({ type: "text", x: x(v), y: y - 20, text: v ? String(v) : "0%", textAnchor: "middle", fontSize: 11, fill: "#999" })),
      ];
    }),
  ],
  marks: [
    ruleY({ stroke: "#666", strokeWidth: 8, channels: { y: { value: 27 }, x1: { field: "black" }, x2: { field: "white" } } }),  //! the gap you believe in
    point({ size: 10, fill: T, stroke: "#333", strokeWidth: 1.5, channels: { y: { value: 27 }, x: { field: "black", edit: move({ stage: 0 }) } } }),  //! one handle per group
    point({ size: 10, fill: P, stroke: "#333", strokeWidth: 1.5, channels: { y: { value: 27 }, x: { field: "white", edit: move({ stage: 0 }) } } }),
    // the truth, on a second line, once set
    ruleY({ stroke: "#222", strokeWidth: 3, channels: { y: { value: 66 }, x1: { field: "tBlack" }, x2: { field: "tWhite" } } }),
    point({ size: 6, fill: T, channels: { y: { value: 66 }, x: { field: "tBlack" } } }),
    point({ size: 6, fill: P, channels: { y: { value: 66 }, x: { field: "tWhite" } } }),
    text({ fontSize: 12, fontWeight: 700, fill: T, dy: 18, channels: { y: { value: 66 }, x: { field: "tBlack" }, text: { fn: (d) => d.tBlack + "%" } } }),
    text({ fontSize: 12, fontWeight: 700, fill: P, dy: 18, channels: { y: { value: 66 }, x: { field: "tWhite" }, text: { fn: (d) => d.tWhite + "%" } } }),
  ],
}));

const note = mount(ui.note(""));
const show = () => {
  q.innerHTML = (k + 1) + " of " + qs.length + ". What percentage of <b style='color:" + T + "'>black</b> and <b style='color:" + P + "'>white</b> respondents " + qs[k][0] + "?";
  note.innerHTML = "";
};
const btn = ui.button("Guess", () => {
  if (chart.getStage() === 0) {
    const [, b, w, src] = qs[k];
    chart.set("tBlack", b);                             //! reveal both shares
    chart.set("tWhite", w);
    chart.nextStage();
    const g = chart.getData()[0];
    note.innerHTML = ui.md(w + "% of white and " + b + "% of Black respondents: a difference of **" + Math.abs(b - w) + " points**. You guessed a gap of " + Math.abs(g.black - g.white) + ". Source: " + src + ".");
    btn.textContent = "Next";
    btn.disabled = k === qs.length - 1;
  } else {
    k += 1;
    chart.setData(fresh());
    chart.setStage(0);
    btn.textContent = "Guess";
    show();
  }
});
mount(ui.row(btn));
show();`,
  },
  variants: [
    {
      title: 'A range per group',
      question: 'What share of **Black** and **white** respondents said police treat the races unequally? Give a best guess and a range for each.',
      try: 'Drag each dot, and drag the end caps to widen its range, then press Guess.',
      why: 'Two rows on a band `y` scale, one per group, each a best guess with `lo` and `hi` ends. `follow` carries the ends with the dot and `ordering` keeps them on either side, per row. The reveal sets a `truth` column that draws an orange tick, and the note says which ranges caught it.',
      uses: ['move()', 'follow()', 'ordering()', 'ruleY()', 'tickX()', 'chart.set()'],
      code: `const groups = [["Black respondents", 91, "#3EBFC4"], ["White respondents", 63, "#F0577F"]];
const pct = { type: "quantitative", domain: [0, 100] };

mount(ui.question("Police treat Black and white people **unequally**: what share of each group said so?"));
const chart = mount(Elicit({
  width: 460, height: 190, stage: 0,
  margins: { top: 10, right: 20, bottom: 30, left: 130 },
  axes: { x: { tickValues: [0, 25, 50, 75, 100], tickFormat: (v) => v + "%", grid: true }, y: { tickSize: 0 } },
  data: groups.map(([g]) => ({ group: g, lo: 40, guess: 55, hi: 70, truth: null })),
  schema: { group: { type: "categorical", domain: groups.map((d) => d[0]).reverse() }, lo: pct, guess: pct, hi: pct, truth: pct },
  constraints: [
    follow({ field: ["lo", "hi"], lead: "guess" }),   //! each range travels with its dot
    ordering({ field: ["lo", "guess", "hi"] }),
    clamp({ field: ["lo", "guess", "hi"], min: 0, max: 100 }),
    snap({ field: ["lo", "guess", "hi"], step: 1 }),
  ],
  marks: [
    ruleY({ stroke: (d) => d.group[0] === "B" ? "#3EBFC4" : "#F0577F", strokeWidth: 6, opacity: 0.45,
      channels: { y: { field: "group" }, x1: { field: "lo" }, x2: { field: "hi" } } }),
    tickX({ stroke: "#777", strokeWidth: 2, channels: { y: { field: "group" }, x: { field: "lo", edit: move({ channels: ["x"], stage: 0 }) } } }),   //! drag a cap to widen
    tickX({ stroke: "#777", strokeWidth: 2, channels: { y: { field: "group" }, x: { field: "hi", edit: move({ channels: ["x"], stage: 0 }) } } }),
    point({ size: 9, fill: (d) => d.group[0] === "B" ? "#3EBFC4" : "#F0577F", stroke: "#333", strokeWidth: 1.5,
      channels: { y: { field: "group" }, x: { field: "guess", edit: move({ channels: ["x"], stage: 0 }) } } }),
    tickX({ stroke: "#ED713A", strokeWidth: 4, channels: { y: { field: "group" }, x: { field: "truth" } } }),  //! the truth, once set
  ],
}));

const note = mount(ui.note(""));
const guess = ui.button("Guess", () => {
  groups.forEach(([, v], i) => chart.set("truth", v, { index: i }));
  chart.nextStage();
  const caught = chart.getData().filter((d) => d.truth >= d.lo && d.truth <= d.hi).length;
  note.innerHTML = ui.md("Orange ticks: 91% and 63% (YouGov, May 2020). Your ranges caught **" + caught + " of 2**.");
  guess.disabled = true;
});
mount(ui.row(guess));`,
    },
  ],
  needs: [],
  gaps: [
    'The true pair is drawn on a second line under the track rather than replacing the handles in place.',
    'Handle colours are matched by eye; the 538 typefaces are left out.',
    'Each question reseeds the chart, so `getData()` holds the current question’s guesses only.',
  ],
});

// ---------------------------------------------------------------- row-23 · Guardian EU quiz

VIBE.add({
  id: 'row-23',
  status: 'full',
  verdict: 'The Guardian’s thin 0%–100% track with a big cyan handle, chevrons and a "?"; **See your results** fills empty columns that draw the actual value on a second line and the average reader’s guess beside yours.',
  original: {
    availability: 'live',
    links: [
      { label: 'Questions and answers (Guardian docsdata JSON)', url: 'https://interactive.guim.co.uk/docsdata/16hTJg_J1H1V_iT3bN5xTN1ZTQ0st4ybAYuZq8GAEobw.json' },
      { label: 'Average reader guesses (Guardian quiz-aggregates JSON)', url: 'https://interactive.guim.co.uk/quiz-aggregates/averages-16hTJg_J1H1V_iT3bN5xTN1ZTQ0st4ybAYuZq8GAEobw.json' },
    ],
    summary: 'Published 2 June 2016, three weeks before the Brexit referendum. Fifteen questions on the EU budget, trade, law-making, benefits and migration, each answered on a slider whose range fits the question (0–100% for shares, 0–10,000 for legislative acts, 1–15 years for the "emergency brake").',
    steps: [
      'A large cyan handle with ‹ › chevrons and a grey "?" sits mid-track; the track is labelled 0% and 100% at its ends.',
      'The reader drags it and moves on; **See your results** reveals each answer.',
      'Each reveal draws the reader’s guess and the average reader’s guess on one line and the actual value on a line below, says "Your answer is X higher than the actual value", and cites the source.',
      'A results card compares the reader’s overall error with other Guardian readers’ ("You are smarter than the average reader!").',
    ],
    answers: 'Q1, UK share of the EU budget: 12.57% (HM Treasury, European Union Finances 2015); the average of 60,914 readers’ guesses was 14.4%. Other answers include 6% spent on administration, 44% of UK exports and 53% of imports with the EU (2014), 2,086 legislative acts in 2015, and 4.4% of NHS staff from the EU.',
  },
  strategy: {
    elicits: 'A point estimate of a share (0–100%), one question at a time.',
    technique: 'A Guardian slider: a big round handle on a hairline track, no ticks or read-out while guessing ("?"). The reveal compares three numbers: you, the average reader and the truth.',
    inElicit: 'One row with `guess`, and empty `actual` and `readers` columns. The handle is a `point` with `move()` at `stage: 0`; the chevrons and "?" are `text` marks on the same field, whose `fn` hides them once `actual` is set. Each reveal mark has a fixed pixel `y`, so the truth gets its own line.',
  },
  recreation: {
    title: 'Drag, then results',
    question: 'What proportion of the EU’s budget does the UK contribute?',
    try: 'Drag the cyan handle, then press See your results.',
    why: 'The guess is `move()` on `x` at `stage: 0`. The reveal writes `actual` and `readers` with `chart.set()`, which the marks on the second line (and the grey reader dot) wait for. The chevrons read `actual` in their `fn`, so they disappear on reveal.',
    uses: ['move()', 'stage', 'chart.set()', 'text()'],
    code: `const C = "#4BC6DF", ACTUAL = "#FFBB00";            // the quiz sheet's color_you and color_actual
const truth = 12.57, readers = 14.4;                    // HM Treasury 2015; mean of 60,914 readers
const pct = { type: "quantitative", domain: [0, 100] };
const row1 = 34, row2 = 92;                             // pixel lines: guesses, then the truth

mount(ui.question("1. What proportion of the EU's budget does the UK contribute?"));
const chart = mount(Elicit({
  width: 460, height: 170, stage: 0,
  margins: { top: 30, right: 46, bottom: 16, left: 40 },
  axes: false,
  data: [{ guess: 50, actual: null, readers: null }],
  schema: { guess: pct, actual: pct, readers: pct },
  constraints: [snap({ field: "guess", step: 0.5 })],
  guides: [
    guides.custom(({ scales, data }) => {
      const x = scales.x.encode, lines = data[0].actual == null ? [row1] : [row1, row2];
      return lines.flatMap((y) => [
        { type: "line", x1: x(0), x2: x(100), y1: y, y2: y, stroke: "#eee", strokeWidth: 6, strokeLinecap: "round", background: true },
        { type: "text", x: x(0) - 10, y: y + 4, text: "0%", textAnchor: "end", fontSize: 12, fill: "#bbb" },
        { type: "text", x: x(100) + 10, y: y + 4, text: "100%", textAnchor: "start", fontSize: 12, fill: "#bbb" },
      ]);
    }),
  ],
  marks: [
    point({ size: 6, fill: "#9a9a9a", channels: { y: { value: row1 }, x: { field: "readers" } } }),
    text({ fontSize: 11, fill: "#888", dy: 26, channels: { y: { value: row1 }, x: { field: "readers" }, text: { fn: (d) => "Readers " + d.readers + "%" } } }),
    point({ size: 16, fill: C, channels: { y: { value: row1 }, x: { field: "guess", edit: move({ stage: 0 }) } } }),   //! the big handle
    text({ fontSize: 26, fill: C, dx: -26, lineAnchor: "middle", channels: { y: { value: row1 }, x: { field: "guess" }, text: { fn: (d) => d.actual == null ? "‹" : "" } } }),
    text({ fontSize: 26, fill: C, dx: 26, lineAnchor: "middle", channels: { y: { value: row1 }, x: { field: "guess" }, text: { fn: (d) => d.actual == null ? "›" : "" } } }),
    text({ fontSize: 18, fontWeight: 700, fill: "#bbb", dy: -30, channels: { y: { value: row1 }, x: { field: "guess" },
      text: { fn: (d) => d.actual == null ? "?" : "You " + Math.round(d.guess) + "%" } } }),  //! "?" until the reveal
    point({ size: 10, fill: ACTUAL, channels: { y: { value: row2 }, x: { field: "actual" } } }),   //! the truth's own line
    text({ fontSize: 12, fontWeight: 700, fill: "#c98f00", dy: 24, channels: { y: { value: row2 }, x: { field: "actual" }, text: { fn: (d) => "Actual " + d.actual + "%" } } }),
  ],
}));

const note = mount(ui.note(""));
const btn = ui.button("See your results", () => {
  chart.set("actual", truth);                          //! reveal: the truth and the crowd
  chart.set("readers", readers);
  chart.nextStage();
  const d = +(chart.getData()[0].guess - truth).toFixed(1);
  note.innerHTML = ui.md(d === 0 ? "Your answer is correct!" : "Your answer is **" + Math.abs(d) + " points " + (d > 0 ? "higher" : "lower") + "** than the actual value. Source: HM Treasury, European Union Finances 2015.");
  btn.disabled = true;
});
mount(ui.row(btn));`,
  },
  variants: [
    {
      title: 'Guess, then how sure',
      question: 'What proportion of the EU’s budget does the UK contribute? Give a guess, then a range you are 80% sure of.',
      try: 'Drag the handle and press Set my range; drag either cap (the other mirrors it), then press See your results.',
      why: 'Two stages split the answer: `move()` on the guess at `stage: 0`, then on the caps at `stage: 1`. `symmetric` mirrors one cap about the guess, so the range is a ± around it, and `follow` keeps it centred while you still move the guess.',
      uses: ['move()', 'stage', 'symmetric()', 'follow()', 'chart.set()'],
      code: `const C = "#4BC6DF", truth = 12.57;
const pct = { type: "quantitative", domain: [0, 100] };

mount(ui.question("What proportion of the EU's budget does the UK contribute?"));
const chart = mount(Elicit({
  width: 460, height: 130, stage: 0,
  stageLabels: ["guess", "range", "results"],
  margins: { top: 26, right: 46, bottom: 30, left: 40 },
  axes: { x: { tickValues: [0, 25, 50, 75, 100], tickFormat: (v) => v + "%", line: false } },
  data: [{ lo: 40, guess: 50, hi: 60, actual: null }],
  schema: { lo: pct, guess: pct, hi: pct, actual: pct },
  constraints: [
    follow({ field: ["lo", "hi"], lead: "guess" }),
    symmetric({ field: ["lo", "hi"], about: "guess" }),   //! one cap mirrors the other
    ordering({ field: ["lo", "guess", "hi"] }),
    clamp({ field: ["lo", "guess", "hi"], min: 0, max: 100 }),
  ],
  marks: [
    ruleY({ stroke: C, strokeWidth: 14, opacity: 0.3, channels: { x1: { field: "lo" }, x2: { field: "hi" } } }),
    tickX({ stroke: "#2a8aa0", strokeWidth: 3, length: 26, channels: { x: { field: "lo", edit: move({ stage: 1 }) } } }),   //! stage 1: the range
    tickX({ stroke: "#2a8aa0", strokeWidth: 3, length: 26, channels: { x: { field: "hi", edit: move({ stage: 1 }) } } }),
    point({ size: 14, fill: C, channels: { x: { field: "guess", edit: move({ stage: 0 }) } } }),   //! stage 0: the guess
    tickX({ stroke: "#FFBB00", strokeWidth: 5, length: 40, channels: { x: { field: "actual" } } }),
  ],
}));

const note = mount(ui.note(""));
const btn = ui.button("Set my range ›", () => {
  if (chart.getStage() === 0) { chart.nextStage(); btn.textContent = "See your results"; return; }
  chart.set("actual", truth);
  chart.nextStage();                                   // stage 2: nothing is editable
  const { lo, hi } = chart.getData()[0];
  note.innerHTML = ui.md("Actual: **12.57%** (yellow). Your range, " + Math.round(lo) + "–" + Math.round(hi) + "%, " + (truth >= lo && truth <= hi ? "**caught it**." : "**missed it**."));
  btn.disabled = true;
});
mount(ui.row(btn));`,
    },
  ],
  needs: ['social-feedback'],
  gaps: [
    'Only the first of the fifteen questions is recreated, and the closing results card (your error against other readers’) is left out.',
    'The average reader’s guess is the real archived aggregate (60,914 answers), drawn as a fixed value; the live quiz recomputed it from a server.',
    'The Guardian typefaces and the reveal’s colour-coded difference are left out.',
  ],
});

// ---------------------------------------------------------------- row-25 · Guardian, Perils of Perception

VIBE.add({
  id: 'row-25',
  status: 'full',
  verdict: 'You pick your country on an Elicit.js grid (a `cycle` click, kept to one by a custom constraint), then guess its immigrant share on a crimson-handled slider; the reveal lays all 32 countries’ average guesses and true values on two lines, yours highlighted.',
  original: {
    availability: 'live',
    links: [
      { label: 'Survey data (perils2.csv, Guardian visuals)', url: 'https://visuals.guim.co.uk/2015/11/perils-perception/1449160007081/assets/data/perils2.csv' },
      { label: 'Ipsos, Perils of Perception 2015', url: 'https://www.ipsos.com/en-uk/perils-perception-2015' },
    ],
    summary: 'Published 2 December 2015 with Ipsos MORI’s Perils of Perception survey of 33 countries. The reader first names the country they know best, then answers ten questions about it (immigrants, religion, the wealth of the top 1%, obesity, women in parliament, internet access, young adults living with parents, women in work, rural population) on 0–100 sliders.',
    steps: [
      'The reader types a country into a text box ("United States") and presses **Start the quiz ›**.',
      'Each question names that country: "What percentage of the United States population do you think are immigrants…?" A crimson handle with chevrons and a "?" starts mid-track.',
      'The reveal draws two lines: every surveyed country’s average guess (with "YOU" among them) and every country’s actual value, each dot coloured by how wrong that country was, with yours labelled.',
      'A final ranking compares how well people in your country know it, and the reader’s guesses were posted to a server.',
    ],
    answers: 'Immigrant share, average guess vs actual: United States 33% vs 14.3%, UK 25% vs 13%, Germany 26% vs 11.9%, Brazil 25% vs 0.3%, Saudi Arabia 24% vs 31.4%, Norway 16.2% vs 13.8% (sources per country: UN, Pew, census data). 32 of the 33 countries have this question (Turkey is blank).',
  },
  strategy: {
    elicits: 'A point estimate of a share of your own country’s population (0–100%), after a categorical choice of country.',
    technique: 'A personalising first step, then the Guardian slider. The reveal is social at country level: your guess against your compatriots’ average and every other country’s.',
    inElicit: 'Two charts. The first holds a row per country with a `pick` column: `cycle()` on its fill steps it between "no" and "yes", and a `constraints.custom` rule clears every other row, so `getData()` names one country. The second is the slider; a stage-gated guide draws all 32 countries’ guesses and truths, reading the chosen country from the first chart.',
  },
  recreation: {
    title: 'Pick, then guess',
    question: 'To begin, which country do you think you know best?',
    try: 'Click a country, press Start the quiz, drag the crimson handle, then press See your results.',
    why: 'The country is answered in Elicit.js: `cycle()` writes `pick` on the clicked row and the custom constraint resets the others, a radio group built from data rules. The guess is `move()` at `stage: 0`; the reveal guide reads `stage` and the chosen country.',
    uses: ['cycle()', 'constraints.custom()', 'move()', 'stage', 'guides.custom()'],
    code: `// Ipsos Perils of Perception 2015: average guess and actual share of immigrants
const perils = [
  ["Argentina", 30, 4.5], ["Australia", 38, 27.7], ["Belgium", 24, 10.4], ["Brazil", 25, 0.3],
  ["Canada", 39, 20.7], ["Chile", 19, 2.3], ["China", 11, 0.1], ["Colombia", 17, 0.3],
  ["France", 26, 11.6], ["Germany", 26, 11.9], ["Hungary", 15, 4.7], ["India", 21, 0.4],
  ["Ireland", 23, 15.9], ["Israel", 24, 26.5], ["Italy", 26, 9.4], ["Japan", 10, 1.9],
  ["Mexico", 22, 0.9], ["Montenegro", 15.9, 8.2], ["Netherlands", 25.2, 11.7], ["New Zealand", 37, 25.1],
  ["Norway", 16.2, 13.8], ["Peru", 21, 0.3], ["Poland", 9, 1.7], ["Russia", 27, 7.7],
  ["Saudi Arabia", 24, 31.4], ["Serbia", 22.2, 5.6], ["South Africa", 29, 4.5], ["South Korea", 11, 2.5],
  ["Spain", 22, 13.8], ["Sweden", 25, 15.9], ["UK", 25, 13], ["United States", 33, 14.3],
];
const RED = "#B82266";
const the = (c) => (["UK", "United States", "Netherlands"].includes(c) ? "the " : "") + c;

// 1. The country, chosen on a chart: one row per country, 4 columns of 8
mount(ui.question("To begin, which country do you think you know best?"));
const picker = mount(Elicit({
  width: 460, height: 190,
  margins: { top: 10, right: 100, bottom: 10, left: 12 },
  axes: false,
  data: perils.map(([c], i) => ({ country: c, col: Math.floor(i / 8), row: 7 - (i % 8), pick: "no" })),
  schema: {
    country: { type: "categorical" },
    col: { type: "quantitative", domain: [0, 3] }, row: { type: "quantitative", domain: [0, 7] },
    pick: { type: "categorical", domain: ["no", "yes"] },
  },
  constraints: [
    constraints.custom(({ data, activeIndex }) =>          //! one country at a time
      activeIndex == null || data[activeIndex].pick !== "yes" ? undefined
        : data.map((d, i) => (i === activeIndex ? d : { ...d, pick: "no" })), { field: "pick" }),
  ],
  scales: { fill: { range: ["#777", RED] } },              // the dot and the name share one fill scale
  marks: [
    point({ size: 5,
      channels: { x: { field: "col" }, y: { field: "row" }, fill: { field: "pick", edit: cycle() } } }),   //! a click picks the country
    text({ fontSize: 12, dx: 10, textAnchor: "start", lineAnchor: "middle",
      channels: { x: { field: "col" }, y: { field: "row" }, text: { field: "country" }, fill: { field: "pick", edit: cycle() } } }),
  ],
}));

// 2. The question, on a Guardian slider
const pct = { type: "quantitative", domain: [0, 100] };
const row1 = 30, row2 = 88;
let chosen = null;
const q = ui.question("");
const quiz = Elicit({
  width: 460, height: 160, stage: 0,
  margins: { top: 34, right: 44, bottom: 16, left: 64 },
  axes: false,
  data: [{ guess: 50 }],
  schema: { guess: pct },
  guides: [
    guides.custom(({ scales, stage }) => {
      const x = scales.x.encode, lines = stage < 1 ? [[row1, ""]] : [[row1, "Guesses"], [row2, "Actual"]];
      return lines.flatMap(([y, label]) => [
        { type: "line", x1: x(0), x2: x(100), y1: y, y2: y, stroke: "#eee", strokeWidth: 6, strokeLinecap: "round", background: true },
        { type: "text", x: x(0) - 8, y: y + 4, text: label || "0%", textAnchor: "end", fontSize: 12, fill: label ? "#555" : "#bbb" },
        { type: "text", x: x(100) + 8, y: y + 4, text: "100%", textAnchor: "start", fontSize: 12, fill: "#bbb" },
      ]);
    }),
    guides.custom(({ scales, stage, data }) => {              //! the reveal: every country, yours in crimson
      if (stage < 1) return [];
      const x = scales.x.encode, off = d3.scaleLinear([0, 30], ["#298422", RED]).clamp(true);
      const me = perils.find((p) => p[0] === chosen);
      return [
        ...perils.flatMap(([c, mean, actual]) => [
          { type: "circle", cx: x(mean), cy: row1, r: 3.5, fill: off(Math.abs(mean - actual)), opacity: 0.55 },
          { type: "circle", cx: x(actual), cy: row2, r: 3.5, fill: "#888", opacity: 0.55 },
        ]),
        { type: "circle", cx: x(me[1]), cy: row1, r: 7, fill: "none", stroke: RED, strokeWidth: 2.5 },
        { type: "text", x: x(me[1]), y: row1 + 26, text: chosen + " " + me[1] + "%", textAnchor: "middle", fontSize: 11, fill: RED },
        { type: "circle", cx: x(me[2]), cy: row2, r: 7, fill: RED },
        { type: "text", x: x(me[2]), y: row2 + 24, text: chosen + " " + me[2] + "%", textAnchor: "middle", fontSize: 12, fontWeight: 700, fill: RED },
        { type: "text", x: x(data[0].guess), y: row1 - 24, text: "YOU", textAnchor: "middle", fontSize: 12, fontWeight: 700, fill: "#222" },
      ];
    }),
    guides.custom(({ scales, stage, data }) => stage > 0 ? [] : [   // the "?" and chevrons
      { type: "text", x: scales.x.encode(data[0].guess), y: row1 - 26, text: "?", textAnchor: "middle", fontSize: 18, fontWeight: 700, fill: "#bbb" },
      { type: "text", x: scales.x.encode(data[0].guess) - 24, y: row1 + 8, text: "‹", textAnchor: "middle", fontSize: 24, fill: RED },
      { type: "text", x: scales.x.encode(data[0].guess) + 24, y: row1 + 8, text: "›", textAnchor: "middle", fontSize: 24, fill: RED },
    ]),
  ],
  marks: [
    point({ size: 14, fill: RED, channels: { y: { value: row1 }, x: { field: "guess", edit: move({ stage: 0 }) } } }),  //! the guess
  ],
});

const note = ui.note("");
const see = ui.button("See your results", () => {
  quiz.nextStage();
  const me = perils.find((p) => p[0] === chosen), g = Math.round(quiz.getData()[0].guess);
  note.innerHTML = ui.md("You said **" + g + "%**; people in " + the(chosen) + " guessed " + me[1] + "% on average; the actual figure is **" + me[2] + "%**.");
  see.disabled = true;
});
const start = ui.button("Start the quiz ›", () => {
  const row = picker.getData().find((d) => d.pick === "yes");
  if (!row) return;
  chosen = row.country;
  q.innerHTML = ui.md("1. What percentage of the " + chosen + " population do you think are immigrants to this country (i.e. not born in " + the(chosen) + ")?");
  quizBox.style.display = "";
  start.disabled = true;
});
mount(ui.row(start));
mount(quiz);                                           // registers the chart; the box below holds it
const quizBox = mount(h("div", { style: "display:none" }, q, quiz.dom(), note, ui.row(see)));`,
  },
  variants: [
    {
      title: 'Truth and the crowd',
      question: 'What share of the United States population are immigrants, and what did Americans guess on average?',
      try: 'Drag both handles, then press See your results.',
      why: 'The piece’s point is the gap between perception and reality, so this asks for both: your estimate of the truth, and your estimate of your compatriots’ estimate. Each is its own column with its own `move()`, on two pixel lines of one `x` scale.',
      uses: ['move()', 'stage', 'chart.set()'],
      code: `const RED = "#B82266", pct = { type: "quantitative", domain: [0, 100] };
const rows = [[30, "The actual share", "truth", 14.3], [96, "Americans’ average guess", "crowd", 33]];

mount(ui.question("Immigrants in **the United States**: the real share, and what Americans think it is."));
const chart = mount(Elicit({
  width: 460, height: 160, stage: 0,
  margins: { top: 24, right: 40, bottom: 20, left: 40 },
  axes: false,
  data: [{ truth: 50, crowd: 50, aTruth: null, aCrowd: null }],
  schema: { truth: pct, crowd: pct, aTruth: pct, aCrowd: pct },
  constraints: [snap({ field: ["truth", "crowd"], step: 1 })],
  guides: [
    guides.custom(({ scales }) => rows.flatMap(([y, label]) => [
      { type: "line", x1: scales.x.encode(0), x2: scales.x.encode(100), y1: y, y2: y, stroke: "#eee", strokeWidth: 6, strokeLinecap: "round", background: true },
      { type: "text", x: scales.x.encode(0), y: y - 16, text: label, fontSize: 12, fill: "#555" },
      { type: "text", x: scales.x.encode(0), y: y + 20, text: "0%", fontSize: 11, fill: "#bbb" },
      { type: "text", x: scales.x.encode(100), y: y + 20, text: "100%", textAnchor: "end", fontSize: 11, fill: "#bbb" },
    ])),
  ],
  marks: [
    point({ size: 13, fill: RED, opacity: 0.85, channels: { y: { value: rows[0][0] }, x: { field: "truth", edit: move({ stage: 0 }) } } }),  //! what is true
    point({ size: 13, fill: "#7a4c9a", opacity: 0.85, channels: { y: { value: rows[1][0] }, x: { field: "crowd", edit: move({ stage: 0 }) } } }),  //! what others believe
    point({ size: 6, fill: "#222", channels: { y: { value: rows[0][0] }, x: { field: "aTruth" } } }),
    point({ size: 6, fill: "#222", channels: { y: { value: rows[1][0] }, x: { field: "aCrowd" } } }),
    text({ fontSize: 11, fill: "#222", dy: 22, channels: { y: { value: rows[0][0] }, x: { field: "aTruth" }, text: { fn: (d) => d.aTruth + "%" } } }),
    text({ fontSize: 11, fill: "#222", dy: 22, channels: { y: { value: rows[1][0] }, x: { field: "aCrowd" }, text: { fn: (d) => d.aCrowd + "%" } } }),
  ],
}));

const note = mount(ui.note(""));
const btn = ui.button("See your results", () => {
  chart.set("aTruth", 14.3);
  chart.set("aCrowd", 33);
  chart.nextStage();
  const d = chart.getData()[0];
  note.innerHTML = ui.md("Black dots: 14.3% are immigrants (UN), and Americans guessed **33%**. You put the gap at " + (d.crowd - d.truth) + " points; it is 18.7.");
  btn.disabled = true;
});
mount(ui.row(btn));`,
    },
  ],
  needs: ['social-feedback'],
  gaps: [
    'The country is clicked on a grid of the 32 surveyed countries rather than typed into an autocompleting text box.',
    'Only the first of the ten questions (immigrants) is recreated, and the closing country ranking is left out.',
    'Countries’ average guesses are Ipsos’s survey figures, not other readers’; the reader’s own guesses, which the original posted to a server, go nowhere.',
    'The original’s hover labels on every country dot are replaced by labels for the chosen country only.',
  ],
});

// ---------------------------------------------------------------- row-26 · Guardian NHS quiz

VIBE.add({
  id: 'row-26',
  status: 'full',
  verdict: 'A Guardian slider on a pound scale, £14,000–£300,000, snapped to £1,000; **See your results** fills empty columns that draw the true pay band and the average reader’s guess.',
  original: {
    availability: 'live',
    links: [
      { label: 'Questions and answers (Guardian docsdata JSON)', url: 'https://interactive.guim.co.uk/docsdata/1PMgGCWZtZGctS_TynkMZxzzvtCbwr2rM8bEFxAgLdC8.json' },
      { label: 'Average reader guesses (Guardian JSON)', url: 'https://interactive.guim.co.uk/2016/01/nhs-quiz/averages-nhs.json' },
    ],
    summary: 'Published 19 January 2016. Ten questions about the NHS in England, each on a slider fitted to the answer’s units: pay in pounds (£14,000–£300,000 for the head of the NHS, £14,000–£150,000 for a hospital doctor), costs (£0–£50 for a day’s hospital meals, £0–£5,000 for a broken arm), shares in percent, and doctors per 1,000 people.',
    steps: [
      'A teal handle with ‹ › chevrons and a "?" sits mid-track; the track is labelled £14,000 and £300,000 at its ends.',
      'The reader drags it; **See your results** reveals the answers.',
      'Each reveal draws the guess and the average reader’s guess on one line and the actual value below, with "Your answer is … than the actual value", an explanation and a source.',
    ],
    answers: 'Head of the NHS’s pay: £190,000–£195,000 (he voluntarily took this band, below his £210,000–£215,000 entitlement; NHS spokeswoman). The average of 31,355 readers’ guesses was £203,414. Other answers: hospital doctor £75,800 (readers £64,041), the Nice QALY threshold £30,000 (readers £28,606), hospital meals £10.20 a patient a day (readers £9.13), a broken arm £500 (readers £1,514).',
  },
  strategy: {
    elicits: 'A point estimate of a money amount on a wide linear range.',
    technique: 'The Guardian slider with a range and end labels in the question’s own unit. The answer is a pay band, not a number.',
    inElicit: 'The schema’s domain is the pound range, a `snap` keeps the guess to whole thousands, and every label goes through one pound formatter. The band is two empty columns, `lo` and `hi`, drawn by a thick `ruleY` on a second line once `chart.set()` fills them.',
  },
  recreation: {
    title: 'A pound slider',
    question: 'How much do you think the head of the NHS gets paid?',
    try: 'Drag the teal handle, then press See your results.',
    why: 'The domain does the unit work: `schema.pay.domain` is £14,000–£300,000 and `snap({ step: 1000 })` rounds to it. The answer is a band, so the reveal sets two columns, `lo` and `hi`, and a `ruleY` between them draws it.',
    uses: ['move()', 'snap()', 'chart.set()', 'ruleY()', 'stage'],
    code: `const TEAL = "#4FC1B9", ACTUAL = "#FFBB00";
const gbp = (v) => "£" + d3.format(",")(Math.round(v));
const money = { type: "quantitative", domain: [14000, 300000] };
const row1 = 34, row2 = 92;

mount(ui.question("1. How much do you think the head of the NHS gets paid?"));
const chart = mount(Elicit({
  width: 460, height: 170, stage: 0,
  margins: { top: 30, right: 64, bottom: 16, left: 60 },
  axes: false,
  data: [{ pay: 157000, lo: null, hi: null, readers: null }],
  schema: { pay: money, lo: money, hi: money, readers: money },
  constraints: [snap({ field: "pay", step: 1000, origin: 14000 })],   //! whole thousands
  guides: [
    guides.custom(({ scales, data }) => (data[0].lo == null ? [row1] : [row1, row2]).flatMap((y) => [
      { type: "line", x1: scales.x.encode(14000), x2: scales.x.encode(300000), y1: y, y2: y, stroke: "#dfeeee", strokeWidth: 6, strokeLinecap: "round", background: true },
      { type: "text", x: scales.x.encode(14000) - 8, y: y + 4, text: "£14,000", textAnchor: "end", fontSize: 12, fill: "#bbb" },
      { type: "text", x: scales.x.encode(300000) + 8, y: y + 4, text: "£300,000", textAnchor: "start", fontSize: 12, fill: "#bbb" },
    ])),
  ],
  marks: [
    point({ size: 16, fill: TEAL, channels: { y: { value: row1 }, x: { field: "pay", edit: move({ stage: 0 }) } } }),   //! the guess, in pounds
    point({ size: 6, fill: "#9a9a9a", stroke: "#fff", strokeWidth: 1.5, channels: { y: { value: row1 }, x: { field: "readers" } } }),
    text({ fontSize: 11, fill: "#888", dy: 26, channels: { y: { value: row1 }, x: { field: "readers" }, text: { fn: (d) => "Readers " + gbp(d.readers) } } }),
    text({ fontSize: 26, fill: TEAL, dx: -26, lineAnchor: "middle", channels: { y: { value: row1 }, x: { field: "pay" }, text: { fn: (d) => d.lo == null ? "‹" : "" } } }),
    text({ fontSize: 26, fill: TEAL, dx: 26, lineAnchor: "middle", channels: { y: { value: row1 }, x: { field: "pay" }, text: { fn: (d) => d.lo == null ? "›" : "" } } }),
    text({ fontSize: 16, fontWeight: 700, fill: "#999", dy: -30, channels: { y: { value: row1 }, x: { field: "pay" }, text: { fn: (d) => d.lo == null ? "?" : "You " + gbp(d.pay) } } }),
    ruleY({ stroke: ACTUAL, strokeWidth: 16, channels: { y: { value: row2 }, x1: { field: "lo" }, x2: { field: "hi" } } }),   //! the answer is a band
    text({ fontSize: 12, fontWeight: 700, fill: "#c98f00", dy: 24, channels: { y: { value: row2 }, x: { field: "lo" }, text: { value: "Actual £190,000–£195,000" } } }),
  ],
}));

const note = mount(ui.note(""));
const btn = ui.button("See your results", () => {
  chart.set("lo", 190000);                              //! the reveal fills the band and the crowd
  chart.set("hi", 195000);
  chart.set("readers", 203414);                         // the mean of 31,355 readers' guesses
  chart.nextStage();
  const you = chart.getData()[0];
  const off = you.pay < 190000 ? 190000 - you.pay : Math.max(0, you.pay - 195000);
  note.innerHTML = ui.md(off === 0 ? "Your answer is correct!" : "Your answer is **" + gbp(off) + " " + (you.pay < 190000 ? "lower" : "higher") + "** than the actual band. He voluntarily took £190,000–£195,000, below his £210,000–£215,000 entitlement.");
  btn.disabled = true;
});
mount(ui.row(btn));`,
  },
  variants: [
    {
      title: 'Five sums, one log axis',
      question: 'How much does the NHS pay or spend for each of these?',
      try: 'Drag each handle along its row, then press See your results.',
      why: 'Five of the quiz’s money questions span £10 to £200,000, so a log `x` scale (`scales.x.type`) lets them share one axis, and the answers line up as orders of magnitude. The reveal fills `truth` and `readers` columns; grey ticks are the real reader averages.',
      uses: ['move()', 'scales', 'chart.set()', 'stage', 'tickX()'],
      code: `// Answers and average reader guesses from the Guardian's quiz data
const qs = [
  ["Head of the NHS’s pay", 192500, 203414], ["A hospital doctor’s pay", 75800, 64041],
  ["Nice’s value of a healthy year", 30000, 28606], ["A broken arm, no surgery", 500, 1514],
  ["Hospital meals, per patient per day", 10.2, 9.13],
];
const gbp = (v) => v >= 1e6 ? "£1m" : v >= 1000 ? "£" + v / 1000 + "k" : "£" + v;
const money = { type: "quantitative", domain: [1, 1000000] };

mount(ui.question("How much does the NHS pay or spend for each of these?"));
const chart = mount(Elicit({
  width: 460, height: 250, stage: 0,
  margins: { top: 10, right: 20, bottom: 30, left: 200 },
  scales: { x: { type: "log" } },                       //! £1 to £1m on one axis
  axes: { x: { tickValues: [1, 10, 100, 1000, 10000, 100000, 1000000], tickFormat: gbp, grid: true }, y: { tickSize: 0 } },
  data: qs.map(([q]) => ({ q, guess: 1000, truth: null, readers: null })),
  schema: { q: { type: "categorical", domain: qs.map((d) => d[0]).reverse() }, guess: money, truth: money, readers: money },
  marks: [
    tickX({ stroke: "#999", strokeWidth: 3, channels: { y: { field: "q" }, x: { field: "readers" } } }),
    point({ size: 9, fill: "#4FC1B9", channels: { y: { field: "q" }, x: { field: "guess", edit: move({ channels: ["x"], stage: 0 }) } } }),  //! one guess per row
    point({ size: 6, fill: "#FFBB00", stroke: "#222", strokeWidth: 1, channels: { y: { field: "q" }, x: { field: "truth" } } }),
  ],
}));

const note = mount(ui.note(""));
const btn = ui.button("See your results", () => {
  qs.forEach(([, t, r], i) => { chart.set("truth", t, { index: i }); chart.set("readers", r, { index: i }); });
  chart.nextStage();
  const ratio = d3.mean(chart.getData(), (d) => Math.abs(Math.log10(d.guess / d.truth)));
  note.innerHTML = ui.md("Yellow: the answer; grey: the average reader. Your guesses were off by a factor of **" + Math.pow(10, ratio).toFixed(1) + "** on average.");
  btn.disabled = true;
});
mount(ui.row(btn));`,
    },
  ],
  needs: ['social-feedback'],
  gaps: [
    'Only the first of the ten questions is recreated; the original names the head of the NHS in it.',
    'The average reader’s guess is the real archived aggregate (31,355 answers), drawn as a fixed value.',
    'The explanation’s embedded charts and the Guardian typefaces are left out.',
  ],
});

// ---------------------------------------------------------------- row-27 · Guardian climate quiz

VIBE.add({
  id: 'row-27',
  status: 'full',
  verdict: 'A Guardian slider from 0C to 2C with a navy handle; its "?", chevrons and the reveal are guides that read `stage`, so **See your results** alone draws the actual warming and the average reader’s guess.',
  original: {
    availability: 'live',
    links: [
      { label: 'Questions and answers (Guardian docsdata JSON)', url: 'https://interactive.guim.co.uk/docsdata/1N1lEGOuKX_nq-8tnfc4JVbadX3ITA2DN102AEvIKiqc.json' },
      { label: 'Average reader guesses (Guardian quiz-aggregates JSON)', url: 'https://interactive.guim.co.uk/quiz-aggregates/averages-1N1lEGOuKX_nq-8tnfc4JVbadX3ITA2DN102AEvIKiqc.json' },
    ],
    summary: 'Published 19 January 2017. Ten questions on climate science and policy, each on a slider in its own unit: degrees of warming (0C–2C), CO2 in ppm (200–500), millions of years, percentages, billions of tonnes of ice, centimetres of sea-level rise.',
    steps: [
      'A navy handle with ‹ › chevrons and a "?" sits mid-track, labelled 0C and 2C at the ends.',
      'The reader drags it; **See your results** reveals the answers.',
      'Each reveal draws the guess beside the average reader’s and the actual value on a line below, with an explanation and source.',
    ],
    answers: 'Warming since the industrial revolution: the quiz sheet’s answer is 1.1C, but its explanation reads "The answer is 1.3C … two-thirds of the way to 2C" (source: Copernicus). The average of 19,209 readers’ guesses was 1.40C. Other answers: CO2 406ppm, 66m years since CO2 rose this fast, 82% of coal reserves to stay unburned, Arctic sea ice down 40% since 1980.',
  },
  strategy: {
    elicits: 'A point estimate of a physical quantity (degrees of warming) on a bounded range.',
    technique: 'The Guardian slider, with the policy limit (2C) as the top of the scale, so the answer reads as progress towards it.',
    inElicit: 'The answer is one `move()` at `stage: 0`. Everything else (the track, the "?", the chevrons, the actual line, the readers’ dot) is drawn by `guides.custom()` reading `stage`, so the data holds only the guess and the reveal is just `nextStage()`.',
  },
  recreation: {
    title: 'Degrees to 2C',
    question: 'Since the industrial revolution, how much has the world already warmed towards the internationally agreed danger limit of 2C?',
    try: 'Drag the navy handle, then press See your results.',
    why: 'The guess is the only data. The guides read `stage`: at 0 they draw the "?" and chevrons around the handle, at 1 the truth and the crowd. `nextStage()` both retires the `move()` and swaps what the guides draw.',
    uses: ['move()', 'snap()', 'stage', 'guides.custom()'],
    code: `const NAVY = "#005689", ACTUAL = "#FC4110", OTHERS = "#FFBB00";   // the quiz sheet's colours
const truth = 1.1, readers = 1.4;
const row1 = 34, row2 = 92;

mount(ui.question("1. Since the industrial revolution, how much has the world already warmed towards the internationally agreed danger limit of 2C?"));
const chart = mount(Elicit({
  width: 460, height: 170, stage: 0,
  margins: { top: 30, right: 40, bottom: 16, left: 40 },
  axes: false,
  data: [{ warming: 1 }],
  schema: { warming: { type: "quantitative", domain: [0, 2] } },
  constraints: [snap({ field: "warming", step: 0.05 })],
  guides: [
    guides.custom(({ scales, stage, data }) => {            //! stage 0: the "?"; stage 1: the reveal
      const x = scales.x.encode, g = data[0].warming;
      const track = (y) => [
        { type: "line", x1: x(0), x2: x(2), y1: y, y2: y, stroke: "#eee", strokeWidth: 6, strokeLinecap: "round", background: true },
        { type: "text", x: x(0) - 8, y: y + 4, text: "0C", textAnchor: "end", fontSize: 12, fill: "#bbb" },
        { type: "text", x: x(2) + 8, y: y + 4, text: "2C", textAnchor: "start", fontSize: 12, fill: "#bbb" },
      ];
      if (stage < 1) return [
        ...track(row1),
        { type: "text", x: x(g), y: row1 - 26, text: "?", textAnchor: "middle", fontSize: 18, fontWeight: 700, fill: "#bbb" },
        { type: "text", x: x(g) - 26, y: row1 + 8, text: "‹", textAnchor: "middle", fontSize: 26, fill: NAVY },
        { type: "text", x: x(g) + 26, y: row1 + 8, text: "›", textAnchor: "middle", fontSize: 26, fill: NAVY },
      ];
      return [
        ...track(row1), ...track(row2),
        { type: "circle", cx: x(readers), cy: row1, r: 6, fill: OTHERS },
        { type: "text", x: x(readers), y: row1 + 26, text: "Readers " + readers + "C", textAnchor: "middle", fontSize: 11, fill: "#b38300" },
        { type: "text", x: x(g), y: row1 - 26, text: "You " + g.toFixed(2) + "C", textAnchor: "middle", fontSize: 13, fontWeight: 700, fill: NAVY },
        { type: "circle", cx: x(truth), cy: row2, r: 10, fill: ACTUAL },
        { type: "text", x: x(truth), y: row2 + 26, text: "Actual " + truth + "C", textAnchor: "middle", fontSize: 12, fontWeight: 700, fill: ACTUAL },
      ];
    }),
  ],
  marks: [
    point({ size: 16, fill: NAVY, channels: { y: { value: row1 }, x: { field: "warming", edit: move({ stage: 0 }) } } }),  //! the guess
  ],
}));

const note = mount(ui.note(""));
const btn = ui.button("See your results", () => {
  chart.nextStage();                                     //! one call: the edit retires, the guides reveal
  const d = +(chart.getData()[0].warming - truth).toFixed(2);
  note.innerHTML = ui.md(d === 0 ? "Your answer is correct!" : "Your answer is **" + Math.abs(d) + "C " + (d > 0 ? "higher" : "lower") + "** than the actual value (Copernicus).");
  btn.disabled = true;
});
mount(ui.row(btn));`,
  },
  variants: [
    {
      title: 'A thermometer with a range',
      question: 'How much has the world warmed since the industrial revolution? Fill the thermometer to your best guess and bracket how sure you are.',
      try: 'Drag the top of the red column, drag the black caps to widen the bracket, then press See your results.',
      why: 'Warming reads naturally as a thermometer: a `barY` whose height is the guess, under `move()`. A whisker with two `tick` caps asks for a range, held around the guess by `follow` and `ordering`. The reveal is a stage-gated guide with the actual value and the 2C limit.',
      uses: ['barY()', 'move()', 'follow()', 'ordering()', 'stage', 'guides.custom()'],
      code: `const deg = { type: "quantitative", domain: [0, 2] };

mount(ui.question("Warming since the industrial revolution, towards the 2C limit"));
const chart = mount(Elicit({
  width: 460, height: 300, stage: 0,
  margins: { top: 16, right: 180, bottom: 40, left: 220 },
  axes: { y: { tickValues: [0, 0.5, 1, 1.5, 2], tickFormat: (v) => v + "C" }, x: false },
  data: [{ t: "warming", lo: 0.6, guess: 1, hi: 1.4 }],
  schema: { t: { type: "categorical", domain: ["warming"] }, lo: deg, guess: deg, hi: deg },
  constraints: [
    follow({ field: ["lo", "hi"], lead: "guess" }),
    ordering({ field: ["lo", "guess", "hi"] }),        //! lo ≤ guess ≤ hi
    clamp({ field: ["lo", "guess", "hi"], min: 0, max: 2 }),
    snap({ field: ["lo", "guess", "hi"], step: 0.05 }),
  ],
  guides: [
    guides.custom(({ scales, height }) => {             // the bulb
      const cx = scales.x.encode("warming");
      return [{ type: "circle", cx, cy: height + 14, r: 16, fill: "#D6604D" }];
    }),
    guides.custom(({ scales, width, stage }) => stage < 1 ? [] : [   //! after the reveal: truth and limit
      { type: "line", x1: 0, x2: width + 60, y1: scales.y.encode(1.1), y2: scales.y.encode(1.1), stroke: "#FC4110", strokeWidth: 2 },
      { type: "text", x: width + 64, y: scales.y.encode(1.1) + 4, text: "Actual 1.1C", fontSize: 12, fontWeight: 700, fill: "#FC4110" },
      { type: "text", x: width + 64, y: scales.y.encode(2) + 12, text: "2C limit", fontSize: 12, fill: "#888" },
    ]),
  ],
  marks: [
    barY({ fill: "#D6604D", channels: { x: { field: "t" }, y: { field: "guess", edit: move({ stage: 0 }) } } }),   //! fill to your guess
    ruleX({ stroke: "#222", strokeWidth: 2, channels: { x: { field: "t" }, y1: { field: "lo" }, y2: { field: "hi" } } }),
    tick({ stroke: "#222", strokeWidth: 3, inset: 8, channels: { x: { field: "t" }, y: { field: "lo", edit: move({ stage: 0 }) } } }),   //! bracket your uncertainty
    tick({ stroke: "#222", strokeWidth: 3, inset: 8, channels: { x: { field: "t" }, y: { field: "hi", edit: move({ stage: 0 }) } } }),
  ],
}));

const note = mount(ui.note(""));
const btn = ui.button("See your results", () => {
  chart.nextStage();
  const { lo, guess, hi } = chart.getData()[0];
  note.innerHTML = ui.md("You said " + guess.toFixed(2) + "C, between " + lo.toFixed(2) + " and " + hi.toFixed(2) + ". The quiz’s answer, 1.1C, " + (1.1 >= lo && 1.1 <= hi ? "**is inside** your bracket." : "**is outside** your bracket."));
  btn.disabled = true;
});
mount(ui.row(btn));`,
    },
  ],
  needs: ['social-feedback'],
  gaps: [
    'Only the first of the ten questions is recreated.',
    'The reveal shows the sheet’s answer, 1.1C; the original’s own explanation says 1.3C, and which one its slider showed is not recorded.',
    'The average reader’s guess is the real archived aggregate (19,209 answers), drawn as a fixed value.',
  ],
});
