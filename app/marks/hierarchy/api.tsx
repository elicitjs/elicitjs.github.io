import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: 'structure: "hierarchy"',
    summary: (
      <>
        Three tables: <code className="inline">nodes</code>,{" "}
        <code className="inline">nesting</code> and an optional{" "}
        <code className="inline">links</code>. One nesting row says one node is inside
        another.
      </>
    ),
    signatures: [
      'schema: { structure: "hierarchy", tables: { nodes, nesting, links? } }',
    ],
    options: [
      {
        name: "nodes",
        type: "table",
        default: "required",
        desc: (
          <>
            One row per node. Needs a <code className="inline">key: true</code> column.
            Named anything with <code className="inline">role: "nodes"</code>.
          </>
        ),
      },
      {
        name: "nesting",
        type: "table",
        default: "required",
        desc: (
          <>
            A field map like any other table, named anything with{" "}
            <code className="inline">role: "nesting"</code>. Its first two{" "}
            <code className="inline">ref</code> columns are the contained node, then its
            container. A node has at most one container. Further columns take a{" "}
            <code className="inline">type</code>, <code className="inline">domain</code> and{" "}
            <code className="inline">default</code> as usual.
          </>
        ),
      },
      {
        name: "links",
        type: "table",
        default: "none",
        desc: (
          <>
            As in a <a href="/marks/network">network</a>:{" "}
            <code className="inline">link()</code> draws it and{" "}
            <code className="inline">edit.network.*</code> edits it.
          </>
        ),
      },
    ],
  },
  {
    name: "constraints.contain(options)",
    json: ['constraints.contain'],
    summary: (
      <>
        Pure-data membership rule over a hierarchy&rsquo;s{" "}
        <code className="inline">nesting</code> table. Gates drops and{" "}
        <code className="inline">setData</code>.
      </>
    ),
    signatures: [
      "constraints.contain({ parent?, child?, maxDepth?, maxChildren? }) → Constraint",
    ],
    options: [
      {
        name: "parent",
        type: "(d, i, rows) => boolean",
        default: "any node",
        desc: <>Which rows of the nodes table may hold other nodes.</>,
      },
      {
        name: "child",
        type: "(d, i, rows) => boolean",
        default: "any node",
        desc: <>Which rows of the nodes table may sit inside a container.</>,
      },
      {
        name: "maxDepth",
        type: "number",
        default: "∞",
        desc: <>Maximum nesting depth (top-level nodes are depth 0).</>,
      },
      {
        name: "maxChildren",
        type: "number",
        default: "∞",
        desc: <>Maximum direct children per container.</>,
      },
    ],
  },
  {
    name: "mark.contains",
    json: ['contains'],
    summary: (
      <>
        Shorthand option on any shape mark in a hierarchy. Scopes container eligibility
        to rows boxed by that mark and configures their{" "}
        <code className="inline">padding</code> and <code className="inline">fit</code>.
        Equivalent to <code className="inline">constraints.contain</code> plus{" "}
        <code className="inline">layout.contain</code> for that mark.
      </>
    ),
    signatures: [
      "contains: true | ((d, i, rows) => boolean) | { where?, padding?, fit? }",
    ],
    options: [
      {
        name: "where",
        type: "(d, i, rows) => boolean",
        default: "every row the mark boxes",
        desc: <>Predicate picking which of the mark&rsquo;s rows can hold other nodes.</>,
      },
      {
        name: "padding",
        type: "number | { top, right, bottom, left }",
        default: "10",
        desc: (
          <>
            Room in px between a container&rsquo;s edge and its contents.
          </>
        ),
      },
      {
        name: "fit",
        type: "boolean | 'x' | 'y'",
        default: "false",
        desc: (
          <>
            Size the container to enclose its contents on both axes (
            <code className="inline">true</code>), width only (
            <code className="inline">"x"</code>), height only (
            <code className="inline">"y"</code>), or keep its given size (
            <code className="inline">false</code>).
          </>
        ),
      },
    ],
  },
  {
    name: "edit.hierarchy.nest(options)",
    json: ['edit.hierarchy.nest'],
    summary: (
      <>
        Drop a node into the container under the pointer, or out of one. Put it on the
        mark you drag, beside a <code className="inline">move</code>.
      </>
    ),
    signatures: ["edit.hierarchy.nest({ defaults, when }) → Edit"],
    options: [
      {
        name: "defaults",
        type: "object",
        default: "{}",
        desc: <>Values for any further columns of the nesting row it writes.</>,
      },
    ],
  },
];
