'use client';

/**
 * The intro's mark gallery: a large live chart beside a grid of small ones.
 * Picking a small chart opens it large. The two draw one dataset, so the small
 * copy follows what you do in the large one.
 */
import { useEffect, useRef, useState } from 'react';
import * as elicit from '@elicit';
import { chartThemeFor, useChartMode } from '../../lib/chartTheme';
import { READABLE, inkFor } from './steps';
import { TILES, splitSpec, type Tile } from './tiles';

/** A CSS colour token, resolved to a colour the library can paint. */
function cssColor(token: string): string {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  document.body.append(probe);
  const color = getComputedStyle(probe).color;
  probe.remove();
  return color;
}

/** Size a scaling chart to fit inside `box`, keeping its aspect ratio. */
function fit(el: HTMLElement, box: HTMLElement, spec: { width: number; height: number }) {
  el.style.width = `${Math.min(box.clientWidth, (box.clientHeight * spec.width) / spec.height)}px`;
}

export function MarkGallery() {
  const mode = useChartMode();
  const [picked, setPicked] = useState(0);
  const [pulse, setPulse] = useState<Record<string, number>>({});
  const datasets = useRef<Map<string, { ds: any; seed: unknown }>>(new Map());
  const smallBoxes = useRef<(HTMLDivElement | null)[]>([]);
  const bigBox = useRef<HTMLDivElement>(null);
  const iconsRef = useRef<HTMLDivElement>(null);

  // One dataset per tile, made once; it outlives a change of colour mode.
  const datasetOf = (tile: Tile, spec: Record<string, any>) => {
    let entry = datasets.current.get(tile.id);
    if (!entry) {
      const ds = (elicit.Elicit as any).dataset(splitSpec(spec).dataset);
      entry = { ds, seed: structuredClone(ds.getData()) };
      datasets.current.set(tile.id, entry);
    }
    return entry;
  };
  const inkNow = () => ({ ...inkFor(mode), card: cssColor('--card') });

  // The small charts.
  useEffect(() => {
    elicit.setTheme(chartThemeFor(mode) as Parameters<typeof elicit.setTheme>[0]);
    const ink = inkNow();
    const made = TILES.map((tile, i) => {
      const spec = tile.spec(ink);
      const { ds } = datasetOf(tile, spec);
      const { chart: chartSpec } = splitSpec(spec);
      const chart = ds.chart({ ...chartSpec, responsive: 'scale', effects: { hovered: { link: 'receive' } } });
      const box = smallBoxes.current[i]!;
      box.replaceChildren(chart.dom());
      const resize = () => fit(chart.dom(), box, spec as any);
      resize();
      const off = ds.on('change', () => setPulse((p) => ({ ...p, [tile.id]: (p[tile.id] || 0) + 1 })));
      return { chart, resize, off };
    });
    const ro = new ResizeObserver(() => made.forEach((m) => m.resize()));
    if (iconsRef.current) ro.observe(iconsRef.current);
    return () => { ro.disconnect(); made.forEach((m) => { m.off(); m.chart.destroy(); }); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // The large chart.
  useEffect(() => {
    elicit.setTheme(chartThemeFor(mode) as Parameters<typeof elicit.setTheme>[0]);
    const tile = TILES[picked];
    const spec = tile.spec(inkNow());
    const { ds } = datasetOf(tile, spec);
    const { chart: chartSpec } = splitSpec(spec);
    const chart = ds.chart({ ...chartSpec, responsive: 'scale', theme: { ...READABLE, ...chartSpec.theme } });
    const box = bigBox.current!;
    box.replaceChildren(chart.dom());
    const resize = () => fit(chart.dom(), box, spec as any);
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    return () => { ro.disconnect(); chart.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, mode]);

  const tile = TILES[picked];
  const entry = () => datasets.current.get(tile.id);
  return (
    <div className="gal">
      <div className="gal-feature">
        <div className="gal-feature-head">
          <h3>{tile.what}</h3>
          <code className="inline">{tile.kw}</code>
        </div>
        <p className="gal-how">{tile.how}</p>
        <div className="chart gal-big" ref={bigBox} />
        <div className="gal-feature-foot">
          <a href={tile.href}>Read about it →</a>
          <span>
            <button type="button" className="gal-btn" onClick={() => entry()?.ds.undo()}>Undo</button>
            <button type="button" className="gal-btn" onClick={() => { const e = entry(); if (e) e.ds.setData(structuredClone(e.seed)); }}>Reset</button>
          </span>
        </div>
      </div>
      <div className="gal-icons" ref={iconsRef}>
        {TILES.map((t, i) => (
          <button
            key={t.id}
            type="button"
            className={`gal-icon${i === picked ? ' is-active' : ''}`}
            aria-pressed={i === picked}
            title={t.what}
            onClick={() => setPicked(i)}
          >
            <span key={pulse[t.id] || 0} className={`gal-pulse${pulse[t.id] ? ' is-on' : ''}`} />
            <div className="chart gal-small" ref={(el) => { smallBoxes.current[i] = el; }} />
            <span className="gal-label">{t.what}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
