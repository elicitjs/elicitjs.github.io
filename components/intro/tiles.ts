/**
 * The intro's mark gallery: one live chart per tile, each a whole spec. The
 * gallery splits a spec into its dataset half and its chart half, so the large
 * chart and its small copy draw one dataset.
 */
import * as d3 from 'd3';
import * as elicit from '@elicit';
import vancouver from '../../data/vancouver.js';
import { CAUSES, SEED, house, rules, type Ink } from './steps';

const P = elicit.plot as any;
const El = elicit.elements as any;
const Ed = elicit.edit as any;
const C = elicit.constraints as any;
const G = elicit.guides as any;
const L = elicit.layout as any;
const when = Ed.when;

export type Tile = {
  id: string;
  /** What you do, as the tile's name. */
  what: string;
  /** The marks and edits that do it. */
  kw: string;
  how: string;
  /** The docs page for the mark. */
  href: string;
  /** `card` is the colour behind the chart, for a part that has to match it. */
  spec: (ink: Ink & { card: string }) => Record<string, any>;
};

const GLASS = 'M-0.42,-0.8 L0.42,-0.8 C0.42,-0.3 0.05,-0.12 0.05,0 C0.05,0.12 0.42,0.3 0.42,0.8 L-0.42,0.8 C-0.42,0.3 -0.05,0.12 -0.05,0 C-0.05,-0.12 -0.42,-0.3 -0.42,-0.8 Z';
const MASK = 'M-0.46,-0.82 L-0.46,0.82 L0.46,0.82 L0.46,-0.82 Z ' + GLASS;
const RECORD = [52725, 53543, 52627, 52542, 54589, 54052, 45196, 44525, 45523, 47878, 50331, 51093, 51091, 49301, 43945, 42589, 44257, 43825, 46087, 46390, 47087, 45582, 44599];

const hierarchy = (kinds: string[], extra: Record<string, unknown>) => ({
  structure: 'hierarchy',
  tables: {
    nodes: {
      id: { type: 'categorical', key: true, open: true },
      label: { type: 'categorical', open: true },
      kind: { type: 'categorical', domain: kinds },
      x: { type: 'quantitative', domain: [0, 100] },
      y: { type: 'quantitative', domain: [0, 100] },
      ...extra,
    },
    nesting: { child: { type: 'ref' }, parent: { type: 'ref' } },
  },
});

export const TILES: Tile[] = [
  {
    id: 'trend', what: 'Draw a trend', kw: 'lineY · line.draw', href: '/marks/line',
    how: 'Sweep across the chart to draw the line you expect.',
    spec: () => ({
      width: 420, height: 300, margins: { top: 14, right: 14, bottom: 26, left: 30 }, data: [],
      schema: { s: { type: 'categorical' }, x: { type: 'quantitative', domain: [0, 10] }, y: { type: 'quantitative', domain: [0, 100] } },
      marks: [P.lineY({
        stroke: '#50AEB7', strokeWidth: 3, curve: 'catmullRom',
        channels: { series: { field: 's' }, x: { field: 'x' }, y: { field: 'y' } },
        edits: [Ed.line.draw({ along: 'x', value: 'y', series: 's', samples: 10 })],
      })],
    }),
  },
  {
    id: 'next', what: 'Draw what happened next', kw: 'lineY · line.draw · lock', href: '/editing/existence',
    how: 'Draw 1991–2016 after the record ends.',
    spec: () => ({
      width: 480, height: 300, margins: { top: 14, right: 18, bottom: 28, left: 46 },
      schema: { year: { type: 'quantitative', domain: [1968, 2016] }, deaths: { type: 'quantitative', domain: [0, 60000] } },
      data: RECORD.map((deaths, i) => ({ year: 1968 + i, deaths })),
      lock: 'seed',
      axes: { x: { tickFormat: 'd' }, y: { tickFormat: '~s' } },
      guides: [G.region({ x: [1968, 1990], opacity: 0.12 })],
      marks: [P.lineY({
        stroke: '#50AEB7', strokeWidth: 3, curve: 'catmullRom', handleSize: 3,
        channels: { x: { field: 'year' }, y: { field: 'deaths' } },
        edits: [Ed.line.draw({ samples: d3.range(1991, 2017) })],
      })],
    }),
  },
  {
    id: 'scatter', what: 'Place people on two scales', kw: 'point · create · move', href: '/marks/point',
    how: 'Double-click to add someone, drag to move them.',
    spec: () => ({
      width: 420, height: 300, margins: { top: 14, right: 14, bottom: 36, left: 40 },
      schema: { age: { type: 'quantitative', domain: [18, 80] }, attitude: { type: 'quantitative', domain: [-1, 1], default: 0 } },
      axes: { x: { title: 'Age' }, y: { title: 'Attitude' } },
      data: [{ age: 25, attitude: 0.6 }, { age: 47, attitude: -0.1 }, { age: 66, attitude: -0.5 }],
      marks: [P.point({
        size: 7,
        channels: { x: { field: 'age' }, y: { field: 'attitude' }, fill: { field: 'attitude', scale: { scheme: 'dddiverging', reverse: true } } },
        edits: [Ed.create({ gesture: 'dblclick' }), Ed.move({ channels: ['x', 'y'] })],
      })],
    }),
  },
  {
    id: 'ellipse', what: 'Give a guess and how unsure you are', kw: 'ellipse · point · composite', href: '/marks/ellipse',
    how: 'Drag the dot to move the guess, the edge to widen it.',
    spec: () => ({
      width: 420, height: 300, margins: { top: 16, right: 20, bottom: 36, left: 40 },
      axes: { x: { title: 'Cost' }, y: { title: 'Benefit' } },
      data: [{ cost: 40, benefit: 55, sd: 14 }],
      schema: { cost: { type: 'quantitative', domain: [0, 100] }, benefit: { type: 'quantitative', domain: [0, 100] }, sd: { type: 'quantitative', domain: [2, 30] } },
      marks: [P.composite({ parts: [
        P.ellipse({ channels: {
          x: { field: 'cost' }, y: { field: 'benefit' },
          rx: { field: 'sd', scale: { range: [6, 64] }, edit: Ed.slide({ axis: 'x', increase: 'right' }) },
          ry: { field: 'sd', scale: { range: [6, 64] } },
          fill: { value: '#50AEB7' }, fillOpacity: { value: 0.28 }, stroke: { value: '#37919B' },
        } }),
        P.point({ channels: { x: { field: 'cost', edit: Ed.move({ channels: ['x', 'y'] }) }, y: { field: 'benefit' }, size: { value: 5 }, fill: { value: '#37919B' } } }),
      ] })],
    }),
  },
  {
    id: 'donut', what: 'Split a whole', kw: 'donut · stack.edge', href: '/marks/arc',
    how: 'Drag a boundary between two slices.',
    spec: () => ({
      width: 300, height: 280, axes: false, margins: { top: 10, right: 10, bottom: 10, left: 10 },
      data: [{ cat: 'A', v: 20 }, { cat: 'B', v: 20 }, { cat: 'C', v: 20 }, { cat: 'D', v: 40 }],
      schema: { cat: { type: 'categorical' }, v: { type: 'quantitative', domain: [0, 100] } },
      marks: [P.donut({ outerRadius: 120, innerRadius: 62, handleSize: 6, edits: [Ed.stack.edge()], channels: { theta: { field: 'v' }, fill: { field: 'cat' } } })],
    }),
  },
  {
    id: 'dial', what: 'Turn a dial', kw: 'needle · rotate', href: '/marks/needle',
    how: 'Drag the needle round.',
    spec: () => ({
      width: 280, height: 280, axes: false, margins: { top: 16, right: 16, bottom: 16, left: 16 },
      data: [{ n: 0.35 }], schema: { n: { type: 'quantitative', domain: [0, 1] } },
      marks: [
        El.axisRadial({ arc: 'full', radius: 100, ticks: 8, channels: { theta: { field: 'n', scale: { range: [-180, 180] } } } }),
        P.needle({ length: 84, fill: '#EE7B5E', channels: { theta: { field: 'n', scale: { range: [-180, 180] }, edit: Ed.rotate({ pivot: 'mark', fold: false, pick: 'direct' }) } } }),
        P.text({ fontSize: 18, format: '.0%', dy: 38, channels: { text: { field: 'n' }, textAnchor: { value: 'middle' }, lineAnchor: { value: 'middle' } } }),
      ],
    }),
  },
  {
    id: 'waffle', what: 'Paint a proportion', kw: 'waffleY · waffle.fill', href: '/marks/waffle',
    how: 'Click a square to set the count.',
    spec: () => ({
      width: 240, height: 300, margins: { top: 14, right: 12, bottom: 24, left: 34 },
      data: [{ cat: 'belief', value: 0.4 }],
      schema: { cat: { type: 'categorical', domain: ['belief'] }, value: { type: 'quantitative', domain: [0, 1] } },
      scales: { x: { type: 'band' } },
      marks: [P.waffleY({
        fill: '#50AEB7', unit: 1 / 50,
        channels: { x: { field: 'cat' }, count: { field: 'value', edit: Ed.waffle.fill() } },
        edits: [Ed.waffle.fill({ channels: ['count'], gesture: 'click' })],
      })],
    }),
  },
  {
    id: 'tokens', what: 'Spread chances over outcomes', kw: 'dotStack · create · remove', href: '/marks/dotstack',
    how: 'Click a bin to drop a token, click a token to take it back.',
    spec: () => ({
      width: 480, height: 280, axes: { x: { tickFormat: '.0%' }, y: false }, margins: { top: 16, right: 16, bottom: 28, left: 16 },
      data: [0.2, 0.3, 0.3, 0.3, 0.4, 0.4, 0.4, 0.4, 0.5, 0.5].map((bin) => ({ bin })),
      schema: { bin: { type: 'categorical', domain: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1] } },
      scales: { x: { type: 'point' } },
      constraints: [C.count({ max: 25 })],
      marks: [P.dotStack({ channels: { x: { field: 'bin' } }, edits: [Ed.create({ gesture: 'click', channels: ['x'] }), Ed.remove()], label: true })],
    }),
  },
  {
    id: 'band', what: 'Set a relationship and how sure you are', kw: 'trend · trendBand', href: '/marks/trend',
    how: "Drag the line's handles to move it.",
    spec: () => ({
      width: 360, height: 300, margins: { top: 14, right: 14, bottom: 26, left: 32 },
      schema: {
        x: { type: 'quantitative', domain: [-10, 10] }, y: { type: 'quantitative', domain: [-10, 10] },
        intercept: { type: 'quantitative' }, slope: { type: 'quantitative' }, aSd: { type: 'quantitative' }, bSd: { type: 'quantitative' },
      },
      data: [{ intercept: 1, slope: 0.4, aSd: 1.5, bSd: 0.25 }],
      marks: [
        P.trendBand({ fill: '#50AEB7', channels: { interceptSpread: { field: 'aSd' }, slopeSpread: { field: 'bSd' } } }),
        P.trend({ stroke: '#50AEB7', channels: { intercept: { field: 'intercept', edit: Ed.trend.intercept() }, slope: { field: 'slope', edit: Ed.trend.slope() } } }),
      ],
    }),
  },
  {
    id: 'face', what: 'Show a mood', kw: 'face · slide', href: '/marks/face',
    how: 'Drag the mouth up or down, an eye sideways.',
    spec: () => ({
      width: 300, height: 300, margins: { top: 10, right: 10, bottom: 10, left: 10 },
      data: [{ valence: 0.3, arousal: 0.1 }],
      schema: { valence: { type: 'quantitative', domain: [-1, 1] }, arousal: { type: 'quantitative', domain: [-1, 1] } },
      marks: [P.face({ channels: {
        mouthCurve: { field: 'valence', edit: Ed.slide({ axis: 'y', increase: 'up' }) },
        eyeScale: { field: 'arousal', edit: Ed.slide({ axis: 'x', increase: 'right' }) },
      } })],
    }),
  },
  {
    id: 'hourglass', what: 'Estimate a duration', kw: 'composite · shape', href: '/case-studies/glyphs',
    how: 'Drag the sand.',
    spec: ({ card, line }) => ({
      width: 280, height: 300, margins: { top: 10, right: 10, bottom: 10, left: 10 },
      data: [{ weeks: 4 }], schema: { weeks: { type: 'quantitative', domain: [0, 12] } },
      constraints: [C.snap({ step: 1 })],
      marks: [P.composite({ channels: { size: { value: 125 } }, parts: [
        P.rect({ channels: { x1: { frame: -0.42 }, x2: { frame: 0.42 }, y1: { frame: 0 }, y2: { field: 'weeks', frame: [0, 0.8], edit: Ed.move({ mode: 'relative' }) }, fill: { value: '#eab308' } } }),
        P.rect({ channels: { x1: { frame: -0.42 }, x2: { frame: 0.42 }, y1: { frame: -0.8 }, y2: { field: 'weeks', frame: [0, -0.8], edit: Ed.move({ mode: 'relative' }) }, fill: { value: '#eab308' } } }),
        // A box with the glass cut out, painted in the card's colour, trims the sand to the bulbs.
        P.shape({ path: MASK, channels: { size: { frame: 0.82 }, fill: { value: card }, stroke: { value: 'none' } } }),
        P.shape({ path: GLASS, channels: { size: { frame: 0.8 }, fill: { value: 'none' }, stroke: { value: line }, strokeWidth: { value: 2.5 } } }),
        P.rect({ channels: { x1: { frame: -0.52 }, x2: { frame: 0.52 }, y1: { frame: 0.8 }, y2: { frame: 0.88 }, rx: { value: 4 }, fill: { value: '#78350f' } } }),
        P.rect({ channels: { x1: { frame: -0.52 }, x2: { frame: 0.52 }, y1: { frame: -0.88 }, y2: { frame: -0.8 }, rx: { value: 4 }, fill: { value: '#78350f' } } }),
        P.text({ channels: { y: { frame: 1 }, text: { fn: (d: any) => `${d.weeks} week${d.weeks === 1 ? '' : 's'}` }, fontSize: { value: 16 } } }),
      ] })],
    }),
  },
  {
    id: 'house', what: 'Raise a house', kw: 'composite · rect · shape', href: '/marks/composite',
    how: 'Drag a roof up to raise the house.',
    spec: (ink) => ({
      width: 480, height: 400, axes: false, margins: { top: 10, right: 10, bottom: 10, left: 10 },
      data: SEED.map((d) => ({ ...d })),
      schema: { cause: { type: 'categorical', domain: CAUSES }, share: { type: 'quantitative', domain: [0, 100] } },
      constraints: rules(),
      marks: [house(ink)],
    }),
  },
  {
    id: 'map', what: 'Drop pins on a map', kw: 'geoPoint · geo.create', href: '/marks/geo',
    how: 'Click to drop a pin, drag one to move it.',
    spec: () => ({
      width: 480, height: 300, margins: { top: 10, right: 10, bottom: 10, left: 10 },
      projection: { type: 'mercator', domain: vancouver, inset: 6 },
      data: [{ lon: -123.155, lat: 49.268 }, { lon: -123.07, lat: 49.262 }],
      schema: { lon: { type: 'quantitative', domain: [-123.27, -123.02] }, lat: { type: 'quantitative', domain: [49.2, 49.32] } },
      marks: [
        P.geoBasemap({ geojson: vancouver, fill: '#EDF7F8', stroke: '#46596B', strokeWidth: 0.8 }),
        P.geoPoint({ size: 8, fill: '#50AEB7', stroke: '#fff', strokeWidth: 1.5, channels: { lon: { field: 'lon' }, lat: { field: 'lat' } }, edits: [Ed.geo.move(), Ed.geo.create()] }),
      ],
    }),
  },
  {
    id: 'network', what: 'Map what causes what', kw: 'node · link · network.connect', href: '/marks/network',
    how: 'Drag a factor, shift-drag from one to another to link them, click empty space to add one.',
    spec: () => ({
      width: 480, height: 300, axes: false, margins: { top: 22, right: 50, bottom: 22, left: 50 },
      schema: {
        structure: 'network',
        tables: {
          nodes: {
            id: { type: 'categorical', key: true, open: true },
            x: { type: 'quantitative', domain: [0, 100] }, y: { type: 'quantitative', domain: [0, 100] },
            importance: { type: 'quantitative', domain: [0, 10], default: 5 },
          },
          links: { role: 'links', directed: true, fields: { source: { type: 'ref' }, target: { type: 'ref' } } },
        },
      },
      data: {
        nodes: [
          { id: 'Interest rates', x: 16, y: 80, importance: 8 }, { id: 'Migration', x: 16, y: 20, importance: 5 },
          { id: 'New supply', x: 50, y: 88, importance: 6 }, { id: 'Speculation', x: 50, y: 12, importance: 3 },
          { id: 'House prices', x: 84, y: 50, importance: 9 },
        ],
        links: [{ source: 'Interest rates', target: 'House prices' }, { source: 'Migration', target: 'House prices' }],
      },
      marks: [
        P.link({ inset: 3, stroke: '#94A5B3', strokeWidth: 1.5 }),
        P.node({
          fill: '#50AEB7',
          channels: {
            x: { field: 'x', edit: Ed.move({ channels: ['x', 'y'], when: when.noShift }) }, y: { field: 'y' },
            size: { field: 'importance', scale: { range: [4, 16] } }, text: { field: 'id' },
          },
          edits: [Ed.network.connect({ when: when.shift }), Ed.create()],
        }),
      ],
    }),
  },
  {
    id: 'buckets', what: 'Sort cards into buckets', kw: 'hierarchy · rect · hierarchy.nest', href: '/marks/hierarchy',
    how: 'Drag a card into a bucket.',
    spec: () => ({
      width: 520, height: 320, axes: false, margins: { top: 16, right: 14, bottom: 14, left: 14 },
      lock: (d: any, _i: number, table: string) => table === 'nodes' && d.kind === 'bucket',
      schema: hierarchy(['bucket', 'card'], { w: { type: 'quantitative', domain: [0, 600] }, h: { type: 'quantitative', domain: [0, 400] } }),
      data: {
        nodes: [
          { id: 'must', label: 'Must have', kind: 'bucket', x: 18, y: 58, w: 150, h: 200 },
          { id: 'should', label: 'Should have', kind: 'bucket', x: 50, y: 58, w: 150, h: 200 },
          { id: 'wont', label: "Won't have", kind: 'bucket', x: 82, y: 58, w: 150, h: 200 },
          { id: 'c1', label: 'Offline mode', kind: 'card', x: 18, y: 6, w: 96, h: 26 },
          { id: 'c2', label: 'Dark theme', kind: 'card', x: 39, y: 6, w: 96, h: 26 },
          { id: 'c3', label: 'Export PDF', kind: 'card', x: 60, y: 6, w: 96, h: 26 },
          { id: 'c4', label: 'Comments', kind: 'card', x: 81, y: 6, w: 96, h: 26 },
          { id: 'c5', label: 'Search', kind: 'card', x: 18, y: 70, w: 96, h: 26 },
        ],
        nesting: [{ child: 'c5', parent: 'must' }],
      },
      constraints: [C.contain({ parent: (d: any) => d.kind === 'bucket', child: (d: any) => d.kind === 'card' })],
      layout: [L.hierarchy.contain({ padding: { top: 26 } }), L.dodge()],
      marks: [
        P.rect({
          rx: 6, stroke: '#46596B',
          edits: [Ed.move({ channels: ['x', 'y'], mode: 'relative' }), Ed.hierarchy.nest()],
          channels: {
            x: { field: 'x' }, y: { field: 'y' }, width: { field: 'w', scale: null }, height: { field: 'h', scale: null },
            fill: { fn: (d: any) => (d.kind === 'bucket' ? '#EDF7F8' : '#B7DEE1') },
          },
        }),
        P.text({
          fontSize: 11, fill: '#20555A',
          channels: { x: { field: 'x' }, y: { field: 'y' }, text: { field: 'label' }, dy: { fn: (d: any) => (d.kind === 'bucket' ? -d.h / 2 + 12 : 0) } },
        }),
      ],
    }),
  },
  {
    id: 'sets', what: 'Group items into sets', kw: 'hierarchy · point · layout.pack', href: '/marks/hierarchy',
    how: 'Drag an item from one set to the other.',
    spec: () => ({
      width: 520, height: 320, axes: false, margins: { top: 24, right: 14, bottom: 14, left: 14 },
      schema: hierarchy(['set', 'item'], { r: { type: 'quantitative', domain: [0, 300], default: 30 } }),
      data: {
        nodes: [
          { id: 'likely', label: 'Likely', kind: 'set', x: 28, y: 50, r: 30 }, { id: 'unlikely', label: 'Unlikely', kind: 'set', x: 72, y: 50, r: 30 },
          { id: 'a', label: 'Rain', kind: 'item', x: 28, y: 50, r: 22 }, { id: 'b', label: 'Wind', kind: 'item', x: 28, y: 50, r: 16 },
          { id: 'c', label: 'Heat', kind: 'item', x: 28, y: 50, r: 18 }, { id: 'd', label: 'Fog', kind: 'item', x: 28, y: 50, r: 14 },
          { id: 'e', label: 'Snow', kind: 'item', x: 72, y: 50, r: 20 }, { id: 'f', label: 'Hail', kind: 'item', x: 72, y: 50, r: 15 },
        ],
        nesting: [['a', 'likely'], ['b', 'likely'], ['c', 'likely'], ['d', 'likely'], ['e', 'unlikely'], ['f', 'unlikely']]
          .map(([child, parent]) => ({ child, parent })),
      },
      constraints: [C.contain({ parent: (d: any) => d.kind === 'set', child: (d: any) => d.kind === 'item' })],
      layout: [L.hierarchy.contain({ padding: 6, fit: true }), L.pack({ gap: 3 })],
      marks: [
        P.point({
          stroke: '#46596B',
          edits: [Ed.move({ channels: ['x', 'y'], mode: 'relative' }), Ed.hierarchy.nest()],
          channels: {
            x: { field: 'x' }, y: { field: 'y' }, size: { field: 'r', scale: null },
            fill: { fn: (d: any) => (d.kind === 'set' ? '#EDF7F8' : '#C3B9DF') },
          },
        }),
        P.text({
          fontSize: 10, fill: '#20555A',
          channels: { x: { field: 'x' }, y: { field: 'y' }, text: { field: 'label' }, dy: { fn: (d: any) => (d.kind === 'set' ? -d.r - 8 : 0) } },
        }),
      ],
    }),
  },
];

/** The keys a dataset reads; the rest of a spec is the chart's. */
const DATASET_KEYS = ['schema', 'data', 'constraints', 'lock', 'context'];
export function splitSpec(spec: Record<string, any>) {
  const dataset: Record<string, any> = {}, chart: Record<string, any> = {};
  for (const [k, v] of Object.entries(spec)) (DATASET_KEYS.includes(k) ? dataset : chart)[k] = v;
  return { dataset, chart };
}
