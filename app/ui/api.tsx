import type { ApiEntry } from '../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "ui.attach(chart, parts)",
    json: false,
    summary: (
      <>
        Lay parts over a chart. The layer is one HTML element over the chart&rsquo;s drawing, added once the chart has drawn. Parts act through <a href="/editing/external-controls">external control</a>, so the spec stays the statement of what can change.
      </>
    ),
    signatures: [
      "const layer = ui.attach(chart, [ui.contextMenu(), ui.handles()]);",
      "layer.detach();",
    ],
    options: [
      { name: "chart", type: "Chart", default: "—", desc: <>What <code className="inline">Elicit(spec)</code> or <code className="inline">dataset.chart(spec)</code> returns.</> },
      { name: "parts", type: "UiPart | UiPart[]", default: "—", desc: "The parts to mount. Nested arrays are flattened." },
    ],
    returns: (
      <>
        <code className="inline">{'{ detach() }'}</code>. <code className="inline">chart.destroy()</code> detaches the layer too.
      </>
    ),
  },
  {
    name: "ui.contextMenu(options?)",
    json: false,
    summary: (
      <>
        A menu on right-click, over a mark or over empty space. With no <code className="inline">items</code>, it offers what the spec&rsquo;s named edits allow: add on empty space, a declared value edit&rsquo;s choices and remove on a row.
      </>
    ),
    signatures: [
      "ui.contextMenu({ items: [{ edit: \"add\" }, { channel: \"fill\" }, { separator: true }, { edit: \"delete\" }] })",
      "ui.contextMenu({ items: ({ view, point }) => [ … ] })",
    ],
    options: [
      { name: "items", type: "MenuEntry[] | (target) => MenuEntry[]", default: "from the named edits", desc: <>The entries, or a function of what was right-clicked: <code className="inline">{'{ view, point }'}</code>, where <code className="inline">view</code> is <code className="inline">null</code> over empty space.</> },
      { name: "entry.edit", type: "string", default: "—", desc: "The name of a declared edit. Fires on the row under the pointer, or at the pointer for an edit that adds a row." },
      { name: "entry.channel", type: "string", default: "—", desc: <>A channel of the mark: one row per value, the current one checked. With <code className="inline">edit</code> naming an edit that adds a row, each value adds a row with that value.</> },
      { name: "entry.mark", type: "string", default: "the mark under the pointer", desc: <>The <code className="inline">id</code> of the mark the channel is on.</> },
      { name: "entry.values", type: "any[]", default: "the scale's domain", desc: "The choices, for a channel whose scale lists none." },
      { name: "entry.label", type: "string | false", default: "by kind", desc: <>The row&rsquo;s text, or the heading over a channel&rsquo;s values. <code className="inline">false</code> drops the heading.</> },
      { name: "entry.icon · entry.tone", type: "icon · \"danger\"", default: "by kind", desc: "An icon before the label; the removing colour." },
      { name: "entry.on", type: "\"plane\" | mark id", default: "where it applies", desc: "Show the entry only over empty space, or only on one mark." },
      { name: "entry.onSelect", type: "(target) => void", default: "—", desc: <>A row of your own, with <code className="inline">label</code>.</> },
      { name: "entry.separator · entry.heading", type: "true · string", default: "—", desc: "A rule between groups; a caption over the rows that follow." },
    ],
  },
  {
    name: "ui.actions(options?)",
    json: false,
    summary: (
      <>
        Icon buttons beside the drawn piece the pointer is near. An item drives a named edit, or runs your own function.
      </>
    ),
    signatures: [
      "ui.actions({ on: { mark: \"note\" }, items: [{ edit: \"delete\", icon: \"trash\", label: \"Remove\", tone: \"danger\" }] })",
    ],
    options: [
      { name: "on", type: "{ mark?, table?, channel?, side? }", default: "every row's pieces", desc: "Which drawn pieces get the icons." },
      { name: "items", type: "ActionItem[]", default: "[]", desc: <>Each has <code className="inline">icon</code> and <code className="inline">label</code>, then <code className="inline">edit</code> (a named edit) or <code className="inline">onClick(view)</code>. <code className="inline">show(view)</code> leaves an icon out for some pieces; <code className="inline">tone: "danger"</code> marks one that removes.</> },
      { name: "reach", type: "number", default: "24", desc: "How near the pointer must come, in pixels." },
      { name: "placement", type: "\"top-right\" | \"top\" | \"right\" | …", default: "\"top-right\"", desc: "The side or corner of the piece the icons sit on." },
    ],
    returns: (
      <>
        An item whose edit can&rsquo;t run on that row (another stage, a locked row) is left out.
      </>
    ),
  },
  {
    name: "ui.handles(options?)",
    json: false,
    summary: (
      <>
        Grips that resize a mark&rsquo;s box along the sides it sizes from data. A grip moves its own side and holds the opposite one still, as one undo step.
      </>
    ),
    signatures: [
      "width: { field: \"w\", scale: { range: [70, 260] } }   // on the mark",
      "ui.handles({ on: { mark: \"note\" } })",
    ],
    options: [
      { name: "on", type: "{ mark? }", default: "the first mark that sizes from data", desc: <>The mark to put grips on, by <code className="inline">id</code>.</> },
      { name: "resize", type: "boolean", default: "true", desc: <>Grips on the left and right where the mark binds <code className="inline">width</code>, on the top and bottom where it binds <code className="inline">height</code>.</> },
    ],
    returns: (
      <>
        Where a row already has a handle in the middle of a side (a port), the grip sits at the corner after it.
      </>
    ),
  },
  {
    name: "ui.custom(mount)",
    json: false,
    summary: (
      <>
        A part of your own. <code className="inline">mount(ctx)</code> builds it in the layer and may return a function that takes it down.
      </>
    ),
    signatures: [
      "ui.custom((ctx) => { … return () => { … }; })",
    ],
    options: [
      { name: "ctx.chart", type: "Chart", default: "—", desc: "The chart the layer is over." },
      { name: "ctx.layer", type: "HTMLElement", default: "—", desc: "The layer. It ignores the pointer; a control you add opts in with its own pointer-events." },
      { name: "ctx.place(el, anchor, placement?)", type: "→ () => void", default: "—", desc: <>Keep <code className="inline">el</code> on an anchor: a point in plot pixels, a scene view, or a function read on each render. <code className="inline">placement</code> is <code className="inline">{'{ at, offset, dx, dy }'}</code>, or a function returning one. An anchor of <code className="inline">null</code> hides the element. Returns its removal.</> },
      { name: "ctx.refresh()", type: "void", default: "—", desc: "Re-place every element now, after you change what one is anchored to." },
      { name: "ctx.button(options)", type: "→ HTMLButtonElement", default: "—", desc: <>An icon button: <code className="inline">{'{ icon, label, tone, onClick }'}</code>. <code className="inline">label</code> is its accessible name.</> },
      { name: "ctx.menu(items, at)", type: "→ { element, close() }", default: "—", desc: <>Open a menu at a point in plot pixels. Rows are <code className="inline">{'{ label, icon, swatch, checked, disabled, tone, onSelect }'}</code>, <code className="inline">{'{ separator: true }'}</code> or <code className="inline">{'{ heading }'}</code>.</> },
      { name: "ctx.icon(icon)", type: "→ Element", default: "—", desc: "An icon element from a name, SVG markup or an element." },
      { name: "ctx.onRender(cb)", type: "→ () => void", default: "—", desc: "Run after each frame the chart draws." },
      { name: "ctx.onPointer(cb)", type: "→ () => void", default: "—", desc: <>The pointer over the chart: <code className="inline">{'{ type, point, event }'}</code>. <code className="inline">type</code> is <code className="inline">"move"</code> (once per frame), <code className="inline">"leave"</code> or <code className="inline">"menu"</code> (a right-click; call <code className="inline">event.preventDefault()</code> to take it). <code className="inline">point</code> is in plot pixels.</> },
      { name: "ctx.drag(el, handlers)", type: "→ () => void", default: "—", desc: <>Make a layer element a drag source: <code className="inline">start</code>, <code className="inline">move</code>, <code className="inline">end</code>, <code className="inline">cancel</code> (Escape) and <code className="inline">click</code> (a press that never moved). Each step carries <code className="inline">{'{ point, dx, dy, event }'}</code>.</> },
      { name: "ctx.capture(handlers)", type: "→ () => void", default: "—", desc: <>Take the chart&rsquo;s next press for the layer: <code className="inline">move</code>, <code className="inline">press</code>, <code className="inline">cancel</code>. Until you call the returned function, the chart&rsquo;s own gestures stay out.</> },
    ],
  },
  {
    name: "theme.ui · authoring.registerIcon(name, path)",
    json: false,
    summary: (
      <>
        The layer&rsquo;s tokens, and a way to add an icon name. The tokens are set on the layer as CSS variables named <code className="inline">--elicit-ui-*</code>.
      </>
    ),
    signatures: [
      "theme: { ui: { accent: \"#7c3aed\", size: 26 } }",
      "authoring.registerIcon(\"star\", \"M8 2l1.8 3.9 4.2.5-3.1 2.9.8 4.2L8 11.4l-3.7 2.1.8-4.2L2 6.4l4.2-.5z\")",
    ],
    options: [
      { name: "surface · ink · muted · border", type: "colour", default: "#ffffff · #1f2937 · #6b7280 · #d5dbe5", desc: "A menu's and a button's background; labels and icons; a heading or an unavailable row; edges." },
      { name: "accent · danger", type: "colour", default: "#2563eb · #dc2626", desc: "Hover, focus and the active icon; an action that removes." },
      { name: "shadow", type: "colour", default: "rgba(15, 23, 42, 0.18)", desc: "Under a menu and a button." },
      { name: "radius · size · gap · fontSize", type: "px", default: "8 · 22 · 6 · 12", desc: "A menu's corner; an icon button's side; the space between a mark and its icons; a menu's text." },
    ],
  },
];
