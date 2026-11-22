// Clicks on categories, ratings and binary choices: rows 07, 09, 17, 18, 29.
//
// In these pieces the "chart" is mostly buttons. The recreations use the survey
// widgets (`widgets.likert`, `widgets.multipleChoice`, `widgets.ranking`) or the
// plain twin of a choice (`create({ pick: "probe" })` + `count({ max: 1 })`) for
// the click, and the page (`ui`, `h`) for the quiz around it. The variants show
// what a chart adds: a probability or a confidence instead of a pick, a ranking
// instead of one reply, a profile the reader draws instead of one inferred.

// ---------------------------------------------------------------------------- row-07
VIBE.add({
  id: 'row-07',
  status: 'partial',
  verdict: 'Each Big Five statement is a five-option `widgets.likert`, scored with 538’s own formula into a radar of five traits beside the national average; the radar is outlines drawn from computed points, and the friends-and-family groups need a server.',
  original: {
    availability: 'archived',
    links: [
      { label: 'Wayback Machine, 12 Feb 2019', url: 'https://web.archive.org/web/20190212211427/https://projects.fivethirtyeight.com/personality-quiz/' },
      { label: 'Companion article (538, 2018)', url: 'https://fivethirtyeight.com/features/most-personality-quizzes-are-junk-science-i-found-one-that-isnt/' },
      { label: 'BFI-2 (Colby Personality Lab, as linked by the page)', url: 'http://www.colby.edu/psych/personality-lab/' },
    ],
    summary: 'A 30-statement personality test built on the Big Five Inventory-2 (short form). For each statement (“I tend to be quiet.”) you click one of five connected circles from Disagree strongly to Agree strongly. The page never asks about traits directly: it infers five trait scores from 0 to 100 and draws them as a radar chart, beside the national average, FiveThirtyEight staffers, and a group of friends you can invite.',
    steps: [
      'You click one circle under each of 30 statements, on a cream page.',
      'When the last statement is answered, the page scores 15 facets (two statements each, some reverse-keyed) and averages them into five traits.',
      '“Your Big Five Scores” shows your traits as a radar chart; small radars beside it show the national average and FiveThirtyEight staffers (or your group).',
      'Each trait then gets its own radar of three subtraits and a paragraph on what a high, moderate or low score means.',
    ],
    answers: 'No right answer; the reveal is your profile. The page’s bundle holds the scoring and the comparison profiles. Each answer counts 0–4 (reversed for negatively keyed items), a facet is (item 1 + item 2) / 8, and a trait is the mean of its three facets × 100. National average: openness 63, agreeableness 71, conscientiousness 71, negative emotionality 42, extraversion 54. FiveThirtyEight staffers: 76, 57, 58, 33, 65.',
  },
  strategy: {
    elicits: 'Agreement with 30 self-descriptions on a five-point scale, from which the page infers five trait scores (0–100). Indirect inference: the belief shown back is never asked for.',
    technique: 'Five connected circles per statement, one click each, no feedback per item. The result is a radar chart compared with other people’s profiles.',
    inElicit: 'One `widgets.likert` per statement: `create({ pick: "probe" })` and `count({ max: 1, strategy: "replace" })` make a click anywhere in an option the answer. A `surveyBlocks` theme with round corners and cream tokens stands in for the circles. A button reads every chart’s `getData()`, scores it in plain JS, and `setData` draws the reader’s polygon on a radar made of `line` marks over computed points, with the national average as context rows.',
  },
  recreation: {
    title: 'Rate each statement',
    question: 'How well does each statement describe you?',
    try: 'Click one option under each statement, then press See my results.',
    why: 'Each statement is its own `widgets.likert`, so each answer is a row in that chart’s `getData()`. The radar is ordinary `line` marks: the page turns the five trait scores into points around a circle, and the comparison profile is `context: true` rows, drawn but never reported.',
    uses: ['widgets.likert', 'line', 'text', 'context', 'setData'],
    code: `const options = ["Disagree strongly", "Disagree a little", "Neutral", "Agree a little", "Agree strongly"];
// The quiz's first 15 statements: one per facet, three per trait. r: reverse-keyed.
const items = [
  ["I tend to be quiet.", "E", "r"], ["I am compassionate and have a soft heart.", "A"],
  ["I tend to be disorganized.", "C", "r"], ["I worry a lot.", "N"],
  ["I am fascinated by art, music or literature.", "O"], ["I am dominant and act as a leader.", "E"],
  ["I am sometimes rude to others.", "A", "r"], ["I have difficulty getting started on tasks.", "C", "r"],
  ["I tend to feel depressed and blue.", "N"], ["I have little interest in abstract ideas.", "O", "r"],
  ["I am full of energy.", "E"], ["I assume the best about people.", "A"],
  ["I am reliable and can always be counted on.", "C"], ["I am emotionally stable and not easily upset.", "N", "r"],
  ["I am original and come up with new ideas.", "O"],
];
const look = { extends: "surveyBlocks", widget: { tint: "#FBF7DC", accent: "#6B5E2E", corner: 22, optionHeight: 48 } };
const charts = items.map(([q]) =>
  mount(Elicit(widgets.likert({ question: q, options, width: 460, theme: look }))) //! one click per statement
);

// The radar: five spokes, rings at 25/50/75/100, and one closed outline per profile.
const traits = ["O", "A", "C", "N", "E"];
const names = { O: "Openness", A: "Agreeableness", C: "Conscientiousness", N: "Negative emotionality", E: "Extraversion" };
const at = (i, v) => ({ x: v * Math.sin(2 * Math.PI * i / 5), y: v * Math.cos(2 * Math.PI * i / 5) });
const outline = (who, kind, vals) => [0, 1, 2, 3, 4, 0].map((i) => ({ who, kind, ...at(i, vals[i]) }));
const context = [
  ...[25, 50, 75, 100].flatMap((v) => outline("ring " + v, "grid", [v, v, v, v, v])),
  ...traits.flatMap((t, i) => [{ who: "spoke " + t, kind: "grid", ...at(i, 0) }, { who: "spoke " + t, kind: "grid", ...at(i, 100) }]),
  ...traits.map((t, i) => ({ who: "label", kind: "label", label: names[t], ...at(i, 118) })),
  ...outline("national", "National average", [63, 71, 71, 42, 54]),
];
const radar = mount(Elicit({
  width: 420, height: 330, axes: false,
  margins: { top: 25, right: 70, bottom: 25, left: 70 },
  data: context,
  context: true, //! the grid and the national average are drawn, never reported
  schema: {
    x: { type: "quantitative", domain: [-125, 125] }, y: { type: "quantitative", domain: [-125, 125] },
    who: { type: "categorical" }, label: { type: "categorical" },
    kind: { type: "categorical", domain: ["grid", "label", "National average", "You"] },
  },
  marks: [
    line({ connect: "sequence", strokeWidth: 2, channels: {
      x: { field: "x" }, y: { field: "y" }, series: { field: "who" },
      stroke: { field: "kind", scale: { range: ["#E2DCC0", "none", "#9A9A9A", "#38A86A"] } },
    } }),
    text({ fontSize: 11, fill: "#5A5236", channels: { x: { field: "x" }, y: { field: "y" }, text: { field: "label" } } }),
  ],
}));
const note = ui.note("");
mount(ui.row(ui.button("See my results", () => {
  const answers = charts.map((c) => c.getData()[0]);
  if (answers.some((a) => !a)) { note.innerHTML = ui.md("Answer all 15 statements first."); return; }
  const sum = { O: 0, A: 0, C: 0, N: 0, E: 0 };
  answers.forEach((a, k) => {
    const t = options.indexOf(a.choice);                    // 0..4
    sum[items[k][1]] += items[k][2] ? 4 - t : t;            // reverse-keyed items flip
  });
  const you = traits.map((t) => Math.round(sum[t] / 12 * 100)); // three items × 4 points
  radar.setData(outline("you", "You", you)); //! the inferred profile appears beside the average
  note.innerHTML = ui.md("**You** (green): " + traits.map((t, i) => names[t] + " " + you[i]).join(", ") +
    ". **National average** (grey): 63, 71, 71, 42, 54.");
})));
mount(note);`,
  },
  variants: [
    {
      title: 'Draw your profile',
      question: 'How high do you think you score on each Big Five trait, from 0 to 100?',
      try: 'Drag each slice in or out, then press Compare.',
      why: 'The direct question the quiz avoids: you set each trait yourself. `arc` with equal `theta` puts the value on the slice’s `radius`, and `move()` on that channel writes it. Compare fills the `national` column of a second, unedited `arc` and switches its stroke on, so the average appears as black rims over your slices.',
      uses: ['arc', 'move()', 'axisRadial', 'set()'],
      code: `const traits = ["Openness", "Agreeableness", "Conscientiousness", "Negative emotionality", "Extraversion"];
const chart = mount(Elicit({
  width: 340, height: 300, axes: false, stage: 0,
  margins: { top: 20, right: 20, bottom: 20, left: 20 },
  data: traits.map((trait) => ({ trait, you: 50, national: null, shown: "no" })),
  schema: {
    trait: { type: "categorical", domain: traits },
    you: { type: "quantitative", domain: [0, 100] },
    national: { type: "quantitative", domain: [0, 100] },
    shown: { type: "categorical", domain: ["no", "yes"] },
  },
  elements: [axisRadial({ channel: "radius", ticks: 4 })],
  marks: [
    arc({
      innerRadius: 8, outerRadius: 125, padAngle: 2, start: 126, end: -234, fillOpacity: 0.85,
      channels: {
        theta: { value: 1 },
        radius: { field: "you", edit: move({ stage: 0 }) }, //! drag a rim to set a trait
        fill: { field: "trait", scale: { range: ["#50AEB7", "#2B5D87", "#8FB996", "#C77D5A", "#B5A642"] } }, // keyed below
      },
    }),
    arc({
      innerRadius: 8, outerRadius: 125, padAngle: 2, start: 126, end: -234, fill: "none", strokeWidth: 2.5,
      channels: {
        theta: { value: 1 },
        radius: { field: "national", scale: "you" },
        stroke: { field: "shown", scale: { range: ["none", "#222222"] } }, //! hidden until Compare
      },
    }),
  ],
}));
const colours = ["#50AEB7", "#2B5D87", "#8FB996", "#C77D5A", "#B5A642"];
mount(ui.row(...traits.map((t, i) => h("span", { style: { font: "12px system-ui" } },
  h("span", { style: { display: "inline-block", width: "10px", height: "10px", background: colours[i], marginRight: "4px" } }), t))));
const note = ui.note("");
mount(ui.row(ui.button("Compare", () => {
  [63, 71, 71, 42, 54].forEach((v, i) => {
    chart.set("national", v, { index: i });
    chart.set("shown", "yes", { index: i }); //! the reveal
  });
  chart.nextStage();
  note.innerHTML = ui.md("Black rims: the **national average** 538 compared readers with (openness 63, agreeableness 71, conscientiousness 71, negative emotionality 42, extraversion 54).");
})));
mount(note);`,
    },
  ],
  needs: ['radar', 'social-feedback'],
  gaps: [
    'Fifteen statements, not 30: the first 15 of 538’s list, one per facet, so each trait rests on three items instead of six. The scoring is 538’s formula restricted to those items.',
    'The circles are rounded `surveyBlocks` options with labels inside, not five connected circles; the cream palette is approximate.',
    'The radar is unfilled outlines from `line` marks over points computed in the page, not a filled radar with its own polar axes.',
    'The FiveThirtyEight-staff radar, the per-trait facet radars and the explanatory paragraphs are left out; the staff profile is listed in the original’s answers.',
    'Groups of friends and family need a server that collects their answers.',
  ],
  whyNot: 'The elicitation is complete: every rating is a widget answer in `getData()`. What falls short is the result view. Elicit.js has no radar mark or polar line, so the radar is outlines the page computes point by point, without fills or polar axes. The comparison with friends needs a server.',
});

// ---------------------------------------------------------------------------- row-09
VIBE.add({
  id: 'row-09',
  status: 'full',
  verdict: 'Each quote gets a two-option `widgets.likert` (Politics / Sports) in outlined boxes; the click locks the choice and reveals who said it, with a running score.',
  original: {
    availability: 'archived',
    links: [
      { label: 'Wayback Machine, 20 Aug 2019', url: 'https://web.archive.org/web/20190820192101/https://projects.fivethirtyeight.com/political-quiz/' },
    ],
    summary: 'Thirteen numbered quotes, each said either by a political pundit about the 2019 Democratic debates or by a sports commentator. Under each quote you click Politics or Sports. The page then says who said it and about whom, and a final score compares you with FiveThirtyEight staffers, who averaged about 60 percent.',
    steps: [
      'You read a numbered quote and click Politics or Sports.',
      'The choice locks and a line appears: “Got it!” or “Ahh, so close”, then who said it, about whom, and where.',
      'After 13 quotes, a final score in percent, with a line comparing it to the staff’s average of about 60 percent.',
    ],
    answers: 'From the page’s data: 1 politics (Kyung Lah on Kamala Harris, CNN); 2 sports (Katie Nolan on Vic Fangio, ESPN); 3 politics (Nancy Santiago on Julián Castro, NBC News Now); 4 sports (Daniel Cormier on Amanda Nunes, ESPN+); 5 sports (Dan Orlovsky on Patrick Mahomes, ESPN); 6 politics (Antjuan Seawright on Cory Booker, CBS News); 7 sports (Ariel Helwani on Francis Ngannou); 8 politics (Van Jones on Joe Biden, CNN); 9 politics (Terry McAuliffe, CNN); 10 politics (John King on Joe Biden, CNN); 11 sports (Chael Sonnen on Francis Ngannou); 12 sports (Jay Bilas on De’Andre Hunter, ESPN); 13 politics (Van Jones on Cory Booker, CNN).',
  },
  strategy: {
    elicits: 'A binary classification of a text stimulus: was this said about politics or sports?',
    technique: 'Two outlined buttons under each numbered quote. One click commits; the explanation appears under the buttons. Score at the end, compared with the newsroom.',
    inElicit: '`widgets.likert` with two options is a binary choice: a click anywhere in an option writes `{ choice }`, and `count({ max: 1, strategy: "replace" })` keeps one answer. The `survey` design draws outlined boxes like 538’s. `stage: 0` on the edit and `nextStage()` in `onChange` lock the answer once given; the reveal and the score are page text.',
  },
  recreation: {
    title: 'Politics or sports',
    question: 'Was each quote about politics or sports?',
    try: 'Click Politics or Sports under each quote.',
    why: 'A two-option `widgets.likert` is the button pair, and its answer is `getData()[0].choice`. The `onChange` callback calls `nextStage()`, so the edit (live only in stage 0) stops taking clicks, and fills the note under the buttons.',
    uses: ['widgets.likert', 'stage', 'nextStage()'],
    code: `const quotes = [
  { quote: "We saw her play offense last time. She’s got to defend her position.", type: "Politics",
    source: "Kyung Lah said this about Kamala Harris during an appearance on CNN before the second night of the second Democratic debate." },
  { quote: "I love the guy. I think he’s great. One thing I particularly love about him, I haven’t heard a ton of people say, is he’s just super honest.", type: "Sports",
    source: "Katie Nolan said this about NFL coach Vic Fangio during an appearance on ESPN’s “Highly Questionable” on Aug. 2, 2019." },
  { quote: "[He] had nothing to lose last night. He was one who had everything to gain, and that fire in the belly came out.", type: "Politics",
    source: "Nancy Santiago said this about Julián Castro during an appearance on NBC News Now after the first Democratic debate." },
  { quote: "You’re not necessarily just punching to punch, right? You gotta have an idea. Stay under control, ’cause right now this is just wasted energy.", type: "Sports",
    source: "Daniel Cormier said this about MMA fighter Amanda Nunes on ESPN+’s “Detail.”" },
  { quote: "It’s gonna be like ‘Home Alone 2.’ ‘Home Alone 1’ was great. ‘Home Alone 2’ was just as good, if not better.", type: "Sports",
    source: "Dan Orlovsky said this about quarterback Patrick Mahomes during an appearance on ESPN’s “The Fantasy Show.”" },
];
let right = 0, done = 0;
const score = ui.note("");
quotes.forEach((q, i) => {
  mount(ui.question("**" + (i + 1) + ".** “" + q.quote + "”"));
  const note = ui.note("");
  const chart = mount(Elicit(widgets.likert({
    options: ["Politics", "Sports"], //! two options: a binary choice
    width: 440, stage: 0, //! the click is live in stage 0 only
    theme: { extends: "survey", widget: { accent: "#222222", corner: 0 } },
    onChange: (rows) => {
      if (!rows.length || chart.getStage() > 0) return;
      const ok = rows[0].choice === q.type;
      right += ok; done += 1;
      note.innerHTML = ui.md((ok ? "**Got it!** " : "**Ahh, so close.** ") + q.source);
      score.innerHTML = ui.md("Score: **" + Math.round(100 * right / done) + " percent** of " + done +
        ". FiveThirtyEight staffers averaged just above 60 percent.");
      chart.nextStage(); //! one answer, then the choice locks
    },
  })));
  mount(note);
});
mount(score);`,
  },
  variants: [
    {
      title: 'How likely is sports?',
      question: 'For each quote, how likely is it that a sports commentator said it?',
      try: 'Drag each dot toward Politics or Sports, then press Reveal.',
      why: 'A probability instead of a pick: 50 says “no idea”, 90 says “almost surely sports”. Each quote is a row; `move()` on `x` writes `pSports`. Reveal fills the empty `truth` column (0 or 100), drawn by its own mark, and scores the guesses with the mean probability given to the right answer.',
      uses: ['point', 'move()', 'clamp()', 'stage', 'set()'],
      code: `const rows = [
  { quote: "1 “defend her position”", pSports: 50, truth: null },
  { quote: "2 “just super honest”", pSports: 50, truth: null },
  { quote: "3 “fire in the belly”", pSports: 50, truth: null },
  { quote: "4 “punching to punch”", pSports: 50, truth: null },
  { quote: "5 “Home Alone 2”", pSports: 50, truth: null },
];
const answers = [0, 100, 0, 100, 100]; // politics = 0, sports = 100
mount(ui.note("Quotes 1–5 from the quiz, shortened. 0 = surely politics, 100 = surely sports."));
const chart = mount(Elicit({
  width: 460, height: 250, stage: 0,
  margins: { top: 16, right: 20, bottom: 40, left: 150 },
  data: rows,
  schema: {
    quote: { type: "categorical", domain: rows.map((r) => r.quote).reverse() }, // quote 1 on top
    pSports: { type: "quantitative", domain: [-6, 106] }, // room for the markers at 0 and 100
    truth: { type: "quantitative", domain: [-6, 106] },
  },
  constraints: [clamp({ field: "pSports", min: 0, max: 100 })], //! a probability stays in 0–100
  axes: { x: { title: "← politics     chance it’s sports (%)     sports →" }, y: { title: null } },
  marks: [
    point({ size: 9, fill: "#C0392B", shape: "square", channels: { x: { field: "truth", scale: "pSports" }, y: { field: "quote" } } }), //! the answer, once revealed
    point({ size: 8, fill: "#2B5D87", channels: {
      x: { field: "pSports", edit: move({ stage: 0 }) }, //! drag to a probability
      y: { field: "quote" },
    } }),
  ],
}));
const note = ui.note("");
mount(ui.row(ui.button("Reveal", () => {
  answers.forEach((a, i) => chart.set("truth", a, { index: i })); //! the reveal
  chart.nextStage();
  const got = chart.getData().map((d, i) => (answers[i] === 100 ? d.pSports : 100 - d.pSports));
  note.innerHTML = ui.md("Red squares are the answers. On average you gave the right answer a **" +
    Math.round(got.reduce((a, b) => a + b, 0) / got.length) + "%** chance.");
})));
mount(note);`,
    },
  ],
  needs: ['social-feedback'],
  gaps: [
    'Five of the 13 quotes; all 13 answers are listed in the original’s answers.',
    'The staff comparison is the page’s own sentence (“just above 60 percent”), not a chart of staffers’ scores.',
    'The `survey` design draws a radio circle inside each box; 538’s boxes held only the label.',
  ],
});

// ---------------------------------------------------------------------------- row-17
VIBE.add({
  id: 'row-17',
  status: 'full',
  verdict: 'A fridge picture in `guides.image`, two party-coloured buttons that write the guess, and, on every third fridge, a tap on the picture that writes a clue point before the reveal; the photos are replaced by drawings of fridges the article describes.',
  original: {
    availability: 'archived',
    links: [
      { label: 'Wayback Machine, 28 Oct 2020', url: 'https://web.archive.org/web/20201028030604/https://www.nytimes.com/interactive/2020/10/27/upshot/biden-trump-poll-quiz.html' },
      { label: 'Readers’ aggregate guesses (JSON)', url: 'https://int.nyt.com/newsgraphics/2020/2020-08-24-fridge-politics/aggregate-guesses.json' },
    ],
    summary: 'The Upshot asked a representative online sample (via Lucid) whom they planned to vote for and to photograph the inside of their refrigerator. The quiz shows one photo at a time with two buttons, Biden (blue) and Trump (red). Every third photo, before the answer, it asks you to tap the object that gave it away. A running score sits under the quiz beside the share of all Times readers’ guesses that were right.',
    steps: [
      'A fridge photo appears in a grey frame, with Biden and Trump buttons under it.',
      'You click one. On every third fridge, the page first says “Before we reveal the answer… Tap an object that suggests this is a Biden fridge,” and you tap the photo; a yellow ring marks the spot.',
      'The frame turns the true candidate’s colour and a line says “Correct! It’s a Biden fridge.” or “Nope, it’s a Trump fridge.”',
      'After 1.5 seconds the next photo loads. “How did you do?” counts your guesses and your percent correct beside all readers’ total.',
      'Below, the article shows the most and least guessable fridges and heat spots of the objects readers tapped.',
    ],
    answers: 'The quiz drew from 429 photos (214 Biden, 215 Trump households). Readers made 176,985 guesses and got 91,699 right: 52 percent, “not much more reliably than if we just flipped a coin”. The article describes a few fridges in words: one with prepackaged muffins and a huge bottle of oil was a Biden voter’s; readers wrongly took a carton of almond milk as a Biden clue (it was a Trump fridge) and bottles of Powerade as a Trump clue (a Biden fridge).',
  },
  strategy: {
    elicits: 'A binary judgement about a person from a picture of their fridge (Biden or Trump voter), and on some fridges where in the picture the evidence is.',
    technique: 'A photo stimulus, two party-coloured buttons, an occasional tap on the photo, immediate right/wrong feedback in the frame colour, a running score and the crowd’s accuracy.',
    inElicit: 'The buttons are the plain twin of a Likert widget: a band scale over `["Biden", "Trump"]`, `create({ pick: "probe" })` and `count({ max: 1 })`, drawn as blue and red pills by a `guides.custom`. The fridge chart puts the picture in `guides.image` and a `create()` on the plane, live only in stage 1, so a tap writes `{ x, y }` only when the page asks for a clue.',
  },
  recreation: {
    title: 'Biden or Trump fridge',
    question: 'Whose fridge is this: a Biden voter’s or a Trump voter’s?',
    try: 'Click Biden or Trump. On the third fridge, tap the item that gave it away.',
    why: 'Two charts, each with its own stage. The buttons write `{ pick }` and lock. On the third fridge the picture chart moves to stage 1, which wakes its `create()`, so your tap becomes a clue row. The reveal recolours the frame and advances to the next fridge after 1.5 seconds, as the original did.',
    uses: ['guides.image', 'guides.custom', 'create()', 'count()', 'stage', 'setStage()'],
    code: `// Drawings of three fridges the article describes in words. Grey shapes are other food.
const fridge = (items) => {
  let s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380">' +
    '<rect width="300" height="380" fill="#EDEDEA"/><rect x="12" y="12" width="276" height="356" fill="#FAFAF7"/>' +
    [125, 245].map((y) => '<rect x="12" y="' + y + '" width="276" height="6" fill="#D5DADF"/>').join("");
  for (const [label, x, base, w, h, c] of items) {
    s += '<rect x="' + x + '" y="' + (base - h) + '" width="' + w + '" height="' + h + '" rx="5" fill="' + c + '"/>';
    if (label) s += '<text x="' + (x + w / 2) + '" y="' + (base - h / 2) + '" font-family="Helvetica,Arial" font-size="11" text-anchor="middle" dominant-baseline="middle">' + label + "</text>";
  }
  return "data:image/svg+xml," + encodeURIComponent(s + "</svg>");
};
const grey = (x, base, w, h) => ["", x, base, w, h, "#D9D6CE"];
const fridges = [
  { answer: "Biden", src: fridge([["muffins", 30, 125, 90, 45, "#E9C98B"], grey(140, 125, 60, 70), ["oil", 220, 245, 44, 105, "#F2D65C"], grey(40, 245, 70, 40), grey(60, 368, 120, 60)]) },
  { answer: "Trump", src: fridge([grey(30, 125, 70, 50), ["almond milk", 112, 245, 76, 100, "#E8E2D4"], grey(200, 245, 60, 40), grey(40, 368, 90, 50), grey(170, 368, 80, 70)]) },
  { answer: "Biden", src: fridge([grey(170, 125, 90, 60), ["Powerade", 26, 245, 80, 95, "#6FA8DC"], ["Powerade", 114, 245, 80, 95, "#6FA8DC"], grey(210, 245, 50, 50), grey(50, 368, 150, 45)]) },
];
const colour = { Biden: "#5588D5", Trump: "#D5564C" };
let current = 0, guesses = 0, right = 0;

const picture = mount(Elicit({
  width: 300, height: 380, axes: false, stage: 0,
  margins: { top: 0, right: 0, bottom: 0, left: 0 },
  data: [],
  schema: { x: { type: "quantitative", domain: [0, 100] }, y: { type: "quantitative", domain: [0, 100] } },
  constraints: [count({ max: 1, strategy: "replace" })],
  guides: [guides.image({ src: () => fridges[current].src })], //! the stimulus
  marks: [point({ size: 26, fill: "none", stroke: "#FFD24D", strokeWidth: 4,
    channels: { x: { field: "x" }, y: { field: "y" } },
    edits: [create({ stage: 1 })] })], //! a tap marks the clue, but only when asked
}));
picture.dom().style.outline = "10px solid #CCCCCC";

const pills = guides.custom((ctx) => ["Biden", "Trump"].flatMap((c) => {
  const x = ctx.scales.x.encode(c), w = 110;
  return [
    { type: "rect", x: x - w / 2, y: 4, width: w, height: 42, rx: 21, fill: colour[c] },
    { type: "text", x, y: 25, text: c, textAnchor: "middle", dominantBaseline: "central", fontSize: 22, fontWeight: 700, fill: "#fff" },
  ];
}));
const buttons = mount(Elicit({
  width: 300, height: 58, axes: false, stage: 0,
  margins: { top: 4, right: 20, bottom: 4, left: 20 },
  data: [],
  schema: { pick: { type: "ordinal", domain: ["Biden", "Trump"] } },
  scales: { x: { type: "band", padding: 0.1 } },
  constraints: [count({ max: 1, strategy: "replace" })], //! one guess per fridge
  guides: [pills],
  marks: [rect({ rx: 24, fill: "none", stroke: "#222", strokeWidth: 3,
    channels: { x: { field: "pick" } },
    edits: [create({ pick: "probe", channels: ["x"], stage: 0 })] })], //! a click anywhere in a pill picks it
  onChange: (rows) => {
    if (!rows.length || buttons.getStage() > 0) return;
    buttons.nextStage();
    if ((current + 1) % 3 === 0) { //! every third fridge asks for the evidence first
      say("Before we reveal the answer … tap an object that suggests this is a " + rows[0].pick + " fridge.");
      picture.setStage(1);
    } else reveal();
  },
}));
picture.on("change", () => { if (picture.getStage() === 1 && picture.getData().length) reveal(); });

const status = ui.note(""), tally = ui.note("");
const say = (t) => { status.innerHTML = ui.md(t); };
function reveal() {
  const truth = fridges[current].answer, ok = buttons.getData()[0].pick === truth;
  picture.setStage(2);
  picture.dom().style.outline = "10px solid " + colour[truth]; //! the frame turns the true candidate's colour
  guesses += 1; right += ok;
  say((ok ? "**Correct!** It’s a " : "**Nope,** it’s a ") + truth + " fridge.");
  tally.innerHTML = ui.md("You guessed **" + guesses + "** times and got **" + right + "** correct, for a score of **" +
    Math.round(100 * right / guesses) + "** percent. Times readers made 176,985 guesses, correctly matching refrigerators to a family’s favored candidate **52** percent of the time.");
  if (current + 1 < fridges.length) setTimeout(next, 1500);
  else setTimeout(() => say("That’s all three fridges."), 1500);
}
function next() {
  current += 1;
  picture.setStage(0); picture.setData([]); picture.dom().style.outline = "10px solid #CCCCCC";
  buttons.setStage(0); buttons.setData([]);
  say("");
}
mount(status);
mount(tally);`,
  },
  variants: [
    {
      title: 'How likely is Trump?',
      question: 'How likely is it that this fridge belongs to a Trump voter?',
      try: 'Drag the dot along the line, then press Guess.',
      why: 'A probability instead of a pick. With readers right only 52 percent of the time, most fridges deserve something near 50, which two buttons can’t say. The picture sits in `guides.image` over the top of the plot, `move()` slides the dot along the axis under it, and Guess fills the empty `truth` column on the same row.',
      uses: ['guides.image', 'move()', 'stage', 'set()'],
      code: `// The almond-milk fridge: readers took the milk as a Biden clue.
const s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 380">' +
  '<rect width="300" height="380" fill="#EDEDEA"/><rect x="12" y="12" width="276" height="356" fill="#FAFAF7"/>' +
  '<rect x="12" y="125" width="276" height="6" fill="#D5DADF"/><rect x="12" y="245" width="276" height="6" fill="#D5DADF"/>' +
  '<rect x="30" y="75" width="70" height="50" rx="5" fill="#D9D6CE"/><rect x="112" y="145" width="76" height="100" rx="5" fill="#E8E2D4"/>' +
  '<text x="150" y="195" font-family="Helvetica,Arial" font-size="11" text-anchor="middle" dominant-baseline="middle">almond milk</text>' +
  '<rect x="200" y="205" width="60" height="40" rx="5" fill="#D9D6CE"/><rect x="40" y="318" width="90" height="50" rx="5" fill="#D9D6CE"/>' +
  '<rect x="170" y="298" width="80" height="70" rx="5" fill="#D9D6CE"/></svg>';
const chart = mount(Elicit({
  width: 360, height: 470, stage: 0,
  margins: { top: 10, right: 30, bottom: 40, left: 30 },
  data: [{ pTrump: 50, truth: null, y: 6 }],
  schema: {
    pTrump: { type: "quantitative", domain: [0, 100] },
    truth: { type: "quantitative", domain: [0, 100] },
    y: { type: "quantitative", domain: [0, 100] },
  },
  axes: { x: { title: "← Biden     chance it’s a Trump fridge (%)     Trump →" }, y: false },
  guides: [guides.image({ src: "data:image/svg+xml," + encodeURIComponent(s), x: [8, 92], y: [16, 100] })],
  marks: [
    point({ size: 9, fill: "#D5564C", shape: "square", channels: { x: { field: "truth", scale: "pTrump" }, y: { field: "y" } } }), //! the truth, once set
    point({ size: 10, fill: "#2B5D87", channels: {
      x: { field: "pTrump", edit: move({ stage: 0 }) }, //! a probability, not a pick
      y: { field: "y" },
    } }),
  ],
}));
const note = ui.note("");
mount(ui.row(ui.button("Guess", () => {
  chart.set("truth", 100, { index: 0 }); //! it was a Trump fridge
  chart.nextStage();
  note.innerHTML = ui.md("It was a **Trump** fridge. You gave Trump a **" + Math.round(chart.getData()[0].pTrump) + "%** chance.");
})));
mount(note);`,
    },
  ],
  needs: ['social-feedback'],
  gaps: [
    'The original showed real photos of 429 fridges. These are three simple drawings of fridges the article describes in words, with the described item labelled and grey shapes for the rest; the guess is far easier, and far less interesting, without the photos. `guides.image` takes any picture you have the rights to.',
    'The readers’ 52 percent is the final figure from the page’s aggregate file, fixed in the text, not live.',
    'The clue taps were collected across readers and shown as heat spots on the most-tapped photos; that needs a server.',
    'The frame colour is set on the chart’s container by the page, as the original set its canvas border.',
  ],
});

// ---------------------------------------------------------------------------- row-18
VIBE.add({
  id: 'row-18',
  status: 'partial',
  verdict: 'Each reply is a pick from a `widgets.multipleChoice` whose options the page swaps every turn; the chat itself, the bot’s answers and the coaching are page code, so Elicit.js supplies only the reply list.',
  original: {
    availability: 'archived',
    links: [
      { label: 'Wayback Machine, 19 Nov 2018', url: 'https://web.archive.org/web/20181119034813/https://www.nytimes.com/interactive/2018/11/18/opinion/thanksgiving-family-argue-chat-bot.html' },
    ],
    summary: 'An Opinion piece by a former psychiatrist that teaches a five-step method for talking politics with relatives: ask questions, listen, reflect, agree, then share a story. You practise with “Angry Uncle Bot”: grey chat bubbles from the bot, then “SELECT YOUR REPLY” over two or three reply cards. A good reply moves the conversation on with a short coaching note; a bad one makes the uncle angrier, then the coach explains why and substitutes the better reply.',
    steps: [
      'The bot greets you and asks which uncle you want: liberal readers chat with Conservative Uncle Bot, conservative readers with Liberal Uncle Bot.',
      'The uncle states an opinion in a few bubbles (“Trump has been great for America! Just look at the economy, it’s booming 💥”).',
      'You pick one of three reply cards. A good one (“So how are you doing financially?”) earns “Good choice” and an explanation of the step.',
      'A bad one draws an angry retort (“You don’t like them because Trump looks good #fakenews”), then “Not a good choice… Try this response instead:” and the better reply.',
      'Five steps later the bot moves to a second topic and the method starts again.',
    ],
    answers: 'No ground truth; feedback is the coach’s explanation. In each turn one reply is the method’s step and two are common mistakes (an argument, a facts debate, a close-ended question, “I told you so”, an attack on the president).',
  },
  strategy: {
    elicits: 'A categorical choice among candidate replies, used to teach rather than to measure: which reply would keep the conversation going?',
    technique: 'A chat interface. Reply cards under the bubbles; one click per turn; the conversation and the coaching branch on the choice.',
    inElicit: 'Each turn’s reply is a `widgets.multipleChoice` with `max: 1` in the `survey` design, which stacks the options as wrapped cards. The page swaps the options with `setDomain("choice", …)` and clears the answer with `setData([])`, and writes the bubbles and coaching with `h`. Elicit.js holds the current reply; the conversation is the page.',
  },
  recreation: {
    title: 'Pick a reply',
    question: 'How would you reply to Angry Uncle Bot?',
    try: 'Click a reply. Bad replies get a retort and the coach’s fix; five turns in all.',
    why: 'One `widgets.multipleChoice` serves every turn: `setDomain("choice", replies)` relabels its options and `setData([])` clears the pick, so `getData()` always holds the current reply. Everything above the cards (the bubbles, the retort, the coaching) is HTML the page appends.',
    uses: ['widgets.multipleChoice', 'setDomain()', 'setData()'],
    code: `// The Conservative Uncle Bot's economy thread, for a liberal reader. good: the method's reply.
const turns = [
  { uncle: ["Great! Well, let me tell you something...", "Trump has been great for America!", "Just look at the economy, it’s booming 💥"], good: 2,
    replies: ["Trump’s been good for the rich! 🙇", "The jobs numbers are misleading ...", "So how are you doing financially?"],
    retort: ["Unlike you liberals, I have no problem with the rich!", "You don’t like them because Trump looks good #fakenews"],
    coach: ["This argumentative response will turn the conversation into a debate where you and Uncle Bot seek to score points and “win.”",
      "This will turn the conversation into a debate over facts and figures. People tend not to be persuaded by contrary evidence.",
      "The goal at this point is to start a conversation. The easiest way to do that is by asking questions: non-threatening, open-ended and non-leading."] },
  { uncle: ["How am I doing?", "Not that great actually 😒", "… But things would have been worse under Hillary!"], good: 1,
    replies: ["Why are you still talking about Hillary? That was two years ago!", "What are your biggest economic hurdles right now?", "Did your taxes go down under the tax cut?"],
    retort: ["We still need to #lockherup, that’s why", "Taxes are way too high in this country 😠"],
    coach: ["Criticizing Uncle Bot for perseverating on the 2016 election will just make him mad.",
      "Asking follow-up questions shows that you are listening. This makes them feel respected and heard.",
      "This question is close-ended, which is likely to shut down rather than open up discussion."] },
  { uncle: ["My biggest hurdles? Well...", "No matter how hard I work", "I can’t get ahead", "I’m living paycheck to paycheck 💸💸"], good: 0,
    replies: ["So you feel pretty insecure money-wise despite how hard you’re working", "So the economy isn’t exactly booming, is it?", "You know, Trump has actually made your situation worse 💸💸"],
    retort: ["Ughhh… I just can’t talk to you liberals", "Wrong! Trump’s ACTUALLY made it better in so many ways, let me tell you..."],
    coach: ["After Uncle Bot shares his point of view, check and show your understanding by reflecting what you heard.",
      "Smugly highlighting inconsistencies in Uncle Bot’s statements will make him angry and defensive.",
      "Talking about specific political figures gets in the way of productive dialogue."] },
  { uncle: ["Yeah, I do feel insecure money-wise", "And I dunno how long I can keep up"], good: 2,
    replies: ["That’s why we need a stronger safety net, for people like you", "That’s why you should have voted for Clinton", "Things are tough for people like us. I’m worried about the future"],
    retort: ["I’m American 🇺🇸 so I can take care of myself without HANDOUTS 💰", "I’d NEVER vote for her! Want to know why…?"],
    coach: ["He will probably be insulted by the suggestion that he needs “help,” especially from the government.",
      "“I told you so” responses threaten Uncle Bot’s self-esteem and will turn this conversation into a fight.",
      "Now highlight areas where you agree. It is easiest to agree about goals, values and emotions."] },
  { uncle: ["Yeah, it is tough", "Things were easier for my parents"], good: 1,
    replies: ["That’s because your parents were riding off the advantages of white supremacy", "When I was a kid, I remember Dad going on a strike for better pay at his factory…", "And Donald Trump isn’t doing anything to fix it"],
    retort: ["So now you’re calling your own grandparents racist?", "Trump’s doing so much... you’re just blind to it!"],
    coach: ["This will make Uncle Bot apoplectic. The two of you speak very different political languages, especially about race.",
      "Now share your perspective. The key to sharing persuasively is to present a story rather than an argument.",
      "Uncle Bot identifies with the president so strongly that attacks on Trump make him feel attacked too."] },
];
const bubble = (text, who) => h("div", { style: {
  alignSelf: who === "you" ? "flex-end" : "flex-start", maxWidth: "78%", margin: "3px 0", padding: "8px 14px",
  borderRadius: "18px", font: "14px/1.35 system-ui, sans-serif",
  background: who === "uncle" ? "#EEEEEE" : who === "you" ? "#2B5D87" : "transparent",
  color: who === "you" ? "#fff" : "#222", fontStyle: who === "coach" ? "italic" : "normal",
  border: who === "coach" ? "1px solid #D8D8D8" : "none" } }, text);
const log = h("div", { style: { display: "flex", flexDirection: "column", width: "440px", alignSelf: "center", maxHeight: "380px", overflowY: "auto" } });
mount(log);
mount(h("div", { style: { font: "700 12px system-ui", letterSpacing: "0.06em", alignSelf: "center", width: "440px", textAlign: "right" } }, "SELECT YOUR REPLY"));
let k = 0;
const say = (lines, who) => { lines.forEach((t) => log.append(bubble(t, who))); log.scrollTop = log.scrollHeight; };
say(turns[0].uncle, "uncle");
const chart = mount(Elicit(widgets.multipleChoice({
  options: turns[0].replies, max: 1, width: 440, height: 250, //! one reply per turn
  theme: { extends: "survey", widget: { accent: "#2B5D87" } },
  onChange: (rows) => {
    if (!rows.length || k >= turns.length) return;
    const t = turns[k], i = t.replies.indexOf(rows[0].choice);
    if (i < 0) return; // a reply from the last turn, while the options change
    say([t.replies[i]], "you");
    if (i === t.good) say(["Good choice. " + t.coach[i]], "coach");
    else {
      say([t.retort[i < t.good ? i : i - 1]], "uncle");
      say(["Not a good choice. " + t.coach[i] + " Try this response instead:"], "coach");
      say([t.replies[t.good]], "you");
    }
    k += 1;
    if (k < turns.length) {
      say(turns[k].uncle, "uncle");
      chart.setData([]);
      chart.setDomain("choice", turns[k].replies); //! the next turn's replies, same chart
    } else say(["That’s the five steps: ask, listen, reflect, agree, share."], "coach");
  },
})));`,
  },
  variants: [
    {
      title: 'Rank the replies',
      question: 'Uncle Bot says: “How am I doing? Not that great actually 😒 … But things would have been worse under Hillary!” Rank the replies from most to least likely to keep him talking.',
      try: 'Drag the cards into order, then press Ask the coach.',
      why: 'A ranking asks for more than a pick: it says which mistake you think is worse. `widgets.ranking` writes a `rank` per reply. The coach only marks one reply as good, so the reveal gives the coach’s verdict on each card in your order.',
      uses: ['widgets.ranking'],
      code: `const replies = ["Why are you still talking about Hillary? That was two years ago!",
  "What are your biggest economic hurdles right now?", "Did your taxes go down under the tax cut?"];
const coach = {
  [replies[0]]: "Not a good choice. Criticizing Uncle Bot for perseverating on the 2016 election will just make him mad.",
  [replies[1]]: "Good choice. Asking follow-up questions shows that you are listening.",
  [replies[2]]: "Not a good choice. This question is close-ended, which is likely to shut down rather than open up discussion.",
};
const chart = mount(Elicit(widgets.ranking({
  question: "Most likely to keep him talking first",
  items: replies, width: 440, //! drag the cards into your order
  theme: { extends: "survey", widget: { accent: "#2B5D87", rowHeight: 54 } },
})));
const note = ui.note("");
mount(ui.row(ui.button("Ask the coach", () => {
  const order = [...chart.getData()].sort((a, b) => a.rank - b.rank);
  note.innerHTML = order.map((d, i) => ui.md("**" + (i + 1) + ".** " + coach[d.item])).join("<br>");
})));
mount(note);`,
    },
  ],
  needs: ['conversation'],
  gaps: [
    'Only the Conservative Uncle Bot’s economy thread (five turns) is scripted. The opening choice of uncle, the Liberal Uncle Bot and the later topics are left out.',
    'The coach’s explanations are shortened to one or two sentences.',
    'Bubbles appear at once, not one by one with a typing delay, and there is no avatar.',
    'The reply cards are the `survey` design’s boxes with a checkbox, right-aligned in the original.',
  ],
  whyNot: 'Elicit.js elicits each reply, but that is all it does here: a pick among three labels, with no visual encoding a button list lacks. The chat (bubbles, the bot’s answer to your choice, the coach’s substitute reply, the next turn) is page code, and the library has nothing for a conversation that branches on the answer.',
});

// ---------------------------------------------------------------------------- row-29
VIBE.add({
  id: 'row-29',
  status: 'full',
  verdict: 'Each scenario gets a two-option `widgets.likert` (LEGAL / ILLEGAL); the click locks and reveals CNN’s legal explanation, with a running score.',
  original: {
    availability: 'live',
    links: [
      { label: 'Wayback Machine, 10 Apr 2015', url: 'https://web.archive.org/web/20150410201710/http://www.cnn.com/interactive/2015/04/opinions/permissible-discrimination-quiz/' },
    ],
    summary: 'Written after Indiana’s 2015 religious-freedom law, the quiz gives nine scenarios of businesses or people refusing someone and asks whether each is legal or illegal under the law as of 7 April 2015, not whether it should be. Each scenario has LEGAL and ILLEGAL buttons; a click reveals a short explanation.',
    steps: [
      'You read a numbered scenario in a grey card and click LEGAL or ILLEGAL.',
      'Your button is marked correct or incorrect, the other is greyed out, and the explanation slides open (“LEGAL! A restaurant can refuse service based on a dress code…”).',
      'After nine answers: “You scored N out of 9,” with a verdict from “Congrats” to “get some advice from a lawyer”.',
    ],
    answers: 'From the page: 1 legal (dress code applied to everyone); 2 legal (private party); 3 legal (the deli serves pork to no one); 4 illegal (religion is protected in public accommodation); 5 depends (Madison and Milwaukee protect gender identity in housing, Wisconsin does not), both answers scored correct; 6 legal (Indiana does not protect marital status); 7 legal (a speaker is not a public accommodation); 8 illegal (Washington protects sexual orientation); 9 legal (a private babysitter hire is outside nondiscrimination law).',
  },
  strategy: {
    elicits: 'A binary judgement about the law: is this act of discrimination legal or illegal?',
    technique: 'Text scenarios with two buttons each; one click commits, then an explanation. Score at the end.',
    inElicit: '`widgets.likert` with two options is the button pair. `stage: 0` on the edit and `nextStage()` in `onChange` lock the answer; the scenario, the explanation and the score are page text around the chart.',
  },
  recreation: {
    title: 'Legal or illegal',
    question: 'Is each act of discrimination legal or illegal (as of April 2015)?',
    try: 'Click LEGAL or ILLEGAL under each scenario.',
    why: 'A two-option `widgets.likert` is the button pair, and its answer is `getData()[0].choice`. The `onChange` callback scores it, opens the explanation and calls `nextStage()`, so the edit, live only in stage 0, stops taking clicks.',
    uses: ['widgets.likert', 'stage', 'nextStage()'],
    code: `const cases = [
  { text: "A restaurant in Nevada has a sign on its window, “No shirt, no shoes, no service.” A person in a wheelchair comes into the restaurant with no shirt. The restaurant refuses him service.",
    right: ["LEGAL"], verdict: "LEGAL!",
    why: "A restaurant can refuse service based on a dress code, as long as it applies the same standard to every customer." },
  { text: "A Middle Eastern grill in Michigan, owned by a Muslim family, refuses to serve an Orthodox Jewish rabbi and his family.",
    right: ["ILLEGAL"], verdict: "ILLEGAL!",
    why: "You may not operate a store of any kind and refuse to serve customers because of their religion or because of your religion." },
  { text: "A person renting an apartment in Wisconsin is transitioning from male to female. When the landlord finds out, she kicks the tenant out.",
    right: ["LEGAL", "ILLEGAL"], verdict: "Depends on where you live in Wisconsin!",
    why: "Madison and Milwaukee prohibit housing discrimination based on gender identity, but no statewide law does." },
  { text: "A pizza shop in Washington state is owned by a Mormon family. They refuse to cater a gay wedding.",
    right: ["ILLEGAL"], verdict: "ILLEGAL!",
    why: "Washington prohibits discrimination based on sexual orientation in public accommodations." },
];
let score = 0, answered = 0;
const total = ui.note("");
cases.forEach((c, i) => {
  mount(ui.question("**" + (i + 1) + ".** " + c.text));
  const note = ui.note("");
  const chart = mount(Elicit(widgets.likert({
    options: ["LEGAL", "ILLEGAL"], //! two options: a binary choice
    width: 420, stage: 0, //! the click is live in stage 0 only
    theme: { extends: "surveyBlocks", widget: { accent: "#595959", corner: 0 } },
    onChange: (rows) => {
      if (!rows.length || chart.getStage() > 0) return;
      const ok = c.right.includes(rows[0].choice);
      score += ok; answered += 1;
      note.innerHTML = ui.md((ok ? "✓ " : "✗ ") + "**" + c.verdict + "** " + c.why);
      total.innerHTML = ui.md("You scored **" + score + "** out of " + answered + ".");
      chart.nextStage(); //! one answer, then the choice locks
    },
  })));
  mount(note);
});
mount(total);`,
  },
  variants: [
    {
      title: 'How sure are you?',
      question: 'Legal or illegal, and how sure are you?',
      try: 'Pick LEGAL or ILLEGAL, set how sure you are, then press Check.',
      why: 'A confidence rating after the binary choice: the same pick, plus a `widgets.slider` from 50% (a coin flip) to 100% (certain). Check compares your average confidence with your share right, which a score out of nine can’t show.',
      uses: ['widgets.likert', 'widgets.slider'],
      code: `const cases = [
  { text: "A kosher deli in New York, owned by a Jewish family, refuses to serve pork (which of course is not on the menu) to a Filipino customer.",
    law: "LEGAL", why: "The deli doesn’t serve pork to anyone. The law requires that you serve every customer equally." },
  { text: "A motel in Indiana owned by a Catholic family refuses to rent a room to an unmarried heterosexual couple.",
    law: "LEGAL", why: "Indiana’s amended law does not include marital status, and the state has no law on sexual orientation." },
  { text: "A conservative public speaker refuses to give a paid speech to a pro-choice organization.",
    law: "LEGAL", why: "A speaker does not offer general services to the public, so is not a public accommodation." },
];
const look = { extends: "surveyBlocks", widget: { accent: "#595959", corner: 0 } };
const asked = cases.map((c, i) => {
  mount(ui.question("**" + (i + 1) + ".** " + c.text));
  const pick = mount(Elicit(widgets.likert({ options: ["LEGAL", "ILLEGAL"], width: 420, theme: look })));
  const sure = mount(Elicit(widgets.slider({ //! how sure, from a coin flip to certain
    question: "How sure are you?", domain: [50, 100], step: 5, value: 75, width: 420,
    format: (v) => v + "%", theme: { widget: { accent: "#2B5D87" } },
  })));
  const note = ui.note("");
  mount(note);
  return { c, pick, sure, note };
});
const summary = ui.note("");
mount(ui.row(ui.button("Check", () => {
  let n = 0, right = 0, conf = 0;
  asked.forEach(({ c, pick, sure, note }) => {
    const p = pick.getData()[0];
    if (!p) { note.innerHTML = ui.md("Not answered yet."); return; }
    const ok = p.choice === c.law;
    n += 1; right += ok ? 1 : 0; conf += sure.getData()[0].value;
    note.innerHTML = ui.md((ok ? "✓ " : "✗ ") + "**" + c.law + "!** " + c.why);
  });
  if (n) summary.innerHTML = ui.md("You were **" + Math.round(conf / n) + "%** sure on average and got **" +
    Math.round(100 * right / n) + "%** right."); //! calibration, not just a score
})));
mount(summary);`,
    },
  ],
  needs: [],
  gaps: [
    'Four of the nine scenarios in the recreation and three others in the variant; all nine answers are in the original’s answers.',
    'Explanations are cut to their first sentence or two.',
    'The original marks your button correct or incorrect and greys out the other; here the choice turns solid and the note opens with ✓ or ✗.',
    'The final verdict paragraph (from “Congrats” to “get some advice from a lawyer”) is left out.',
  ],
});
