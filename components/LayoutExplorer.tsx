'use client';

import { useMemo, useState } from 'react';
import { ExampleLive } from './ExampleLive';

/**
 * Pick a diagram, a network layout and a link shape, and see the chart. The
 * controls write the example's code, so the editor below always holds the spec
 * for what is drawn, and the JSON tab and data panel work as on any example.
 */

type Sample = {
  label: string;
  nodes: string;
  links: string;
  directed: boolean;
  /** Does every node have one parent and no link make a loop? */
  tree: boolean;
  rows: [string, string][];
  edges: [string, string][];
};

const SAMPLES: Record<string, Sample> = {
  loan: {
    label: 'Flowchart',
    tree: false,
    nodes: 'steps',
    links: 'flows',
    directed: true,
    rows: [['apply', 'Apply'], ['id', 'Check ID'], ['score', 'Score'], ['review', 'Review'], ['approve', 'Approve'], ['decline', 'Decline'], ['notify', 'Notify']],
    edges: [['apply', 'id'], ['id', 'score'], ['score', 'approve'], ['score', 'review'], ['review', 'approve'], ['review', 'decline'], ['approve', 'notify'], ['decline', 'notify'], ['id', 'decline']],
  },
  causal: {
    label: 'Causal map (with a loop)',
    tree: false,
    nodes: 'factors',
    links: 'causes',
    directed: true,
    rows: [['rates', 'Interest rates'], ['mort', 'Mortgage cost'], ['wages', 'Wages'], ['migr', 'Migration'], ['demand', 'Demand'], ['rents', 'Rents'], ['price', 'House prices'], ['build', 'Construction'], ['supply', 'Supply']],
    edges: [['rates', 'mort'], ['mort', 'demand'], ['wages', 'demand'], ['migr', 'demand'], ['migr', 'rents'], ['demand', 'price'], ['rents', 'price'], ['price', 'build'], ['build', 'supply'], ['supply', 'price'], ['rates', 'build']],
  },
  org: {
    label: 'Org chart',
    tree: true,
    nodes: 'people',
    links: 'reports',
    directed: true,
    rows: [['ceo', 'CEO'], ['cto', 'CTO'], ['cfo', 'CFO'], ['coo', 'COO'], ['eng', 'Engineering'], ['data', 'Data'], ['fin', 'Finance'], ['ops', 'Ops'], ['sup', 'Support']],
    edges: [['ceo', 'cto'], ['ceo', 'cfo'], ['ceo', 'coo'], ['cto', 'eng'], ['cto', 'data'], ['cfo', 'fin'], ['coo', 'ops'], ['coo', 'sup']],
  },
  mind: {
    label: 'Mind map',
    tree: true,
    nodes: 'ideas',
    links: 'branches',
    directed: true,
    rows: [['trip', 'Trip'], ['travel', 'Travel'], ['stay', 'Stay'], ['budget', 'Budget'], ['acts', 'Activities'], ['flights', 'Flights'], ['train', 'Train'], ['hotel', 'Hotel'], ['friends', 'Friends'], ['hike', 'Hiking'], ['museum', 'Museums'], ['cap', 'Daily cap']],
    edges: [['trip', 'travel'], ['trip', 'stay'], ['trip', 'acts'], ['trip', 'budget'], ['travel', 'flights'], ['travel', 'train'], ['stay', 'hotel'], ['stay', 'friends'], ['acts', 'hike'], ['acts', 'museum'], ['budget', 'cap']],
  },
  concept: {
    label: 'Concept map (no direction)',
    tree: false,
    nodes: 'concepts',
    links: 'relations',
    directed: false,
    rows: [['energy', 'Energy'], ['coal', 'Coal'], ['solar', 'Solar'], ['emis', 'Emissions'], ['co2', 'CO₂'], ['forest', 'Forests'], ['temp', 'Temperature'], ['ice', 'Ice melt'], ['sea', 'Sea level'], ['albedo', 'Albedo'], ['ocean', 'Oceans'], ['policy', 'Policy']],
    edges: [['energy', 'coal'], ['energy', 'solar'], ['coal', 'emis'], ['emis', 'co2'], ['forest', 'co2'], ['co2', 'temp'], ['temp', 'ice'], ['ice', 'albedo'], ['albedo', 'temp'], ['ice', 'sea'], ['temp', 'ocean'], ['ocean', 'co2'], ['policy', 'energy'], ['policy', 'forest']],
  },
};

const LAYOUTS = {
  layered: { label: 'layered', directions: ['down', 'right', 'up', 'left'] },
  tree: { label: 'tree', directions: ['down', 'right', 'up', 'left', 'radial'] },
  force: { label: 'force', directions: [] as string[] },
} as const;
type LayoutKey = keyof typeof LAYOUTS;

const CURVES = ['line', 'orthogonal', 'bezier', 'step', 'arc'] as const;

/** The side a link leaves by, and the side it arrives at, when its ends follow the flow. */
const FLOW_SIDES: Record<string, [string, string]> = {
  down: ['bottom', 'top'],
  up: ['top', 'bottom'],
  right: ['right', 'left'],
  left: ['left', 'right'],
};

/** Each layout's options: small gaps, so every diagram fits a docs-sized chart. */
const LAYOUT_CALL: Record<string, (direction: string, place: string) => string> = {
  layered: (d, p) => {
    const across = d === 'right' || d === 'left';
    return `layout.network.layered({ direction: "${d}", gap: ${across ? 14 : 16}, rankGap: ${across ? 24 : 28}, place: "${p}" })`;
  },
  tree: (d, p) => {
    if (d === 'radial') return `layout.network.tree({ direction: "radial", gap: 6, rankGap: 4, place: "${p}" })`;
    const across = d === 'right' || d === 'left';
    return `layout.network.tree({ direction: "${d}", gap: ${across ? 6 : 10}, rankGap: 28, place: "${p}" })`;
  },
  force: (_d, p) => `layout.network.force({ length: 80, place: "${p}" })`,
};

/**
 * Each diagram's drawn size in px, measured: [down, right, radial]. `up` and
 * `left` mirror `down` and `right`. Force stays inside the plot by itself.
 */
const DRAWN: Record<string, { down: [number, number]; right: [number, number]; radial: [number, number] }> = {
  causal: { down: [249, 440], right: [543, 183], radial: [442, 534] },
  loan: { down: [148, 368], right: [505, 90], radial: [476, 337] },
  org: { down: [405, 170], right: [257, 246], radial: [388, 367] },
  mind: { down: [549, 170], right: [256, 350], radial: [360, 324] },
  concept: { down: [200, 518], right: [715, 125], radial: [782, 642] },
};
const TREE_DRAWN: Record<string, { down: [number, number]; right: [number, number] }> = {
  causal: { down: [326, 290], right: [372, 210] },
  loan: { down: [251, 236], right: [349, 137] },
  org: { down: [525, 170], right: [265, 236] },
  mind: { down: [651, 170], right: [264, 335] },
  concept: { down: [335, 386], right: [548, 209] },
};

/** A chart big enough for the drawing, and never smaller than a usual docs chart. */
function sizeOf(sample: string, layout: LayoutKey, direction: string): [number, number] {
  if (layout === 'force') return [520, 420];
  const across = direction === 'right' || direction === 'left';
  const drawn = direction === 'radial'
    ? DRAWN[sample].radial
    : (layout === 'tree' ? TREE_DRAWN : DRAWN)[sample][across ? 'right' : 'down'];
  const pad = direction === "radial" ? 140 : 96;
  return [Math.max(480, Math.ceil((drawn[0] + pad) / 20) * 20), Math.max(320, Math.ceil((drawn[1] + pad) / 20) * 20)];
}

type State = { sample: string; layout: LayoutKey; direction: string; curve: string; flow: boolean; place: 'new' | 'all' };

function codeFor(s: State): string {
  const g = SAMPLES[s.sample];
  const [width, height] = sizeOf(s.sample, s.layout, s.direction);
  const sides = s.flow && FLOW_SIDES[s.direction] && s.layout !== 'force'
    ? `, sourceSide: "${FLOW_SIDES[s.direction][0]}", targetSide: "${FLOW_SIDES[s.direction][1]}"`
    : '';
  const arrow = g.directed ? ', arrow: true' : '';
  // An arc bows only to part two links between one pair unless given a curvature.
  const bow = s.curve === 'arc' ? ', curvature: 0.2' : '';
  const rows = g.rows.map(([id, label]) => `      { id: "${id}", label: "${label}" },`).join('\n');
  const links = g.edges.map(([a, b]) => `      { source: "${a}", target: "${b}" },`).join('\n');
  return `const chart = Elicit({
  width: ${width}, height: ${height},
  margins: { top: 12, right: 12, bottom: 12, left: 12 },
  axes: false,
  schema: {
    structure: "network",
    tables: {
      ${g.nodes}: {
        role: "nodes",
        fields: {
          id: { type: "categorical", key: true, open: true },
          label: { type: "categorical", open: true },
          x: { type: "quantitative", domain: [0, 100] },
          y: { type: "quantitative", domain: [0, 100] },
        },
      },
      ${g.links}: {
        role: "links",
        directed: ${g.directed},
        fields: {
          source: { type: "ref" },
          target: { type: "ref" },
        },
      },
    },
  },
  // No node has a position: the layout places them all.
  data: {
    ${g.nodes}: [
${rows}
    ],
    ${g.links}: [
${links}
    ],
  },
  layout: [
    ${LAYOUT_CALL[s.layout](s.direction, s.place)},
  ],
  marks: [
    link({ curve: "${s.curve}"${bow}${sides}${arrow}, stroke: "#5A6B7D" }),
    sticker({
      fill: "#ECF3F9",
      stroke: "#1D4467",
      radius: 7,
      maxWidth: 100,
      channels: {
        x: { field: "x", edit: move({ channels: ["x", "y"], mode: "relative" }) },
        y: { field: "y" },
        text: { field: "label" },
      },
    }),
  ],
});
mount(chart.dom());
`;
}

/** One row of choices, as a group of toggle buttons. */
function Choice<T extends string>({ label, value, options, onChange, disabled }: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="lx-row" role="group" aria-label={label}>
      <span className="lx-label">{label}</span>
      <div className="lx-options">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`lx-option${o.value === value ? ' active' : ''}`}
            aria-pressed={o.value === value}
            disabled={disabled}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LayoutExplorer() {
  const [s, setS] = useState<State>({ sample: 'loan', layout: 'layered', direction: 'right', curve: 'orthogonal', flow: true, place: 'all' });
  const set = (patch: Partial<State>) => setS((prev) => {
    const next = { ...prev, ...patch };
    const dirs = LAYOUTS[next.layout].directions as readonly string[];
    if (dirs.length && !dirs.includes(next.direction)) next.direction = dirs[0];
    return next;
  });
  const code = useMemo(() => codeFor(s), [s]);
  const dirs = LAYOUTS[s.layout].directions as readonly string[];
  const flowOff = s.layout === 'force' || s.direction === 'radial';

  return (
    <div className="lx">
      <div className="lx-controls">
        <Choice
          label="Diagram"
          value={s.sample}
          options={Object.entries(SAMPLES).map(([value, g]) => ({ value, label: g.label }))}
          onChange={(sample) => set({ sample })}
        />
        <Choice
          label="Layout"
          value={s.layout}
          options={(Object.keys(LAYOUTS) as LayoutKey[]).map((value) => ({ value, label: LAYOUTS[value].label }))}
          onChange={(layout) => set({ layout })}
        />
        <Choice
          label="Direction"
          value={dirs.length ? s.direction : 'none'}
          options={dirs.length ? dirs.map((d) => ({ value: d, label: d })) : [{ value: 'none', label: 'none' }]}
          onChange={(direction) => set({ direction })}
          disabled={!dirs.length}
        />
        <Choice
          label="Links"
          value={s.curve}
          options={CURVES.map((c) => ({ value: c, label: c }))}
          onChange={(curve) => set({ curve })}
        />
        <Choice
          label="Link ends"
          value={flowOff ? 'free' : s.flow ? 'flow' : 'free'}
          options={[{ value: 'free', label: 'free' }, { value: 'flow', label: 'follow the direction' }]}
          onChange={(v) => set({ flow: v === 'flow' })}
          disabled={flowOff}
        />
        <Choice
          label="Place"
          value={s.place}
          options={[{ value: 'all', label: 'all' }, { value: 'new', label: 'new' }]}
          onChange={(place) => set({ place })}
        />
      </div>
      {s.layout === 'tree' && !SAMPLES[s.sample].tree ? (
        <p className="lx-note">
          This diagram is not a tree, so <code className="inline">tree</code> lays out one path to each node and
          leaves the other links out of the layout. It logs a warning saying so.
        </p>
      ) : null}
      <ExampleLive
        key={code}
        code={code}
        meta={{
          title: 'Layout and link explorer',
          blurb: 'Pick a diagram, a layout and a link shape. The code is the spec for the chart you see.',
          try: (
            <>
              <b>Drag</b> a node and let go. With <code className="inline">place: &quot;all&quot;</code> the layout puts
              it back in order, and a node dropped past a sibling swaps with it. With{' '}
              <code className="inline">&quot;new&quot;</code> it stays where you drop it.
            </>
          ),
        }}
        tall
      />
    </div>
  );
}
