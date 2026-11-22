import type { ApiEntry } from '../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "Built-in layouts",
    json: ['layout.contain', 'layout.dodge', 'layout.row', 'layout.column', 'layout.grid', 'layout.pack'],
    summary: (
      <>
        Import from <code className="inline">elicit.layout</code> and pass in the{" "}
        <code className="inline">Elicit</code> spec&rsquo;s{" "}
        <code className="inline">layout: [...]</code>. Each rule settles mark boxes in
        pixel space and writes the resulting positions and sizes back to the dataset.
      </>
    ),
    signatures: [
      "layout.contain({ where?, padding?, fit?, table? }) → Layout",
      "layout.dodge({ gap?, where?, in?, table? }) → Layout",
      "layout.row({ gap?, in?, table? }) → Layout",
      "layout.column({ gap?, in?, table? }) → Layout",
      "layout.grid({ columns?, gap?, in?, table? }) → Layout",
      "layout.pack({ gap?, keep?, in?, table? }) → Layout",
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
        name: "dodge.where",
        type: "(d, i, rows) => boolean",
        default: "all rows",
        desc: <>Picks which rows take part in dodging.</>,
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
        name: "table",
        type: "string",
        default: "nodes (hierarchy) or primary table",
        desc: <>Table name or role the layout settles in a multi-table schema.</>,
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
      "layout.custom(({ boxes, rows, tree, width, height, scales, padding, locked, anchors, spacing, preview }) => void, { table? }) → Layout",
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
    ],
  },
];
