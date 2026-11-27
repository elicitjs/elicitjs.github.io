import type { ApiEntry } from '../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "Built-in layouts",
    json: ['layout.hierarchy.contain', 'layout.dodge', 'layout.row', 'layout.column', 'layout.grid', 'layout.pack', 'layout.tidy'],
    summary: (
      <>
        Import from <code className="inline">elicit.layout</code> and pass in the{" "}
        <code className="inline">Elicit</code> spec&rsquo;s{" "}
        <code className="inline">layout: [...]</code>. Each rule settles mark boxes in
        pixel space and writes the resulting positions and sizes back to the dataset.
      </>
    ),
    signatures: [
      "layout.hierarchy.contain({ padding?, fit?, where? }) → Layout",
      "layout.dodge({ gap?, in?, where?, table? }) → Layout",
      "layout.row({ gap?, in?, where?, table? }) → Layout",
      "layout.column({ gap?, in?, where?, table? }) → Layout",
      "layout.grid({ columns?, gap?, in?, where?, table? }) → Layout",
      "layout.pack({ gap?, keep?, in?, where?, table? }) → Layout",
      "layout.tidy({ snap?, gap?, in?, where?, table? }) → Layout",
    ],
    options: [
      {
        name: "contain.where",
        type: "(d, i, rows) => boolean",
        default: "all containers",
        desc: <>Matches which container rows this padding and fit apply to.</>,
      },
      {
        name: "contain.padding",
        type: "number | { top, right, bottom, left }",
        default: "10",
        desc: <>Room in px between a container&rsquo;s edge and its contents.</>,
      },
      {
        name: "contain.fit",
        type: "boolean | 'x' | 'y'",
        default: "false",
        desc: (
          <>
            Resize containers to enclose their contents on both axes (
            <code className="inline">true</code>), width only (
            <code className="inline">"x"</code>), height only (
            <code className="inline">"y"</code>), or keep their given size (
            <code className="inline">false</code>).
          </>
        ),
      },
      {
        name: "dodge.gap",
        type: "number",
        default: "8",
        desc: <>Minimum space in px kept between overlapping siblings.</>,
      },
      {
        name: "where",
        type: "(d, i, rows) => boolean",
        default: "all rows",
        desc: (
          <>
            Picks the rows the layout acts on: the rows that dodge, take a slot, line up, or
            (on <code className="inline">hierarchy.contain</code>) the containers its padding and
            fit apply to. The others stay where they are.
          </>
        ),
      },
      {
        name: "in",
        type: "'all' | 'roots' | 'containers' | ((parent, i, rows) => boolean)",
        default: "'all' (dodge) / 'containers' (row, column, grid, pack)",
        desc: (
          <>
            Scopes a rule to a level of a hierarchy: top-level roots, every container,
            both, or containers matching a predicate.
          </>
        ),
      },
      {
        name: "gap",
        type: "number",
        default: "8",
        desc: <>Space in px between slots in <code className="inline">row</code>, <code className="inline">column</code>, <code className="inline">grid</code> or <code className="inline">pack</code>.</>,
      },
      {
        name: "grid.columns",
        type: "number",
        default: "as many as fit",
        desc: <>Cells per row in <code className="inline">layout.grid</code>.</>,
      },
      {
        name: "pack.keep",
        type: "'distance' | 'angle'",
        default: "'distance'",
        desc: (
          <>
            How a dropped mark moves in to touch the cluster:{" "}
            <code className="inline">"distance"</code> picks the nearest free spot;{" "}
            <code className="inline">"angle"</code> preserves its direction from the
            cluster&rsquo;s centre.
          </>
        ),
      },
      {
        name: "tidy.snap",
        type: "number",
        default: "16",
        desc: <>Centres this close, in px, share a row or a column.</>,
      },
      {
        name: "tidy.gap",
        type: "number",
        default: "8",
        desc: <>Space in px a mark needs clear of its neighbours to keep its cell.</>,
      },
      {
        name: "table",
        type: "string",
        default: "nodes (hierarchy) or primary table",
        desc: <>Table name or role the layout settles in a multi-table schema. Scoped layouts (<code className="inline">layout.network.*</code>, <code className="inline">layout.hierarchy.*</code>) always settle their structure&rsquo;s nodes table.</>,
      },
    ],
  },
  {
    name: "Network layouts",
    json: ['layout.network.layered', 'layout.network.tree', 'layout.network.force'],
    summary: (
      <>
        Place nodes from their links. Each works on the nodes table of a dataset with a
        links table: a network, or a hierarchy that declares one.
      </>
    ),
    signatures: [
      "layout.network.layered({ direction?, gap?, rankGap?, place?, where? }) → Layout",
      "layout.network.tree({ direction?, gap?, rankGap?, place?, where? }) → Layout",
      "layout.network.force({ length?, gap?, place?, where? }) → Layout",
    ],
    options: [
      {
        name: "direction",
        type: "'down' | 'right' | 'up' | 'left' (tree also 'radial')",
        default: "'down'",
        desc: <>Which way links run (<code className="inline">layered</code>) or the tree grows from its root (<code className="inline">tree</code>).</>,
      },
      {
        name: "gap",
        type: "number",
        default: "24 (layered), 12 (tree), 8 (force)",
        desc: <>Space in px between neighbouring boxes.</>,
      },
      {
        name: "rankGap",
        type: "number",
        default: "48 (layered), 40 (tree)",
        desc: <>Space in px between ranks or depths.</>,
      },
      {
        name: "force.length",
        type: "number",
        default: "100",
        desc: <>Distance in px between the centres of two linked nodes.</>,
      },
      {
        name: "place",
        type: "'new' | 'all'",
        default: "'new'",
        desc: (
          <>
            <code className="inline">"new"</code> positions only rows with no position;{" "}
            <code className="inline">"all"</code> redraws every row when the nodes or links change.
            Locked rows stay put.
          </>
        ),
      },
      {
        name: "where",
        type: "(d, i, rows) => boolean",
        default: "every node",
        desc: <>Picks the nodes the layout places. The others stay where they are.</>,
      },
    ],
  },
  {
    name: "layout.custom(fn, options?)",
    json: ['layout.custom'],
    summary: (
      <>
        Author your own pixel-space layout pass. Runs after built-in layout rules and
        writes any mutated box coordinates back into the dataset.
      </>
    ),
    signatures: [
      "layout.custom(({ boxes, rows, tree, width, height, scales, padding, locked, anchors, spacing, preview }) => void, { table?, where? }) → Layout",
    ],
    options: [
      {
        name: "fn",
        type: "(ctx) => void",
        default: "required",
        desc: (
          <>
            Mutates <code className="inline">box.cx</code>,{" "}
            <code className="inline">box.cy</code>,{" "}
            <code className="inline">box.hw</code> or{" "}
            <code className="inline">box.hh</code> on entries of{" "}
            <code className="inline">ctx.boxes</code> in plot pixels.
          </>
        ),
      },
      {
        name: "table",
        type: "string",
        default: "primary table",
        desc: <>Table name or role to settle.</>,
      },
      {
        name: "where",
        type: "(d, i, rows) => boolean",
        default: "all rows",
        desc: <>The rows <code className="inline">fn</code> may change. Changes to any other row are dropped.</>,
      },
    ],
  },
];
