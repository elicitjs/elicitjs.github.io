/**
 * The intro walkthrough, one step at a time. Each step has the spec it shows,
 * the chart it builds (over the walkthrough's one dataset, so an answer carries
 * from step to step) and the gesture its pointer shows as you scroll.
 */
import type { ReactNode } from 'react';
import * as elicit from '@elicit';
import { findTarget, findTargets, type Gesture, type Pt, type SceneNode } from './pointer';

// The grammar namespaces, untyped: these specs use frame channels and `fn`
// channels whose option types are wider than this file needs to restate.
const P = elicit.plot as any;
const El = elicit.elements as any;
const Ed = elicit.edit as any;
const C = elicit.constraints as any;

export const CAUSES = ['Interest rates', 'Immigration', 'Investors', 'Too few homes'];
export const ICON: Record<string, string> = { 'Interest rates': '🏦', Immigration: '🌍', Investors: '💰', 'Too few homes': '🏗️' };
export const SEED = [
  { cause: 'Interest rates', share: 30 },
  { cause: 'Immigration', share: 20 },
  { cause: 'Investors', share: 25 },
  { cause: 'Too few homes', share: 25 },
];
export const schema = () => ({
  cause: { type: 'categorical', domain: CAUSES },
  share: { type: 'quantitative', domain: [0, 100] },
});
export const rules = () => [
  C.clamp({ field: 'share', min: 0 }),
  C.maintainSum({ field: 'share', total: 100, strategy: 'redistribute' }),
];

/** Colours that follow the docs' mode, for the parts a theme does not reach. */
export type Ink = { line: string; walls: string };
export const inkFor = (mode: 'light' | 'dark'): Ink =>
  mode === 'dark' ? { line: '#BCC9D4', walls: '#3A4A5C' } : { line: '#46596B', walls: '#FBEFD5' };

// The charts scale down into their pane, so their axis labels start larger.
export const READABLE = { axis: { fontSize: 14 } };
const FRAME = { width: 480, height: 400, responsive: 'scale', theme: READABLE, margins: { top: 30, right: 12, bottom: 34, left: 44 } };
const BARE = { ...FRAME, axes: false, margins: { top: 10, right: 10, bottom: 10, left: 10 } };
const RAMP = ['#BFE3E6', '#1D4467'];

const bars = ({ edit = false, fill = false }: { edit?: boolean; fill?: boolean } = {}) => P.barY({
  ...(fill ? {} : { fill: '#50AEB7' }),
  channels: {
    x: { field: 'cause' },
    y: { field: 'share', ...(edit ? { edit: Ed.move() } : {}) },
    ...(fill ? { fill: { field: 'share', scale: { range: RAMP } } } : {}),
  },
});
const emoji = () => P.text({
  dy: -18,
  channels: {
    x: { field: 'cause' },
    y: { field: 'share' },
    text: { fn: (d: any) => ICON[d.cause] },
    fontSize: { field: 'share', scale: { range: [14, 40] } },
  },
});

// A house whose walls rise with `share`. The roof, chimney and label sit on the
// same field over shifted frames, so they ride on top of the walls.
const ROOF = 'M-1,0.5 L0,-0.5 L1,0.5 Z';
const TOP = [-0.5, 2.5];
const on = (dy: number) => TOP.map((t) => +(t + dy).toFixed(2));
const wallTop = (d: any) => TOP[0] + ((TOP[1] - TOP[0]) * d.share) / 100;
const FLOORS = [-0.25, 0.35, 0.95, 1.55, 2.15];
export const house = (ink: Ink) => P.composite({
  channels: { x: { field: 'cause' }, y: { value: 268 }, size: { value: 70 } },
  parts: [
    P.rect({ channels: { x1: { frame: -0.8 }, x2: { frame: 0.8 }, y1: { frame: -1.05 }, y2: { frame: -0.95 }, fill: { value: '#7DB86B' } } }),
    P.rect({ channels: {
      x1: { frame: 0.24 }, x2: { frame: 0.4 }, y1: { field: 'share', frame: on(0.1) }, y2: { field: 'share', frame: on(0.66) },
      fill: { value: '#B4553D' }, stroke: { value: ink.line }, strokeWidth: { value: 1.5 },
    } }),
    P.rect({ channels: {
      x1: { frame: -0.55 }, x2: { frame: 0.55 }, y1: { frame: -0.95 },
      y2: { field: 'share', frame: TOP, edit: Ed.move({ mode: 'relative' }) },
      fill: { value: ink.walls }, stroke: { value: ink.line }, strokeWidth: { value: 2 },
    } }),
    P.rect({ channels: { x1: { frame: -0.13 }, x2: { frame: 0.13 }, y1: { frame: -0.95 }, y2: { frame: -0.5 }, fill: { value: '#2B5D87' } } }),
    ...FLOORS.flatMap((y) => [[-0.4, -0.14], [0.14, 0.4]].map(([x1, x2]) => P.rect({ channels: {
      x1: { frame: x1 }, x2: { frame: x2 }, y1: { frame: y }, y2: { frame: y + 0.3 },
      fill: { fn: (d: any) => (wallTop(d) > y + 0.42 ? '#FCD34D' : 'none') },
      stroke: { fn: (d: any) => (wallTop(d) > y + 0.42 ? ink.line : 'none') },
      strokeWidth: { value: 1.2 },
    } }))),
    P.shape({ path: ROOF, channels: {
      y: { field: 'share', frame: on(0.36), edit: Ed.move({ mode: 'relative' }) }, size: { frame: 0.74 },
      fill: { value: '#EE7B5E' }, stroke: { value: ink.line }, strokeWidth: { value: 2 },
    } }),
    P.text({ channels: { y: { field: 'share', frame: on(0.98) }, text: { fn: (d: any) => `${Math.round(d.share)}%` }, fontSize: { value: 16 } } }),
    P.text({ channels: { y: { frame: -1.32 }, text: { fn: (d: any) => `${ICON[d.cause]} ${d.cause}` }, fontSize: { value: 13 } } }),
  ],
});

/* ── The spec as the reader sees it ─────────────────────────────────── */

const DATA = `  data: [
    { cause: "Interest rates", share: 30 },
    { cause: "Immigration",    share: 20 },
    { cause: "Investors",      share: 25 },
    { cause: "Too few homes",  share: 25 },
  ],
  schema: {
    cause: { type: "categorical" },
    share: {
      type: "quantitative",
      domain: [0, 100],
    },
  },`;
const RULES = `  constraints: [
    clamp({ field: "share", min: 0 }),
    maintainSum({ field: "share", total: 100 }),
  ],`;
const Y = {
  plain: `        y: { field: "share" },`,
  edit: `        y: { field: "share", edit: move() },`,
  fill: `        y: { field: "share", edit: move() },
        fill: { field: "share" },`,
};
const EMOJI = `
    text({
      dy: -18,
      channels: {
        x: { field: "cause" },
        y: { field: "share" },
        text: { fn: (d) => ICON[d.cause] },
        fontSize: {
          field: "share",
          scale: { range: [14, 40] },
        },
      },
    }),`;
const MARKS = (y: keyof typeof Y, withEmoji = false) => `  marks: [
    barY({
      channels: {
        x: { field: "cause" },
${Y[y]}
      },
    }),${withEmoji ? EMOJI : ''}
  ],`;
const spec = (...parts: string[]) => `const chart = Elicit({\n${parts.join('\n')}\n});`;
const LISTEN = `

chart.on("change", () => {
  save(chart.getData());
});`;

/* ── Demos: the gesture the pointer shows on each step ──────────────── */

/** Find a step's gesture on its drawn chart; null until the chart has drawn. */
export type Demo = (root: HTMLElement) => Gesture | null;

const barOf = (root: HTMLElement, i: number) =>
  findTarget(root, (n) => n.type === 'rect' && n.bandAxis === 'x' && n.editable && n.index === i);

/** Raise bar `i` by `dy` pixels. */
const raiseBar = (i: number, dy: number): Demo => (root) => {
  const target = barOf(root, i);
  if (!target) return null;
  const x = target.node.x + target.node.width / 2, y = target.node.y;
  return { target, path: [[x, y], [x, y - dy]] };
};

/** Slide stack edge `k` right by `dx` pixels. */
const slideEdge = (k: number, dx: number): Demo => (root) => {
  const target = findTarget(root, (n) => n.edge && n.stack && n.index === k);
  if (!target) return null;
  const { cx, cy } = target.node;
  return { target, path: [[cx, cy], [cx + dx, cy]] };
};

/** Paint three more rows of row `i`'s squares. */
const paintWaffle = (i: number): Demo => (root) => {
  const cells = findTargets(root, (n) => n.type === 'rect' && n.editable && n.index === i);
  if (!cells.length) return null;
  // Rows of squares, bottom first; the right-hand square of a row sets a whole row.
  const rows = [...new Set(cells.map((c) => Math.round(c.node.y)))].sort((a, b) => b - a);
  const filled = (n: SceneNode) => n.fill && n.fill !== cells[cells.length - 1].node.fill;
  const top = rows.findIndex((ry) => !cells.some((c) => Math.round(c.node.y) === ry && filled(c.node))) - 1;
  const at = (r: number): Pt => {
    const row = cells.filter((c) => Math.round(c.node.y) === rows[Math.max(0, Math.min(rows.length - 1, r))]);
    const right = row.reduce((a, b) => (b.node.x > a.node.x ? b : a));
    return [right.node.x + right.node.width / 2, right.node.y + right.node.height / 2];
  };
  const from = Math.max(0, top);
  return { target: cells[0], path: [at(from), at(from + 3)] };
};

/** Raise house `i` by `dy` pixels from its wall top. */
const raiseHouse = (i: number, dy: number): Demo => (root) => {
  const target = findTarget(root, (n) => n.type === 'rect' && n.editable && n.cursor === 'ns-resize' && n.index === i);
  if (!target) return null;
  const x = target.node.x + target.node.width / 2, y = target.node.y + 3;
  return { target, path: [[x, y], [x, y - dy]] };
};

/* ── The steps ───────────────────────────────────────────────────────── */

export type Built = { constrained: boolean; spec: Record<string, unknown> };
export type Step = {
  id: string;
  title: string;
  body: ReactNode;
  try?: ReactNode;
  more?: { href: string; label: string };
  code: string;
  /** Keys that fold even when they changed. */
  fold?: string[];
  /** Show the getData() readout; 'highlight' draws attention to it. */
  readout?: boolean | 'highlight';
  /** The chart, over the walkthrough's dataset. Absent: the step builds its own (JSON). */
  build?: (ink: Ink) => Built;
  demo?: Demo;
};

/** A name in the text. Hovering it marks where it sits in the spec. */
const c = (s: string) => <code className="inline walk-ref" data-ref={s}>{s}</code>;

export const STEPS: Step[] = [
  {
    id: 'chart',
    title: 'Draw a chart',
    body: <>A chart is a spec. {c('data')} holds the rows, {c('schema')} says what each field means, and {c('marks')} draw the rows. This one draws four causes of rising house prices, each with a share.</>,
    more: { href: '/start', label: 'Getting started' },
    code: spec(DATA, MARKS('plain')),
    build: () => ({ constrained: false, spec: { ...FRAME, marks: [bars()] } }),
  },
  {
    id: 'edit',
    title: 'Let people answer by dragging',
    body: <>Put an <b>edit</b> on a channel and the mark takes input. {c('move()')} on {c('y')} turns a drag into a new {c('share')}. The drag is read back through the same scale that drew the bar.</>,
    try: <><b>Drag</b> a bar up or down.</>,
    more: { href: '/editing', label: 'Editing' },
    readout: true,
    code: spec(DATA, MARKS('edit')),
    build: () => ({ constrained: false, spec: { ...FRAME, marks: [bars({ edit: true })] } }),
    demo: raiseBar(1, 70),
  },
  {
    id: 'channels',
    title: 'Show the answer in more than one channel',
    body: <>A field can drive several channels. With {c('fill')} on {c('share')}, a bar darkens as it grows. The drag writes {c('share')} once, and every channel that reads it redraws.</>,
    try: <><b>Drag</b> a bar and watch its colour.</>,
    more: { href: '/scales', label: 'Scales & channels' },
    readout: true,
    code: spec(DATA, MARKS('fill')),
    build: () => ({ constrained: false, spec: { ...FRAME, marks: [bars({ edit: true, fill: true })] } }),
    demo: raiseBar(2, 90),
  },
  {
    id: 'marks',
    title: 'Add a mark that reacts',
    body: <>Marks share the rows, so a second mark follows the first. This {c('text')} mark puts an emoji on each bar. It reads {c('share')} for its position and its size, so it rides up and grows as you drag the bar under it.</>,
    try: <><b>Drag</b> a bar and watch its emoji.</>,
    more: { href: '/marks/text', label: 'Text' },
    readout: true,
    code: spec(DATA, MARKS('fill', true)),
    build: () => ({ constrained: false, spec: { ...FRAME, marks: [bars({ edit: true, fill: true }), emoji()] } }),
    demo: raiseBar(0, 80),
  },
  {
    id: 'constraints',
    title: 'Keep the answer adding up',
    body: <>The four shares split one rise in prices, so they have to add up to 100. A <b>constraint</b> on the dataset checks every change. {c('maintainSum')} repairs it, so raising one bar lowers the others, and {c('clamp')} stops a share going below 0.</>,
    try: <><b>Drag</b> one bar and watch the rest.</>,
    more: { href: '/constraints', label: 'Constraints' },
    readout: true,
    code: spec(DATA, RULES, MARKS('fill', true)),
    build: () => ({ constrained: true, spec: { ...FRAME, marks: [bars({ edit: true, fill: true }), emoji()] } }),
    demo: raiseBar(1, 90),
  },
  {
    id: 'answer',
    title: 'Read the answer',
    body: <>The answer is the data. {c('getData()')} returns the rows as they stand, and {c('on("change")')} calls you after every edit. The panel under the chart is what your app reads.</>,
    more: { href: '/dataset', label: 'Datasets & linked charts' },
    readout: 'highlight',
    code: spec(DATA, RULES, MARKS('fill', true)) + LISTEN,
    build: () => ({ constrained: true, spec: { ...FRAME, marks: [bars({ edit: true, fill: true }), emoji()] } }),
    demo: raiseBar(3, 70),
  },
  {
    id: 'stack',
    title: 'Ask it as one bar',
    body: <>Change the mark and the question changes with it. Stacked into one bar, the four shares read as parts of a single rise. You drag the edge between two segments, so every answer weighs one cause against its neighbour. Your answer carries over, because the data never belonged to the mark.</>,
    try: <><b>Drag</b> an edge between two segments.</>,
    more: { href: '/marks/bar', label: 'Bar' },
    readout: true,
    code: spec(DATA, RULES, `  elements: [legendColor({ anchor: "bottom" })],
  marks: [
    barX({
      edits: [edit.stack.edge()],
      channels: {
        x: { field: "share" },
        stack: { field: "cause" },
        fill: { field: "cause" },
      },
    }),
  ],`) + LISTEN,
    build: () => ({ constrained: true, spec: {
      width: 300, height: 110, responsive: 'scale', theme: { axis: { fontSize: 11 } }, margins: { top: 8, right: 10, bottom: 24, left: 10 },
      elements: [El.legendColor({ anchor: 'bottom' })],
      marks: [P.barX({ edits: [Ed.stack.edge()], handleSize: 5, channels: { x: { field: 'share' }, stack: { field: 'cause' }, fill: { field: 'cause' } } })],
    } }),
    demo: slideEdge(0, 40),
  },
  {
    id: 'waffle',
    title: 'Hand out 100 squares',
    body: <>A waffle draws each share as squares, one per percentage point. You paint squares to give each cause its part. The rows and the rule stay the same.</>,
    try: <><b>Click</b> or <b>drag</b> along a column of squares.</>,
    more: { href: '/marks/waffle', label: 'Waffle' },
    readout: true,
    code: spec(DATA, RULES, `  marks: [
    waffleY({
      multiple: 5,
      channels: {
        x: { field: "cause" },
        count: {
          field: "share",
          edit: edit.waffle.fill(),
        },
        fill: { field: "cause" },
      },
    }),
  ],`) + LISTEN,
    build: () => ({ constrained: true, spec: { ...FRAME, marks: [P.waffleY({ multiple: 5,
      channels: { x: { field: 'cause' }, count: { field: 'share', edit: Ed.waffle.fill() }, fill: { field: 'cause' } } })] } }),
    demo: paintWaffle(1),
  },
  {
    id: 'composite',
    title: 'Make the mark anything',
    body: <>A {c('composite')} builds a new mark from ordinary ones, placed in its own frame. Each house here is a few rects, a roof {c('shape')} and two labels. The walls&rsquo; height reads {c('share')}, and the roof sits on the same field, so dragging the roof or the walls raises the house. A window lights up on each floor it reaches.</>,
    try: <><b>Drag</b> a roof up to raise a house.</>,
    more: { href: '/marks/composite', label: 'Composite & glyph boxes' },
    readout: true,
    code: spec(DATA, RULES, `  axes: false,
  marks: [
    composite({
      channels: { x: { field: "cause" } },
      parts: [
        // the walls: their top is the answer
        rect({ channels: {
          y1: { frame: -0.95 },
          y2: { field: "share", frame: [-0.5, 2.5],
                edit: move() },
        } }),
        // the roof rides on the walls
        shape({ path: ROOF, channels: {
          y: { field: "share", frame: [-0.14, 2.86],
               edit: move() },
        } }),
        // a lit window on each floor it reaches
        ...FLOORS.map((y) => rect({ channels: {
          y1: { frame: y }, y2: { frame: y + 0.3 },
          fill: { fn: (d) => lit(d, y) },
        } })),
        // the label
        text({ channels: {
          y: { frame: -1.32 },
          text: { field: "cause" },
        } }),
      ],
    }),
  ],`) + LISTEN,
    build: (ink) => ({ constrained: true, spec: { ...BARE, marks: [house(ink)] } }),
    demo: raiseHouse(2, 70),
  },
  {
    id: 'json',
    title: 'Write it as JSON',
    body: <>Every spec has a JSON form in the same grammar. {c('compile(json)')} turns {c('{ "type": "barY" }')} into {c('barY()')}. A language model can write this JSON, show the chart to a person in a conversation, and read the rows back.</>,
    try: <><b>Drag</b> a bar in the reply.</>,
    more: { href: '/json', label: 'JSON specs' },
    readout: true,
    fold: ['data', 'schema'],
    code: `const json = {
  "data": [
    { "cause": "Interest rates", "share": 30 },
    { "cause": "Immigration",    "share": 20 },
    { "cause": "Investors",      "share": 25 },
    { "cause": "Too few homes",  "share": 25 }
  ],
  "schema": {
    "cause": { "type": "categorical" },
    "share": {
      "type": "quantitative",
      "domain": [0, 100]
    }
  },
  "constraints": [
    { "type": "clamp", "field": "share", "min": 0 },
    { "type": "maintainSum", "field": "share",
      "total": 100 }
  ],
  "marks": [{
    "type": "barY",
    "channels": {
      "x": { "field": "cause" },
      "y": { "field": "share",
             "edit": { "type": "move" } },
      "fill": { "field": "share" }
    }
  }]
};

const chart = Elicit(compile(json));`,
    demo: raiseBar(0, 50),
  },
];

/** The JSON step's chart, as a model would send it. */
export const jsonSpec = (rows: { cause: string; share: number }[]) => ({
  width: 440, height: 240, responsive: 'scale', theme: READABLE, margins: { top: 10, right: 10, bottom: 30, left: 40 },
  data: rows.map((d) => ({ cause: d.cause, share: Math.round(d.share) })),
  schema: schema(),
  constraints: [
    { type: 'clamp', field: 'share', min: 0 },
    { type: 'maintainSum', field: 'share', total: 100, strategy: 'redistribute' },
  ],
  marks: [{
    type: 'barY',
    channels: {
      x: { field: 'cause' },
      y: { field: 'share', edit: { type: 'move' } },
      fill: { field: 'share', scale: { range: RAMP } },
    },
  }],
});
