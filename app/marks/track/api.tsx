import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "track(options)",
    json: ['plot.track'],
    summary: (
      <>
        A value drawn as a length along a route. The route is the <code className="inline">path</code> option, and the <code className="inline">length</code> channel is the fraction of it drawn. Each row draws its route as an invisible grab area, then its bar.
      </>
    ),
    signatures: [
      "track({ path, join, channels, edits, id, table, tip }) → Mark",
    ],
    options: [
      {
        name: "path",
        type: "string | (d, i, data) => string",
        default: "—",
        desc: (
          <>
            The route: an SVG path, or a function of the row returning one. Each <code className="inline">M</code> starts a lane, and only lanes hold value. In plot pixels, or in unit form when <code className="inline">x</code>, <code className="inline">y</code> or <code className="inline">size</code> is bound. A path that can&rsquo;t be read draws nothing and logs a warning.
          </>
        ),
      },
      {
        name: "join",
        type: "'round' | 'straight' | 'none'",
        default: "'none'",
        desc: (
          <>
            What connects one lane to the next. It holds no value. <code className="inline">&apos;round&apos;</code> leaves along one lane and arrives along the next.
          </>
        ),
      },
      {
        name: "channels",
        type: "object",
        default: "{}",
        desc: (
          <>
            Channel map — see <b>Channels</b>.
          </>
        ),
      },
      {
        name: "edits",
        type: "Edit[]",
        default: "—",
        desc: (
          <>
            Mark-level edits. <code className="inline">move()</code> on <code className="inline">length</code> drags the end of the bar along the route; <code className="inline">slide()</code> adds to it along one axis.
          </>
        ),
      },
      {
        name: "stroke, strokeWidth, opacity, …",
        type: "style",
        default: "stroke: theme ink, strokeWidth: 2",
        desc: "Shorthands for constant channels. The bar is a stroke and is never filled.",
      },
    ],
    channels: [
      {
        name: "length",
        type: "linear",
        desc: (
          <>
            How much of the route is drawn. Its range is <code className="inline">[0, 1]</code>, so the schema&rsquo;s domain spans the whole route. Omitted, the whole route is drawn. Pair with <code className="inline">move()</code>.
          </>
        ),
      },
      {
        name: "x / y",
        type: "linear | point",
        desc: (
          <>
            Where a unit-form path is centred. Binding either one places the path.
          </>
        ),
      },
      {
        name: "size",
        type: "linear",
        desc: (
          <>
            The radius of the box a unit-form path fits, in px (default 6).
          </>
        ),
      },
      {
        name: "angle",
        type: "linear",
        desc: "Rotation of a unit-form path in degrees, counter-clockwise from east.",
      },
      {
        name: "stroke / strokeWidth / strokeDash / opacity",
        type: "const | field",
        desc: "The bar's paint.",
      },
    ],
  },
];
