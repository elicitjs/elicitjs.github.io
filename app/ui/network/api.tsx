import type { ApiEntry } from '../../../lib/types';

export const api: ApiEntry[] = [
  {
    name: "ui.network(options?)",
    json: false,
    summary: (
      <>
        The UI a node-link chart needs, built from the edits its spec names. It works on a dataset with <code className="inline">structure: "network"</code>; any other logs a warning.
      </>
    ),
    signatures: [
      "ui.attach(chart, [ui.network()])",
      "ui.network({ links: false, menu: { channel: \"stroke\" } })",
      "ui.network({ edits: { unlink: \"cut\" } })",
    ],
    options: [
      { name: "ports", type: "boolean", default: "true", desc: "Icons beside a port: + adds a node on that side, linked from this one; the link icon connects to a node already there; detach shows where a link is docked." },
      { name: "links", type: "boolean", default: "true", desc: "Icons beside a link, where the pointer meets it: reverse, + to put a new node on it there, and remove." },
      { name: "menu", type: "boolean | { channel }", default: "true", desc: <>The right-click menu. <code className="inline">channel</code> names the node channel its categories come from; the default is a categorical <code className="inline">fill</code>.</> },
      { name: "resize", type: "boolean", default: "true", desc: <>Grips on a node mark that binds <code className="inline">width</code> or <code className="inline">height</code> to a field.</> },
      { name: "edits", type: "{ connect?, rewire?, reverse?, unlink?, remove?, create? }", default: "found by what each edit does", desc: <>The edit behind each action, by <code className="inline">name</code>. <code className="inline">unlink</code> removes a link, <code className="inline">remove</code> a node and <code className="inline">create</code> adds a node.</> },
    ],
  },
];
