import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "set(field, value, options?)",
    json: false,
    summary: (
      <>
        A dataset method, carried by every chart: write one cell from outside any chart. It runs the dataset&rsquo;s constraints, then the lock, as an edit does; an edit&rsquo;s own <code className="inline">constrain</code> does not run. One undo step; fires <code className="inline">change</code> and redraws every chart on the dataset. See <a href="/dataset#set">Datasets &amp; linked charts</a>.
      </>
    ),
    signatures: [
      "chart.set(\"n\", 62)                   // row 0 of the primary table",
      "chart.set(\"n\", \"62\", { index: 2 })   // stored as the number 62",
      "ds.set(\"weight\", 3, { index: 0, table: \"links\" })",
    ],
    returns: (
      <>
        <code className="inline">true</code> when it commits. <code className="inline">false</code> when a constraint rejects it, the row is locked or the value is unchanged, and, with a warning, for an undeclared field, an index out of range or a value the field&rsquo;s type can&rsquo;t hold. Writes rows that exist; to add one, replay a <code className="inline">create</code> gesture with <code className="inline">chart.emit</code>, or call <code className="inline">setData</code>.
      </>
    ),
  },
  {
    name: "edit({ name }) · chart.control(name, target?)",
    json: false,
    summary: (
      <>
        Give any edit a <code className="inline">name</code>, then replay its gesture from outside the chart with{' '}
        <code className="inline">chart.control(name)</code>. The control synthesizes the same events a pointer
        does on that chart and feeds them to the one dispatch — so constraints, the edit&rsquo;s own{' '}
        <code className="inline">constrain</code>, undo, guides, and{' '}
        <code className="inline">on("change")</code> all run. A new input <em>source</em>, not a second
        interaction system.
      </>
    ),
    signatures: [
      "move({ name: \"move\", channels: [\"x\", \"y\"] })   // name an edit",
      "const h = chart.control(\"move\", 0);   // handle bound to the edit + datum 0",
      "h.set(value)          // one-shot write (value edit) …",
      "h.set({ x, y })       // … or a data value per channel (positional edit)",
      "h.begin(); h.set(v); h.end();   // live drag → ONE undo entry",
      "h.fire()              // TRIGGER edit (cycle/remove/toggle) — fires its click gesture",
      "h.emit(event)         // raw event to this edit alone, on this row's node",
      "h.cancel()            // abandon an open stroke",
      "chart.control(\"link\", { index: 0, channel: \"port\", side: \"right\" })   // one handle of a row",
      "h.accepts()           // what the channel's scale allows",
    ],
    options: [
      {
        name: "edit.name",
        type: "string",
        default: "null",
        desc: "The handle this edit answers to. An edit with no name stays pointer- and keyboard-driven.",
      },
      {
        name: "control(name, target?)",
        type: "→ EditControl",
        default: "target: 0",
        desc: (
          <>
            A handle bound to that edit and that row. <code className="inline">target</code> is a row index, or <code className="inline">{'{ index, channel, side }'}</code> to name one of the row&rsquo;s handles: a port&rsquo;s side, a link&rsquo;s <code className="inline">"source"</code> or <code className="inline">"target"</code> end. The edit&rsquo;s <code className="inline">when</code> is not asked. Ask for the handle again after the data changes; it resolves the edit on each call.
          </>
        ),
      },
      {
        name: "h.set(value)",
        type: "void",
        default: "—",
        desc: (
          <>
            Write a <b>data</b> value. A scalar for a single-channel edit, or a map keyed by channel or field for a multi-channel one. Untouched axes hold their current position rather than teleporting. Drives a direct edit, or a <code className="inline">nearest</code> or <code className="inline">sweep</code> pick on the control's row. Other plane edits log a warning; use <code className="inline">chart.emit</code> for them.
          </>
        ),
      },
      {
        name: "h.begin() / h.end()",
        type: "void",
        default: "—",
        desc: (
          <>
            Bracket a live drag, so many <code className="inline">set</code> ticks collapse into one <a href="/editing/history">undo</a> entry — exactly as a pointer drag does. <code className="inline">end()</code> releases where the stroke&rsquo;s pointer last was, so a connect or a rewire lands there. <code className="inline">begin({'{ x, y }'})</code> presses at that plot pixel in place of the row&rsquo;s own.
          </>
        ),
      },
      {
        name: "h.cancel()",
        type: "void",
        default: "—",
        desc: (
          <>
            Abandon the stroke <code className="inline">begin()</code> opened, with no release. An edit that commits on release writes nothing; what earlier ticks wrote stays, as one undo entry.
          </>
        ),
      },
      {
        name: "h.fire()",
        type: "void",
        default: "—",
        desc: (
          <>
            Trigger an edit that takes no value — <code className="inline">cycle</code>, <code className="inline">remove</code>, <code className="inline">toggle</code>. It dispatches the edit&rsquo;s own gesture on the row.
          </>
        ),
      },
      {
        name: "h.accepts()",
        type: "→ object | null",
        default: "—",
        desc: (
          <>
            What the channel&rsquo;s scale allows: <code className="inline">{'{ field, type, kind, temporal, invertible, domain, values, range }'}</code>. <code className="inline">values</code> is the accepted set on a discrete channel and <code className="inline">null</code> on a continuous one, where <code className="inline">domain</code> is the accepted range — so a picker or slider can offer only valid choices.
          </>
        ),
      },
      {
        name: "h.emit(event)",
        type: "void",
        default: "—",
        desc: "A raw event to this edit alone, on its node for the row. A plane edit takes it at the event's x and y. The low-level route when you already hold pixels.",
      },
    ],
    returns: (
      <>
        Every route runs the ordinary dispatch, so a constraint gates an external write exactly as it gates a drag. External control is not a bypass.
      </>
    ),
  },
  {
    name: "chart.transaction()",
    json: false,
    summary: (
      <>
        A dataset method, carried by every chart: hold one undo entry open across any number of writes. Everything committed until you call the returned function undoes as one step. <code className="inline">change</code> still fires per write.
      </>
    ),
    signatures: [
      "const end = chart.transaction();",
      "chart.set(\"w\", 140, { index: 0 }); chart.set(\"x\", 30, { index: 0 });",
      "end();",
    ],
    returns: (
      <>
        The closer. Undo, redo and <code className="inline">setData</code> close an open transaction; calling the closer twice does nothing.
      </>
    ),
  },
  {
    name: "chart.scene · hit · scale · edits · metrics",
    json: false,
    summary: (
      <>
        Read the drawn chart, for UI placed over it. Every value is a copy of the current frame; read again on <code className="inline">on("render")</code>. Pixels are plot pixels.
      </>
    ),
    signatures: [
      "chart.scene({ mark: \"note\", index: 2 })   // the row's drawn pieces",
      "chart.hit({ x, y }, { reach: 12 })       // the piece at, or nearest, a point",
      "chart.scale(\"x\", { mark: \"note\" }).invert(px)",
      "chart.edits({ mark: \"note\", index: 2 })   // the edits that row answers to",
      "chart.metrics()                          // { width, height, margins, innerWidth, innerHeight, scale }",
      "chart.toInner({ x: e.clientX, y: e.clientY })   // page -> plot pixels; toClient is the inverse",
      "chart.on(\"render\", () => { … })           // after every frame",
    ],
    options: [
      { name: "scene(query?)", type: "→ SceneView[]", default: "every piece", desc: (<>One view per drawn piece, in paint order: <code className="inline">{'{ mark, table, index, type, channel, side, box, center, angle, datum, hovered, selected, grabbed, visible, editable, locked }'}</code>. <code className="inline">query</code> is <code className="inline">{'{ mark, table, index, channel, side }'}</code>. <code className="inline">index</code> counts the rows <code className="inline">getData()</code> reports. <code className="inline">visible</code> is <code className="inline">false</code> for a port or a link end the chart is hiding.</>) },
      { name: "hit(point, { reach }?)", type: "→ SceneView | null", default: "reach: 0", desc: "The topmost visible piece at a point, or the nearest within reach pixels." },
      { name: "scale(channel, { mark, index }?)", type: "→ object | null", default: "the chart's shared scale", desc: (<><code className="inline">{'{ channel, field, table, encode, invert, domain, range, kind, temporal, invertible }'}</code>. <code className="inline">invert</code> is <code className="inline">null</code> on a scale that can&rsquo;t be read back. <code className="inline">null</code> when nothing binds a field on the channel.</>) },
      { name: "edits(query?)", type: "→ EditInfo[]", default: "every edit", desc: (<><code className="inline">{'{ name, type, gesture, pick, channels, fields, mark, table, cardinality, available }'}</code>. <code className="inline">available</code> is whether it can run now: its stage is current, the row is unlocked and, on a port, a link could land somewhere.</>) },
      { name: "metrics()", type: "→ object", default: "—", desc: (<>The chart&rsquo;s size and margins in chart pixels. <code className="inline">scale</code> is CSS pixels per chart pixel: 1 unless <code className="inline">responsive: "scale"</code> stretches the drawing.</>) },
      { name: "toInner(point) · toClient(point)", type: "→ { x, y }", default: "—", desc: "Convert between the page's viewport pixels and plot pixels." },
      { name: "on(\"render\", cb) · on(\"destroy\", cb)", type: "→ unsubscribe", default: "—", desc: "After each frame the chart draws; once, when the chart is destroyed." },
      { name: "chart.theme", type: "Theme", default: "—", desc: "A copy of the resolved theme." },
    ],
  },
  {
    name: "set(options?)",
    json: false,
    summary: (
      <>
        The universal value edit: write a value into a channel's field — quantitative, colour,
        categorical, temporal. The <code className="inline">commit</code>-gesture counterpart to the
        positional edits, and what an external picker/slider drives via{' '}
        <code className="inline">control(name).set(value)</code>. (<code className="inline">editText</code>{' '}
        is its text specialization.)
      </>
    ),
    signatures: [
      "fill: { field: \"group\", edit: set({ name: \"category\" }) }",
      "chart.control(\"category\", i).set(\"B\")",
    ],
  },
  {
    name: "select() · chart.select · chart.selectWhere",
    json: false,
    summary: (
      <>
        Selection is transient <em>pipeline</em> state, not a <code className="inline">selected</code> data
        column. Put <code className="inline">edit.select()</code> on a mark to select it by click; drive the
        same state from outside with <code className="inline">chart.select(index)</code> (a specific item) or{' '}
        <code className="inline">chart.selectWhere(field, value)</code> (a category — the first matching row).
        The selected row gets the highlight outline, and a legend picker's{' '}
        <code className="inline">row</code> defaults to it. A <code className="inline">select</code> event
        fires; <code className="inline">on("change")</code>/<code className="inline">getData</code> never do.
      </>
    ),
    signatures: [
      "edits: [ select() ]            // click a mark to select it",
      "chart.select(2)                   // select a SPECIFIC item by index",
      "chart.selectWhere(\"group\", \"North\")  // select by CATEGORY (first match)",
      "chart.getSelection()             // → index | null",
      "chart.clearSelection()           // deselect all",
      "chart.on(\"select\", (i, all) => …)  // selection changed (no data moved)",
    ],
  },
  {
    name: "chart.setDomain(field, domain, options)",
    json: false,
    summary: (
      <>
        Write a field&rsquo;s <b>domain</b> from outside the chart — a zoom button, a reset control. The same commit a wheel zoom, a pan or an axis drag makes: one undo step, a <code className="inline">change</code> notification, and every scale reflows. Pass <code className="inline">null</code> to restore the declared domain. See <a href="/editing/axis#set-domain">Zoom &amp; pan</a>.
      </>
    ),
    signatures: [
      "chart.setDomain(\"x\", [20, 40])            // → true",
      "chart.setDomain(\"x\", null)                // restore the declared domain",
      "chart.setDomain(\"weight\", [0, 5], { table: \"links\" })",
    ],
  },
  {
    name: "chart.emit(event)",
    json: false,
    summary: (
      <>
        Low-level: inject a renderer-shaped gesture event directly. <code className="inline">x</code>/
        <code className="inline">y</code> are inner (margin-subtracted) pixels. Prefer{' '}
        <code className="inline">control</code>, which computes pixels from a data value for you.
      </>
    ),
    signatures: [
      "chart.emit({ type: \"commit\", node, value })",
      "chart.emit({ type: \"dragstart\", node });  chart.emit({ type: \"drag\", node, x, y });  chart.emit({ type: \"dragend\", node })",
    ],
  },
];
