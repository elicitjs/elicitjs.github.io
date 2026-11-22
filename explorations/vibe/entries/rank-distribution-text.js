// A ranking (CNN's climate solutions), a typed number (the NYT's two-thirds
// puzzle) and a distribution tutorial (unidentified). Rows 28, 19 and 30.

// ─────────────────────────────────────────────────────────────── row-28 · CNN
VIBE.add({
  id: 'row-28',
  status: 'full',
  verdict: 'Four cards dragged into four slots with `rank()` on a band axis; “How’d I do?” locks the cards and fills a second row with Project Drawdown’s order, each card marked right or wrong, for six of CNN’s eight rounds.',
  original: {
    availability: 'live',
    links: [
      { label: 'CNN, Apr 2019 (live)', url: 'https://www.cnn.com/interactive/2019/04/specials/climate-change-solutions-quiz/index.html' },
      { label: 'Quiz data: the page’s script bundle (rounds, Drawdown ranks, Gt avoided)', url: 'https://www.cnn.com/interactive/2019/04/specials/climate-change-solutions-quiz/js/climate-change-solutions-quiz.index.8b61005739ca222e3188.js' },
      { label: 'Project Drawdown, solutions ranked by impact', url: 'https://drawdown.org/solutions/table-of-solutions' },
    ],
    summary: 'CNN splits Project Drawdown’s top climate solutions into eight rounds (food, transport, homes and cities, land, electricity, materials, empowering women, and a final top five). In each round you drag three to five cards into slots marked 1st, 2nd, 3rd… by how much you think each would curb climate change. A coloured badge on each card says who can act: you, industries or policymakers.',
    steps: [
      'A round shows its cards in a grey tray with slots 1st–4th above them; “1 of 8” counts the rounds.',
      'You drag a card left or right (or tap arrows on a phone); the others shift to make room.',
      'Pressing **How’d I do?** re-sorts the cards into Drawdown’s order. Each card says **Correct!** or **Your rank: N**, and shows the emissions it avoids as cars taken off the road (one car icon per 50 million).',
      'A score line reads “You got N right (along with X% of CNN readers who took this quiz). That is better than Y% of other readers”, then a paragraph explains the order.',
      'At the end a title rates you, from “student of climate change” to “Capt. Climate Change”.',
    ],
    answers: 'From the page’s own data, which follows Drawdown’s 2017 ranking (Gt CO₂-eq avoided, 2020–2050). Food: throw away less food (70.5), eat a plant-heavy diet (66.1), cook over clean stoves (15.8), compost (2.3). Transport: electric cars (10.8), efficient shipping (7.9), fuel-saving planes (5.1), high-speed rail (1.5). Homes: LED bulbs (7.8), walkable cities (2.9), smart thermostats (2.6), green roofs (0.8). Land: tropical forests (61.2), bamboo (7.2), indigenous land tenure (6.2), coastal wetlands (3.2). Electricity: onshore wind (84.6), solar farms (36.9), nuclear (16.1), wave power (9.2). Materials: refrigerant management (89.7), alternative cement (6.7), water saving (4.6), household recycling (2.8). Women: educating girls and family planning tie (51.5 each), women smallholders (2.1). Top five: refrigerants, onshore wind, food waste, plant-rich diet, tropical forests. The reader shares came from a CNN poll server that no longer answers.',
  },
  strategy: {
    elicits: 'A ranking: the order of four solutions by the emissions each would avoid.',
    technique: 'Cards in fixed slots, reordered by drag; the slots fix the scale (1st–4th), so only order is asked, not magnitude. The reveal re-sorts the cards, marks each guess right or wrong, and adds the magnitude and a crowd score.',
    inElicit: 'A `composite` card (a `rect` and its labels) on a band `x` scale whose field is `rank`; `rank()` on the card’s body turns a drag into a new slot and shifts the others, so ranks stay a permutation. The reveal fills an empty `drawdown` column drawn by a second composite with no edit, a `verdict` column on your cards, and `nextStage()` freezes the drag. The rounds and the score are the page: `setData` loads the next round.',
  },
  recreation: {
    title: 'Drag the cards',
    question: 'Rank the solutions you think would have the biggest effect on curbing climate change.',
    try: 'Drag a card left or right onto another slot, then press How’d I do?. Next round loads the next category.',
    why: '`rank()` on the card body writes `rank` through the band scale, and moves the cards in between by one slot so the ranks stay 1–4. Drawdown’s order lives in an empty `drawdown` column: the lower row of cards has `x: drawdown` and draws nothing until the button sets it.',
    uses: ['composite()', 'rect()', 'text()', 'rank()', 'axisX()', 'stage', 'chart.set()', 'chart.setData()'],
    code: `// CNN's rounds with four cards: [solution, who can act, Drawdown's rank, Gt CO2-eq avoided 2020–2050]
const rounds = [
  ["Our food", [["Eat a plant-heavy diet", "you", 2, 66.1], ["Throw away less food", "you", 1, 70.5],
    ["Compost your waste", "you", 4, 2.3], ["Cook over clean stoves", "you", 3, 15.8]]],
  ["How we move people and goods", [["Drive an electric car", "you", 1, 10.8],
    ["Ship goods more efficiently", "industry", 2, 7.9], ["Fly less ... and on fuel-saving planes", "you industry", 3, 5.1],
    ["Invest in high-speed trains", "policy", 4, 1.5]]],
  ["Our homes and cities", [["Switch to LED lightbulbs", "you industry", 1, 7.8],
    ["Use smart thermostats", "you industry", 3, 2.6], ["Install green roofs", "industry", 4, 0.8],
    ["Design more walkable cities", "policy", 2, 2.9]]],
  ["How we use our land", [["Return land to indigenous people", "policy", 3, 6.2],
    ["Protect and restore tropical forests", "policy", 1, 61.2], ["Plant more bamboo", "industry", 2, 7.2],
    ["Preserve coastal wetlands", "policy", 4, 3.2]]],
  ["Electricity use", [["Harness wind energy on land", "industry", 1, 84.6], ["Build solar farms", "industry", 2, 36.9],
    ["Capture the power of the waves", "policy", 4, 9.2], ["Invest in nuclear power", "industry policy", 3, 16.1]]],
  ["Materials and waste management", [["Clean up chemicals in our refrigerators and air conditioners", "you industry", 1, 89.7],
    ["Build with “greener” cement compounds", "industry", 2, 6.7], ["Increase household recycling", "you", 4, 2.8],
    ["Use water more efficiently", "you", 3, 4.6]]],
];
const who = { you: "#9C4FD6", industry: "#3B6CF0", policy: "#F2B300" };   // CNN's badge colours
const slots = ["1st", "2nd", "3rd", "4th"];
const seed = (k) => rounds[k][1].map(([solution, tags], i) =>
  ({ solution, tags, rank: i + 1, drawdown: null, gt: null, verdict: null }));
const badge = (n) => (d) => (d.tags.split(" ")[n] ? "●" : "");
const badgeFill = (n) => (d) => who[d.tags.split(" ")[n]] || "none";

const chips = h("div", { class: "ui-note" }, ...Object.entries({ you: "What you can do",
  industry: "What industries can do", policy: "What policymakers can do" }).map(([k, label]) =>
  h("span", { style: "margin-right:12px;white-space:nowrap" }, h("span", { style: "color:" + who[k] }, "● "), label)));
const header = ui.question("");
mount(chips);
mount(header);

const chart = mount(Elicit({
  stage: 0, width: 460, height: 262, axes: false,
  margins: { top: 26, right: 6, bottom: 6, left: 6 },
  schema: {
    solution: { type: "categorical" },
    tags: { type: "categorical" },
    rank: { type: "ordinal", domain: [1, 2, 3, 4] },
    drawdown: { type: "ordinal", domain: [1, 2, 3, 4] },
    gt: { type: "quantitative", domain: [0, 100] },
    verdict: { type: "categorical" },
  },
  scales: { x: { type: "band", padding: 0.06 } },
  data: seed(0),
  effects: { grabbed: { stroke: "#2B5D87", strokeWidth: 1.5, cursor: "grabbing" } },
  elements: [axisX({ anchor: "top", line: false, tickSize: 0, fontSize: 12, tickFormat: (r) => slots[r - 1] })],
  marks: [
    // Your ranking: one card per row, in the slot its rank names.
    composite({ id: "yours", motion: true, parts: [
      rect({ height: 100, rx: 4, fill: "#fff", stroke: "#d6d6d6",
        channels: { x: { field: "rank", edit: rank({ stage: 0, cursor: "grab" }) }, y: { value: 54 } } }), //! drag a card to a new slot; the rest shift
      text({ fontSize: 12.5, wrap: 92, lineHeight: 15, fill: "#222",
        channels: { x: { field: "rank" }, y: { value: 54 }, text: { field: "solution" } } }),
      text({ fontSize: 14, dx: -40, text: badge(0), fill: badgeFill(0), channels: { x: { field: "rank" }, y: { value: 92 } } }),
      text({ fontSize: 14, dx: -27, text: badge(1), fill: badgeFill(1), channels: { x: { field: "rank" }, y: { value: 92 } } }),
      text({ fontSize: 11, fontWeight: 700, fill: (d) => (d.verdict === "Correct!" ? "#1E8E3E" : "#C5221F"),
        channels: { x: { field: "rank" }, y: { value: 16 }, text: { field: "verdict" } } }),
    ] }),
    // Drawdown's ranking: the same rows, placed by a column that is empty until the reveal.
    composite({ id: "drawdown", parts: [
      rect({ height: 100, rx: 4, fill: "#EEF4F5", channels: { x: { field: "drawdown" }, y: { value: 176 } } }), //! drawn only once \`drawdown\` is set
      text({ fontSize: 12.5, wrap: 92, lineHeight: 15, fill: "#222",
        channels: { x: { field: "drawdown" }, y: { value: 168 }, text: { field: "solution" } } }),
      text({ fontSize: 11, fill: "#2B5D87",
        text: (d) => (d.gt == null ? "" : d.gt + " Gt ≈ " + Math.round(d.gt * 7.01) + "M cars"),
        channels: { x: { field: "drawdown" }, y: { value: 212 } } }),
      text({ fontSize: 10.5, fill: "#666", textAnchor: "start",
        text: (d) => (d.drawdown === 1 ? "PROJECT DRAWDOWN’S RANKING" : ""),
        channels: { x: { value: 4 }, y: { value: 116 } } }),
    ] }),
  ],
}));

const score = ui.note("");
let k = 0;
const show = () => { header.innerHTML = ui.md("**" + rounds[k][0] + "** · " + (k + 1) + " of " + rounds.length); score.innerHTML = ""; };
const check = ui.button("How’d I do?", () => {
  if (chart.getData()[0].drawdown != null) return;
  let right = 0;
  chart.getData().forEach((row, i) => {
    const [, , truth, gt] = rounds[k][1].find((s) => s[0] === row.solution);
    chart.set("drawdown", truth, { index: i });                                   //! the reveal: Drawdown's slot for this card
    chart.set("gt", gt, { index: i });
    chart.set("verdict", row.rank === truth ? "Correct!" : "Drawdown: " + slots[truth - 1], { index: i });
    if (row.rank === truth) right++;
  });
  chart.nextStage();                                                              //! the cards lock
  score.innerHTML = ui.md("**You got " + right + " right.** One car is a car off the road from now to 2050, CNN’s yardstick.");
});
const next = ui.button("Next round", () => {
  k = (k + 1) % rounds.length;
  chart.setData(seed(k));
  chart.setStage(0);
  show();
});
mount(ui.row(check, next));
mount(score);
show();`,
  },
  variants: [
    {
      title: 'Estimate the size',
      question: 'How many gigatons of CO₂ would each food solution keep out of the air by 2050?',
      try: 'Drag each bar to your estimate, then press Reveal.',
      why: 'A ranking hides the gap between first and second, the point CNN’s car icons make after the fact. Asking for the amount with `move` on a bar gets the order and the magnitude in one answer; the `truth` column, drawn by a `tickY` with no edit, shows Drawdown’s figure beside each bar.',
      uses: ['barY()', 'move()', 'tickY()', 'clamp()', 'stage'],
      code: `const food = [["Eat a plant-heavy diet", 66.1], ["Throw away less food", 70.5],
  ["Compost your waste", 2.3], ["Cook over clean stoves", 15.8]];
const chart = mount(Elicit({
  stage: 0, width: 440, height: 300,
  margins: { top: 16, right: 16, bottom: 48, left: 44 },
  schema: {
    solution: { type: "categorical", domain: food.map((f) => f[0]) },
    gt: { type: "quantitative", domain: [0, 100] },
    truth: { type: "quantitative", domain: [0, 100] },
  },
  data: food.map(([solution]) => ({ solution, gt: 20, truth: null })),
  constraints: [clamp({ field: "gt", min: 0, max: 100 })],
  elements: [
    axisX({ tickFormat: (s) => s.replace(/ (\\S+ \\S+)$/, "\\n$1") }),
    axisY({ title: "Gt CO₂-eq avoided, 2020–2050" }),
  ],
  marks: [
    barY({ fill: "#50AEB7", channels: { x: { field: "solution" }, y: { field: "gt", edit: move({ stage: 0 }) } } }), //! drag the bar to your estimate
    tickY({ stroke: "#C5221F", strokeWidth: 3, channels: { x: { field: "solution" }, y: { field: "truth" } } }),   //! Drawdown's figure, once set
  ],
}));
const note = ui.note("");
mount(ui.row(ui.button("Reveal", () => {
  food.forEach(([, gt], i) => chart.set("truth", gt, { index: i }));
  chart.nextStage();
  note.innerHTML = ui.md("Red: Project Drawdown's estimate. Wasted food and diet are close; compost is two orders of magnitude smaller.");
})));
mount(note);`,
    },
  ],
  needs: ['social-feedback'],
  gaps: [
    'Six of the eight rounds: “Empowering women” (three cards, two tied for first) and the closing top five (five cards) are left out, so every round fits one four-slot chart.',
    'The reveal adds Drawdown’s order as a second row instead of re-sorting your cards, so your guess stays on screen; CNN moves the cards and labels each with “Your rank: N”.',
    'CNN draws the avoided emissions as rows of car icons (one per 50 million cars); here it is a line of text with the same arithmetic.',
    'The reader comparison (“along with X% of CNN readers… better than Y%”) came from CNN’s poll server, which is gone; no shares are shown.',
    'The badges are coloured dots, not CNN’s person, building and podium icons; there are no arrow buttons for phones.',
    'No closing title or overall score across rounds.',
  ],
});

// ─────────────────────────────────────────────────────────────── row-19 · NYT
VIBE.add({
  id: 'row-19',
  status: 'full',
  verdict: 'You type a whole number from 0 to 100 into the chart (an `editText` label on the answer column) or drag its marker; Submit locks it and shows the NYT’s published histogram of readers’ guesses with the winning 19 and the average 28.',
  original: {
    availability: 'live',
    links: [
      { label: 'The New York Times, 13 Aug 2015 (refuses automated fetches; not opened here)', url: 'https://www.nytimes.com/interactive/2015/08/13/upshot/are-you-smarter-than-other-new-york-times-readers.html' },
      { label: 'Follow-up: how readers fared (NYT, 21 Aug 2015; paywalled, not read here)', url: 'https://www.nytimes.com/2015/08/21/upshot/how-readers-fared-in-upshots-number-puzzle.html' },
      { label: 'The NYT results chart after 59,643 guesses, reproduced by Wait But Why', url: 'https://waitbutwhy.com/table/can-you-guess-what-other-readers-are-guessing-results' },
      { label: 'Course blog summarising the results (Cornell INFO 2040)', url: 'https://blogs.cornell.edu/info2040/2015/10/21/a-number-puzzle-in-game-theory-and-behavioral-economics/' },
    ],
    summary: 'The Upshot’s version of the Keynesian beauty contest: pick a whole number from 0 to 100 as your guess of two-thirds of the average of everyone’s picks. You type it into a text box and press Submit; the page then shows how all readers guessed. The headline’s count rose as entries came in (49,485 early on, 61,139 in the screenshot).',
    steps: [
      'The page explains the rule with worked examples (an average of 70 wins with 47).',
      'You type a number into a box and press **Submit**. Only the first guess counts.',
      'The results show a bar per number, “percent of readers picking each number”, with the winner (two-thirds of the average) in blue and the average in dark grey, and the article discusses levels of reasoning (33, 22, 0).',
    ],
    answers: 'After 59,643 guesses the NYT chart gave the average as 28 and the winner as 19. The most common picks were 33 (off the top of the chart), 1 (6.2%), 22 (5.9%), 0 (5.5%) and 50 (4.9%). The bar heights here are read off that chart to ±0.1 point; 33 is drawn at 9.9%, its visible minimum.',
  },
  strategy: {
    elicits: 'A single number from 0 to 100: your guess of what everyone else will guess, two levels deep.',
    technique: 'A typed number in a text box, with no chart while you answer; the reveal is a histogram of the crowd with the winning number marked.',
    inElicit: 'The answer column `guess` is bound to an `editText` label, so typing is an Elicit.js gesture: the typed text is coerced to the field’s number, then `clamp` and `snap` hold it to whole numbers in 0–100. A `point` with `move` on the same column puts the number on a 0–100 axis, so you can also drag it. The crowd is a second chart whose rows are `context` (drawn, never reported); Submit writes your guess into it and mounts it.',
  },
  recreation: {
    title: 'Type a number',
    question: 'Pick a number from 0 to 100: your best guess of two-thirds of the average of all numbers chosen.',
    try: 'Double-click the ? and type a number, then press Enter (or drag the red dot along the axis). Press Submit.',
    why: '`editText` on the text channel writes what you type into `guess`; because the schema says `guess` is quantitative, “33” arrives as 33 and “abc” is refused. `snap` and `clamp` make it a whole number in range, the rule the NYT stated in prose. The marker on the axis shares the column, so the number and its place move together.',
    uses: ['editText()', 'move()', 'snap()', 'clamp()', 'rectY()', 'ruleX()', 'context', 'stage'],
    code: `// The NYT's results after 59,643 guesses: % of readers picking each number 0–100,
// read off the published chart. 33 ran off its top; 9.9 is the least it could be.
const crowd = [
  5.5, 6.2, 2.1, 1.0, 0.6, 1.2, 0.8, 1.2, 0.8, 0.7, 2.0, 1.2, 1.6, 0.9, 1.1, 2.0, 1.0, 1.6, 1.5, 1.1,
  2.4, 1.2, 5.9, 1.6, 1.2, 1.9, 0.8, 1.3, 1.1, 0.7, 1.9, 0.6, 1.4, 9.9, 3.0, 1.5, 1.0, 1.4, 0.9, 0.5,
  2.2, 0.6, 1.3, 0.9, 2.4, 1.3, 0.7, 0.8, 0.7, 0.4, 4.9, 0.6, 0.5, 0.3, 0.4, 0.6, 0.4, 0.3, 0.3, 0.2,
  0.6, 0.1, 0.3, 0.3, 0.2, 0.3, 2.0, 0.8, 0.2, 0.3, 0.2, 0.1, 0.3, 0.2, 0.1, 0.6, 0.2, 0.3, 0.1, 0.1,
  0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.2, 0.1, 0.1, 0, 0, 0, 0, 0, 0, 0, 0.1, 0.2, 0.3,
];
const RED = "#D0021B";

const answer = mount(Elicit({
  stage: 0, width: 460, height: 150,
  margins: { top: 62, right: 20, bottom: 34, left: 20 },
  schema: { guess: { type: "quantitative", domain: [0, 100] } },
  data: [{ guess: null }],
  constraints: [clamp({ field: "guess", min: 0, max: 100 }), snap({ field: "guess", step: 1 })], //! whole numbers, 0–100
  elements: [axisX({ ticks: 10 })],
  marks: [
    rect({ width: 96, height: 40, rx: 3, fill: "#fff", stroke: "#999", channels: { x: { value: 60 }, y: { value: -36 } } }),
    text({ fontSize: 24, fill: RED, format: (v) => (v == null || v === "" ? "?" : String(v)),
      channels: { x: { value: 60 }, y: { value: -36 }, text: { field: "guess", edit: editText({ stage: 0 }) } } }), //! type the number
    point({ size: 8, fill: RED, channels: { x: { field: "guess", edit: move({ stage: 0 }) }, y: { value: 46 } } }), //! or drag it along the axis
  ],
}));

// The crowd: context rows (drawn, never reported) plus one row for your guess.
const results = Elicit({
  width: 460, height: 230,
  margins: { top: 34, right: 16, bottom: 34, left: 36 },
  schema: {
    n: { type: "quantitative", domain: [0, 100] },
    pct: { type: "quantitative", domain: [0, 10] },
    you: { type: "quantitative", domain: [0, 100] },
  },
  data: [{ you: null }, ...crowd.map((pct, n) => ({ n, pct }))],
  context: (d) => d.n != null,                                                    //! other readers' picks are reference rows
  elements: [axisX({ ticks: 10, title: "Readers' guesses" }), axisY({ ticks: 5, tickFormat: (v) => v + "%" })],
  marks: [
    rectY({ width: 3, fill: (d) => (d.n === 19 ? "#6A9BD1" : d.n === 28 ? "#555" : "#c8c8c8"),
      channels: { x: { field: "n" }, y: { field: "pct" } } }),
    ruleX({ stroke: RED, strokeWidth: 2, channels: { x: { field: "you" } } }),          //! your guess, beside the crowd
    text({ fill: RED, fontSize: 12, fontWeight: 700, textAnchor: "start", dx: 4,
      text: (d) => (d.you == null ? "" : "you " + d.you), channels: { x: { field: "you" }, y: { value: 8 } } }),
  ],
});
const note = ui.note("");
mount(ui.row(ui.button("Submit", () => {
  const g = answer.getData()[0].guess;
  if (g == null) { note.innerHTML = ui.md("Type a number first."); return; }
  answer.nextStage();                                                             //! only your first guess counts
  results.set("you", g, { index: 0 });
  results.dom().style.display = "";
  note.innerHTML = ui.md("Percent of readers picking each number. Readers averaged **28** (dark bar), so **19** won (blue). You picked **" + g + "**, " +
    (g === 19 ? "the winning number." : Math.abs(g - 19) + " away."));
})));
mount(note);
mount(results).dom().style.display = "none";                                    // shown on Submit`,
  },
  variants: [
    {
      title: 'Guess with a range',
      question: 'What will the winning number be? Give your best guess and a range you are 80% sure of.',
      try: 'Drag the dot for your best guess and the ticks for the ends of your range, then press Submit.',
      why: 'The puzzle is a guess about other people, so it is uncertain by nature, yet the original takes one number. Three columns in one row, held in order by `ordering` and carried together by `follow`, ask for a guess and how sure you are. The winner arrives in an empty `truth` column, drawn by a `ruleX` with no edit.',
      uses: ['point()', 'tickX()', 'rule()', 'move()', 'ordering()', 'follow()', 'stage'],
      code: `const chart = mount(Elicit({
  stage: 0, width: 440, height: 160,
  margins: { top: 20, right: 20, bottom: 40, left: 20 },
  schema: {
    best: { type: "quantitative", domain: [0, 100] },
    lo: { type: "quantitative", domain: [0, 100] },
    hi: { type: "quantitative", domain: [0, 100] },
    truth: { type: "quantitative", domain: [0, 100] },
  },
  data: [{ best: 50, lo: 35, hi: 65, truth: null }],
  constraints: [
    follow({ field: ["lo", "hi"], lead: "best" }),                         //! the range travels with the guess
    ordering({ field: ["lo", "best", "hi"] }),                             //! lo ≤ best ≤ hi
    clamp({ field: ["lo", "best", "hi"], min: 0, max: 100 }),
  ],
  elements: [axisX({ ticks: 10, title: "Winning number (two-thirds of the average)" })],
  marks: [
    rule({ stroke: "#50AEB7", strokeWidth: 3, channels: { x1: { field: "lo" }, x2: { field: "hi" }, y: { value: 50 } } }),
    tickX({ stroke: "#2B5D87", strokeWidth: 3, length: 26,
      channels: { x: { field: "lo", edit: move({ stage: 0 }) }, y: { value: 50 } } }), //! drag an end to widen or narrow
    tickX({ stroke: "#2B5D87", strokeWidth: 3, length: 26,
      channels: { x: { field: "hi", edit: move({ stage: 0 }) }, y: { value: 50 } } }),
    point({ size: 9, fill: "#2B5D87", channels: { x: { field: "best", edit: move({ stage: 0 }) }, y: { value: 50 } } }),
    ruleX({ stroke: "#D0021B", strokeWidth: 2, channels: { x: { field: "truth" } } }),
  ],
}));
const note = ui.note("");
mount(ui.row(ui.button("Submit", () => {
  chart.set("truth", 19, { index: 0 });
  chart.nextStage();
  const { lo, hi } = chart.getData()[0];
  note.innerHTML = ui.md("The winner was **19** (red). " + (lo <= 19 && 19 <= hi ? "It is inside your range." : "It is outside your range."));
})));
mount(note);`,
    },
  ],
  needs: ['social-feedback'],
  gaps: [
    'The crowd histogram is the NYT’s published result, read off its chart, not a live tally; Elicit.js cannot collect guesses.',
    'The NYT’s bar for 33 ran off the top of its own chart; it is drawn at 9.9%, the least it could be. The heights add to about 103%, the error of reading them off a picture.',
    'Typing needs a double-click on the ? (or Enter on a focused label); the original is an always-open text box.',
    'The NYT took no chart while you answered; the axis and its draggable marker are additions that make the number’s place visible.',
    'No headline counter of entrants, no cat illustration, and none of the article’s explanation of reasoning levels.',
  ],
});

// ──────────────────────────────────────────────── row-30 · unidentified tutorial
VIBE.add({
  id: 'row-30',
  status: 'full',
  verdict: 'The tutorial’s probability bars become draggable bars that always sum to 1, and its typed min and max become two `editText` labels on a range drawn over a 0–24 hour axis; the source and its other seven questions are unidentified.',
  original: {
    availability: 'gone',
    links: [
      { label: 'Cat sleep, for the reveal: Britannica, “Why do cats sleep so much?”', url: 'https://www.britannica.com/story/why-do-cats-sleep-so-much' },
    ],
    summary: 'A story-driven tutorial in a monospaced type. A MONK tells the reader that “distributions allow us to shift from using vague language like ‘pretty sure’ to having a picture of exactly what we think”, shows a bar chart of probabilities for “Who will be the hero’s guide?”, then starts an eight-question quiz that asks for a minimum and a maximum guess.',
    steps: [
      'Story text: “Our hero is in search of a guide… who will likely be human, but may very well be animal or inanimate.”',
      'A bar chart shows the probability of each guide: human 0.6, animal 0.2, book 0.2. **Okay…** continues.',
      'The MONK explains the point of distributions; **Begin** starts the questions.',
      '“Question 1 out of 8. How many hours does an average cat sleep in a day?” You type a **Min guess** and a **Max guess** and press **Next**.',
    ],
    answers: 'Unknown: the screenshot ends before any answer is shown, and the source could not be found. Searches for the quoted sentences, the question and the MONK framing found nothing; it may be a research prototype or a calibration-training page. The reveal here uses a published figure: cats sleep about 15 hours a day on average (Britannica), 12–16 for most adults.',
  },
  strategy: {
    elicits: 'First a probability distribution over three categories (taught, not asked); then an interval for a quantity: a lower and an upper bound.',
    technique: 'A static bar chart of probabilities as the worked example, then two typed numbers in text boxes, with no chart.',
    inElicit: 'The guide chart is `barY` with `move` on `p`, under `maintainSum({ total: 1 })` and `clamp`, so dragging one bar takes probability from the others and the bars stay a distribution. The cat question is one row with `lo` and `hi`: each is bound to an `editText` label (the typed boxes) and to a draggable tick on a 0–24 axis. A `constraints.custom` rule refuses a min above the max; `ordering` would do it, but it reads the still-empty max as 0. A truth column, empty until Next, draws the answer.',
  },
  recreation: {
    title: 'Type a min and max',
    question: 'Who will be the hero’s guide? Then: how many hours does an average cat sleep in a day?',
    try: 'Drag a bar: the others give way so the total stays 1. Below, double-click each ? to type your min and max guess (or drag the ticks), then press Next.',
    why: '`maintainSum` repairs every drag so the three probabilities add to 1, which is the lesson the MONK is teaching. In the cat chart, `editText` writes the typed text into `lo` or `hi` as a number, the same columns the ticks drag. Both start empty, so the boxes show ? until you type.',
    uses: ['barY()', 'move()', 'maintainSum()', 'editText()', 'constraints.custom()', 'stage'],
    code: `const ink = "#94B9D1";   // the tutorial's steel blue
mount(ui.note("Our hero is in search of a guide... who will likely be human, but may very well be animal or inanimate."));
mount(Elicit({
  width: 420, height: 250,
  margins: { top: 16, right: 16, bottom: 50, left: 52 },
  schema: {
    guide: { type: "categorical", domain: ["human", "animal", "book"] },
    p: { type: "quantitative", domain: [0, 1] },
  },
  scales: { x: { padding: 0.01 } },
  data: [{ guide: "human", p: 0.6 }, { guide: "animal", p: 0.2 }, { guide: "book", p: 0.2 }],
  constraints: [
    clamp({ field: "p", min: 0, max: 1 }),
    maintainSum({ field: "p", total: 1, strategy: "redistribute" }),            //! the bars always sum to 1
  ],
  elements: [axisX({ title: "Who will be the hero's guide?" }), axisY({ ticks: 5, title: "Probability" })],
  marks: [barY({ fill: ink, channels: { x: { field: "guide" }, y: { field: "p", edit: move() } } })], //! drag a bar's top
}));
mount(ui.note("MONK: This point is, distributions allow us to shift from using vague language like \\"pretty sure\\", to having a picture of exactly what we think."));
mount(ui.question("**Question 1 out of 8.** How many hours does an average cat sleep in a day?"));

const box = (field, x) => [
  rect({ width: 96, height: 34, rx: 3, fill: "#fff", stroke: "#888", channels: { x: { value: x }, y: { value: -30 } } }),
  text({ fontSize: 20, fill: "#2B5D87", format: (v) => (v == null || v === "" ? "?" : String(v)),
    channels: { x: { value: x }, y: { value: -30 }, text: { field, edit: editText({ stage: 0 }) } } }), //! a typed bound
];
const cat = mount(Elicit({
  stage: 0, width: 420, height: 190,
  margins: { top: 74, right: 20, bottom: 40, left: 20 },
  schema: {
    lo: { type: "quantitative", domain: [0, 24] },
    hi: { type: "quantitative", domain: [0, 24] },
    truth: { type: "quantitative", domain: [0, 24] },
  },
  data: [{ lo: null, hi: null, truth: null }],
  constraints: [
    clamp({ field: ["lo", "hi"], min: 0, max: 24 }),
    snap({ field: ["lo", "hi"], step: 0.5 }),
    // min ≤ max, once both are typed (\`ordering\` would read an empty max as 0)
    constraints.custom(({ active: d }) => (d && d.lo != null && d.hi != null && d.lo > d.hi ? false : undefined)), //! a min above the max is refused
  ],
  elements: [axisX({ ticks: 12, title: "hours a day" })],
  marks: [
    text({ fontSize: 12, fill: "#666", text: "Min guess", channels: { x: { value: 70 }, y: { value: -62 } } }),
    text({ fontSize: 12, fill: "#666", text: "Max guess", channels: { x: { value: 210 }, y: { value: -62 } } }),
    ...box("lo", 70),
    ...box("hi", 210),
    rule({ stroke: "#50AEB7", strokeWidth: 6, channels: { x1: { field: "lo" }, x2: { field: "hi" }, y: { value: 40 } } }),
    tickX({ stroke: "#2B5D87", strokeWidth: 3, length: 26, channels: { x: { field: "lo", edit: move({ stage: 0 }) }, y: { value: 40 } } }),
    tickX({ stroke: "#2B5D87", strokeWidth: 3, length: 26, channels: { x: { field: "hi", edit: move({ stage: 0 }) }, y: { value: 40 } } }),
    ruleX({ stroke: "#D0021B", strokeWidth: 2, channels: { x: { field: "truth" } } }), //! the answer, once Next sets it
  ],
}));
const note = ui.note("");
mount(ui.row(ui.button("Next", () => {
  const { lo, hi } = cat.getData()[0];
  if (lo == null || hi == null) { note.innerHTML = ui.md("Type both a min and a max guess."); return; }
  cat.set("truth", 15, { index: 0 });
  cat.nextStage();
  note.innerHTML = ui.md("Cats sleep about **15 hours** a day (red). " +
    (lo <= 15 && 15 <= hi ? "Your range caught it." : "Your range missed it."));
})));
mount(note);`,
  },
  variants: [
    {
      title: 'Spread the chances',
      question: 'How many hours does an average cat sleep in a day? Spread 20 tokens over the ranges you think likely.',
      try: 'Click in a column to drop a token, or drag a stack up and down; place all 20.',
      why: 'The tutorial teaches distributions and then asks only for two bounds. `widgets.probabilityTokens` asks for the distribution itself, the picture the MONK promises: each token is one chance in 20, and the stacks are your belief over the same hours.',
      uses: ['widgets.probabilityTokens()'],
      code: `mount(Elicit(widgets.probabilityTokens({
  question: "Hours an average cat sleeps a day",
  bins: ["0–4", "4–8", "8–12", "12–16", "16–20", "20–24"],                     //! the same quantity, as bins of hours
  maxTokens: 20,                                                                //! 20 tokens = 20 chances in 20
  width: 440,
})));`,
    },
  ],
  needs: [],
  gaps: [
    'The source is unidentified, so the flow after Next is unknown; the reveal (15 hours, from Britannica) and the “caught it” line are this recreation’s, not the original’s.',
    'Only question 1 of 8 is known; the other seven are not recreated.',
    'In the screenshot the guide bars may be a static picture; here they are draggable, under a sum-to-1 constraint.',
    'Typing needs a double-click on each ?; the original’s boxes are always open. The 0–24 axis and draggable ticks are additions.',
    'The Okay… and Begin buttons that step through the story are dropped: the story text, the guide chart and the question show together.',
  ],
});
