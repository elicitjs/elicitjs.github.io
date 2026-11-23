/**
 * A drawn pointer that shows a gesture on a live chart, moved by scrolling. It
 * drives the chart with `chart.emit`, the library's external control: the same
 * `dragstart` / `drag` / `dragend` events a real pointer sends, in inner pixels,
 * on the scene node the gesture lands on. So constraints and every linked mark
 * run as they would for a person's drag.
 */

type Chart = { emit: (event: Record<string, unknown>) => void };
export type SceneNode = Record<string, any>;
/** A scene node and the element that draws it. */
export type Target = { el: SVGGraphicsElement; node: SceneNode };
export type Pt = [number, number];

/** The first drawn node that passes `test`. The D3 renderer binds each node to its element. */
export function findTarget(root: HTMLElement, test: (node: SceneNode) => boolean): Target | null {
  for (const el of root.querySelectorAll<SVGGraphicsElement>('svg *')) {
    const node = (el as unknown as { __data__?: unknown }).__data__;
    if (node && typeof node === 'object' && test(node as SceneNode)) return { el, node: node as SceneNode };
  }
  return null;
}

/** Every drawn node that passes `test`. */
export function findTargets(root: HTMLElement, test: (node: SceneNode) => boolean): Target[] {
  const out: Target[] = [];
  for (const el of root.querySelectorAll<SVGGraphicsElement>('svg *')) {
    const node = (el as unknown as { __data__?: unknown }).__data__;
    if (node && typeof node === 'object' && test(node as SceneNode)) out.push({ el, node: node as SceneNode });
  }
  return out;
}

/** Inner pixels (the node's own space) to a point in `host`'s box. */
function toHost(target: Target, host: HTMLElement, [x, y]: Pt): Pt {
  const parent = target.el.parentNode as SVGGraphicsElement | null;
  const ctm = parent?.getScreenCTM?.();
  const box = host.getBoundingClientRect();
  if (!ctm) return [0, 0];
  const p = new DOMPoint(x, y).matrixTransform(ctm);
  return [p.x - box.left, p.y - box.top];
}

/** The point `u` (0–1) of the way along a path, by length. */
function along(path: Pt[], u: number): Pt {
  const legs = path.slice(1).map((b, i) => Math.hypot(b[0] - path[i][0], b[1] - path[i][1]));
  let d = u * legs.reduce((s, l) => s + l, 0);
  for (let i = 0; i < legs.length; i++) {
    if (d <= legs[i] || i === legs.length - 1) {
      const t = legs[i] ? Math.min(1, d / legs[i]) : 1;
      const [a, b] = [path[i], path[i + 1]];
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    }
    d -= legs[i];
  }
  return path[0];
}

/** A gesture: the node it grabs and the path the pointer takes, in inner pixels. */
export type Gesture = { target: Target; path: Pt[] };

/** The drawn pointer: an arrow in `host`, which must be positioned. */
export class FakePointer {
  readonly el: HTMLDivElement;
  private held: Gesture | null = null;
  private last: Pt = [0, 0];
  constructor(private host: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'walk-pointer';
    this.el.setAttribute('aria-hidden', 'true');
    this.el.innerHTML =
      '<svg width="22" height="26" viewBox="0 0 22 26"><path d="M2 1.5 L2 20 L7 15.5 L10.5 23.5 L14 22 L10.5 14.2 L17.5 14 Z"/></svg>';
    host.append(this.el);
  }
  private place([x, y]: Pt) { this.el.style.transform = `translate(${x - 3}px, ${y - 2}px)`; }
  show(on: boolean) { this.el.classList.toggle('is-on', on); }
  private press(on: boolean) { this.el.classList.toggle('is-down', on); }

  /**
   * Put the gesture at `u` (0–1) of the way along its path. Above 0 the pointer
   * holds the node down; at 0 it lets go at the start. Scrolling drives `u`, so
   * scrolling back runs the gesture in reverse.
   */
  scrub(chart: Chart, gesture: Gesture, u: number) {
    const at = along(gesture.path, u);
    if (u > 0 && !this.held) {
      this.held = gesture;
      const [x, y] = gesture.path[0];
      chart.emit({ type: 'dragstart', node: gesture.target.node, x, y });
      this.press(true);
    }
    if (this.held) {
      chart.emit({ type: 'drag', node: this.held.target.node, x: at[0], y: at[1] });
      this.last = at;
    }
    if (u <= 0) this.release(chart);
    this.place(toHost(gesture.target, this.host, at));
    this.show(true);
  }

  /** End a held gesture where it is, so the chart is never left mid-drag. */
  release(chart: Chart) {
    if (!this.held) return;
    chart.emit({ type: 'dragend', node: this.held.target.node, x: this.last[0], y: this.last[1] });
    this.held = null;
    this.press(false);
  }
  get holding() { return this.held !== null; }

  remove() { this.el.remove(); }
}
