import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * One small glyph per chip in the sidebar. Each is drawn on a 16×16 grid in
 * `currentColor`, so it follows the sidebar's text colour in light and dark.
 * Marks are keyed by slug (the last segment of the route: `bar`); every other
 * page by its full route (`/editing/handles`), which is looked up first, so a
 * page can't borrow a mark's glyph just because their last segments match.
 *
 * Solid parts use `fill="currentColor"`; outlines use the group's stroke. The
 * faded parts (`opacity`) stand for the "rest" of the mark: the other bars, the
 * empty waffle cells, the track not yet travelled.
 */
const F = { fill: 'currentColor', stroke: 'none' } as const;

const ICONS: Record<string, ReactNode> = {
  bar: (
    <>
      <rect x="2" y="8" width="3.2" height="6" rx=".6" {...F} />
      <rect x="6.4" y="2.5" width="3.2" height="11.5" rx=".6" {...F} />
      <rect x="10.8" y="5.5" width="3.2" height="8.5" rx=".6" {...F} />
    </>
  ),
  rect: (
    <>
      <rect x="2" y="2" width="5.2" height="5.2" rx=".8" {...F} opacity=".4" />
      <rect x="8.8" y="2" width="5.2" height="5.2" rx=".8" {...F} opacity=".7" />
      <rect x="2" y="8.8" width="5.2" height="5.2" rx=".8" {...F} opacity=".7" />
      <rect x="8.8" y="8.8" width="5.2" height="5.2" rx=".8" {...F} />
    </>
  ),
  tick: (
    <>
      <path d="M2 13.5h12" opacity=".45" />
      <path d="M4 5.5v5.5M8 2.5v8.5M12 7v4" />
    </>
  ),
  point: (
    <>
      <circle cx="4" cy="11" r="1.7" {...F} />
      <circle cx="8" cy="6" r="1.7" {...F} />
      <circle cx="12" cy="9.5" r="1.7" {...F} />
      <circle cx="11.5" cy="3.5" r="1.7" {...F} opacity=".45" />
    </>
  ),
  line: (
    <>
      <path d="M2 12 6 6.5 9 9.5 14 3.5" />
      <circle cx="14" cy="3.5" r="1.2" {...F} />
    </>
  ),
  area: (
    <>
      <path d="M2 13V9.5L6 5.5l3 3L14 3.5V13Z" {...F} opacity=".3" />
      <path d="M2 9.5 6 5.5l3 3L14 3.5" />
    </>
  ),
  text: <path d="M3 4.5V3h10v1.5M8 3v10M6 13h4" />,
  symbol: (
    <path
      d="m8 2 1.8 4.2 4.4.3-3.4 2.9 1.1 4.3L8 11.3l-3.9 2.4 1.1-4.3L1.8 6.5l4.4-.3Z"
      fill="currentColor"
      fillOpacity=".25"
    />
  ),
  shape: (
    <>
      <circle cx="8" cy="4.2" r="2.2" {...F} />
      <path d="M3.8 14v-3a4.2 4.2 0 0 1 8.4 0v3Z" {...F} />
    </>
  ),
  track: (
    <>
      <path d="M2 12C5 3 9.5 14 14 4" opacity=".35" />
      <path d="M2 12C5 3 9.5 14 14 4" pathLength="1" strokeDasharray=".55 1" />
    </>
  ),
  image: (
    <>
      <rect x="2" y="3" width="12" height="10" rx="1.6" />
      <path d="m2.6 11.4 3.4-3.2 2.8 2.8 1.8-1.8 2.8 2.6" />
      <circle cx="10.6" cy="6.2" r="1" {...F} />
    </>
  ),
  ellipse: (
    <ellipse
      cx="8"
      cy="8"
      rx="6"
      ry="3.8"
      transform="rotate(-25 8 8)"
      fill="currentColor"
      fillOpacity=".2"
    />
  ),
  curve: (
    <>
      <path d="M2.5 12.5C7 12.5 7 3.5 13.5 3.5" />
      <circle cx="2.5" cy="12.5" r="1.4" {...F} />
      <circle cx="13.5" cy="3.5" r="1.4" {...F} />
    </>
  ),
  arc: (
    <>
      <circle cx="8" cy="8" r="6" opacity=".4" />
      <path d="M8 8V2a6 6 0 0 1 6 6Z" {...F} />
    </>
  ),
  waffle: (
    <>
      {[0, 1, 2].map((r) =>
        [0, 1, 2].map((c) => (
          <rect
            key={`${r}${c}`}
            x={2 + c * 4.6}
            y={2 + r * 4.6}
            width="3.4"
            height="3.4"
            rx=".5"
            {...F}
            opacity={r === 0 ? 0.3 : 1}
          />
        )),
      )}
    </>
  ),
  dotstack: (
    <>
      {[
        [4, [12.5, 9.2, 5.9]],
        [8, [12.5, 9.2]],
        [12, [12.5, 9.2, 5.9, 2.6]],
      ].flatMap(([x, ys]) =>
        (ys as number[]).map((y) => (
          <circle key={`${x}${y}`} cx={x as number} cy={y} r="1.4" {...F} />
        )),
      )}
    </>
  ),
  trend: (
    <>
      <path d="M2 9.5 14 2.5V7L2 14Z" {...F} opacity=".25" />
      <path d="M2 11.8 14 4.8" />
    </>
  ),
  needle: (
    <>
      <path d="M2.5 12.5a5.5 5.5 0 0 1 11 0" opacity=".4" />
      <path d="m8 12.5 3-6" />
      <circle cx="8" cy="12.5" r="1.3" {...F} />
    </>
  ),
  composite: (
    <>
      <rect x="2" y="2" width="8" height="8" rx="1.4" />
      <rect x="6" y="6" width="8" height="8" rx="1.4" fill="currentColor" fillOpacity=".3" />
    </>
  ),
  face: (
    <>
      <circle cx="8" cy="8" r="6" />
      <circle cx="5.8" cy="6.6" r=".9" {...F} />
      <circle cx="10.2" cy="6.6" r=".9" {...F} />
      <path d="M5.4 9.7Q8 12.3 10.6 9.7" />
    </>
  ),
  sticker: (
    <>
      <path d="M3 2h10v7l-5 5H3Z" />
      <path d="M8 14V9h5" />
    </>
  ),
  geo: (
    <>
      <path d="M8 14.5S3 10 3 6.5a5 5 0 0 1 10 0C13 10 8 14.5 8 14.5Z" />
      <circle cx="8" cy="6.5" r="1.7" {...F} />
    </>
  ),
  network: (
    <>
      <path d="M8 3.5 3.5 12h9Z" opacity=".5" />
      <circle cx="8" cy="3.5" r="1.9" {...F} />
      <circle cx="3.5" cy="12" r="1.9" {...F} />
      <circle cx="12.5" cy="12" r="1.9" {...F} />
    </>
  ),
  hierarchy: (
    <>
      <path d="M8 5v3M4 11V8h8v3" opacity=".6" />
      <rect x="5.8" y="2" width="4.4" height="3.2" rx=".8" {...F} />
      <rect x="1.8" y="11" width="4.4" height="3.2" rx=".8" {...F} />
      <rect x="9.8" y="11" width="4.4" height="3.2" rx=".8" {...F} />
    </>
  ),
  axes: (
    <>
      <path d="M3 2v11.5h11" />
      <path d="M6.5 7h7.5M6.5 10.2h7.5" strokeDasharray="1.4 1.6" opacity=".55" />
    </>
  ),
  'axis-radial': (
    <>
      <circle cx="8" cy="8" r="5.8" />
      <circle cx="8" cy="8" r="2.6" opacity=".5" />
      <path d="M8 8V2.2M8 8 3 10.9M8 8l5 2.9" opacity=".6" />
    </>
  ),
  legend: (
    <>
      <rect x="2" y="3" width="3.2" height="3.2" rx=".7" {...F} />
      <path d="M7.5 4.6H14" />
      <rect x="2" y="9.8" width="3.2" height="3.2" rx=".7" {...F} opacity=".45" />
      <path d="M7.5 11.4H14" />
    </>
  ),

  // ── Data ─────────────────────────────────────────────────────────────────
  '/schema': (
    <>
      <rect x="2" y="3" width="12" height="10" rx="1.4" />
      <path d="M2 6.6h12M6.4 6.6V13" opacity=".7" />
    </>
  ),
  '/scales': (
    <>
      <rect x="1.8" y="5.5" width="12.4" height="5" rx="1" />
      <path d="M5 5.5V8M8 5.5v3M11 5.5V8" />
    </>
  ),
  '/constraints': (
    <>
      <path d="M3 3v10M13 3v10" />
      <circle cx="8" cy="8" r="1.9" {...F} />
      <path d="M5.2 8h.6M10.2 8h.6" opacity=".6" />
    </>
  ),
  '/layout': (
    <>
      <rect x="2" y="2.5" width="12" height="11" rx="1.4" />
      <path d="M7 2.5v11M7 8h7" />
    </>
  ),
  '/dataset': (
    <>
      <ellipse cx="8" cy="4" rx="5" ry="2" />
      <path d="M3 4v8c0 1.1 2.2 2 5 2s5-.9 5-2V4" />
      <path d="M3 8c0 1.1 2.2 2 5 2s5-.9 5-2" opacity=".5" />
    </>
  ),

  // ── Walkthroughs ─────────────────────────────────────────────────────────
  '/case-studies/glyphs': (
    <>
      <path d="M8 14V7" />
      <circle cx="8" cy="4.4" r="2.2" {...F} />
      <path d="M8 11.2C5.4 11.2 4.2 9.8 4.2 8.2 6.4 8.2 8 9.2 8 11.2ZM8 12.4c2.3 0 3.8-1 3.8-2.6-2.2 0-3.8.8-3.8 2.6Z" fill="currentColor" fillOpacity=".25" />
    </>
  ),
  '/case-studies/du-bois-wrapped': <path d="M2.5 3.5h9a2 2 0 0 1 0 4H4.5a2 2 0 0 0 0 4h9" />,
  '/case-studies/du-bois-spiral': (
    <path d="M8 8A1 1 0 0 1 8 6A2 2 0 0 1 8 10A3 3 0 0 1 8 4A4 4 0 0 1 8 12A5 5 0 0 1 8 2" transform="translate(1.5 1.5)" />
  ),

  // ── Editing ──────────────────────────────────────────────────────────────
  '/editing': (
    <>
      <path d="M2.5 13.5 3 10.2 10.6 2.6a1.5 1.5 0 0 1 2.1 0l.7.7a1.5 1.5 0 0 1 0 2.1L5.8 13Z" />
      <path d="m9.3 3.9 2.8 2.8" opacity=".6" />
    </>
  ),
  '/editing/gestures': (
    <path d="M4 2.5 12 7.5l-3.8 1.1-1.4 3.9Z" fill="currentColor" fillOpacity=".25" />
  ),
  '/editing/sweep': (
    <>
      <path d="M2 12.5C4 6 5.5 13 8 8s3-3.5 5-4.5" />
      <path d="M10.2 3.2h3.3v3.3" />
    </>
  ),
  '/editing/handles': (
    <>
      <path d="m4.5 11.5 7-7" opacity=".6" />
      <rect x="1.8" y="10.2" width="3.6" height="3.6" rx=".6" {...F} />
      <rect x="10.6" y="2.2" width="3.6" height="3.6" rx=".6" {...F} />
    </>
  ),
  '/editing/existence': <path d="M8 3v10M3 8h10" />,
  '/editing/selection': (
    <>
      <rect x="2.5" y="3.5" width="11" height="9" rx="1" strokeDasharray="2 2" />
      <circle cx="8" cy="8" r="1.4" {...F} />
    </>
  ),
  '/editing/probe': (
    <>
      <circle cx="8" cy="8" r="3.4" />
      <path d="M8 1.5v3M8 11.5v3M1.5 8h3M11.5 8h3" />
    </>
  ),
  '/editing/axis': (
    <>
      <path d="M8 2v12M2 8h12" />
      <path d="m6 4 2-2 2 2M6 12l2 2 2-2M4 6 2 8l2 2M12 6l2 2-2 2" />
    </>
  ),
  '/editing/legend': (
    <>
      <circle cx="4" cy="4.5" r="1.9" />
      <circle cx="4" cy="4.5" r=".8" {...F} />
      <path d="M8 4.5h6" />
      <circle cx="4" cy="11.5" r="1.9" opacity=".5" />
      <path d="M8 11.5h6" opacity=".5" />
    </>
  ),
  '/editing/history': (
    <>
      <path d="M3.5 6.5h5.8a3.6 3.6 0 0 1 0 7.2H6" />
      <path d="M6 3.5 3 6.5l3 3" />
    </>
  ),
  '/editing/external-controls': (
    <>
      <path d="M2 5h12M2 11h12" opacity=".45" />
      <circle cx="6" cy="5" r="1.9" {...F} />
      <circle cx="10.5" cy="11" r="1.9" {...F} />
    </>
  ),

  // ── UI layer ─────────────────────────────────────────────────────────────
  '/ui': (
    <>
      <rect x="2" y="2.5" width="12" height="11" rx="1.6" />
      <rect x="3.6" y="4.2" width="8.8" height="2.4" rx=".6" {...F} opacity=".3" />
      <path d="M4.6 9.4h6.8M4.6 11.7h4.4" />
    </>
  ),

  // ── Appearance ───────────────────────────────────────────────────────────
  '/theming': (
    <>
      <path d="M8 2a6 6 0 1 0 0 12c1.1 0 1.5-.8 1.1-1.5-.5-.9 0-1.8 1-1.8h1.4A2.5 2.5 0 0 0 14 8.2 6 6 0 0 0 8 2Z" />
      <circle cx="5" cy="7.2" r=".9" {...F} />
      <circle cx="8" cy="5" r=".9" {...F} />
      <circle cx="11" cy="6.6" r=".9" {...F} />
    </>
  ),
  '/theming/themes': (
    <>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 2a6 6 0 0 1 0 12Z" {...F} />
    </>
  ),
  '/looks': (
    <>
      <path d="M1.5 8S4 3.5 8 3.5 14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8Z" />
      <circle cx="8" cy="8" r="1.8" {...F} />
    </>
  ),
  '/effects': (
    <path
      d="M8 2l1.3 4.7L14 8l-4.7 1.3L8 14l-1.3-4.7L2 8l4.7-1.3Z"
      fill="currentColor"
      fillOpacity=".25"
    />
  ),
  '/guides': (
    <>
      <path d="M2.5 3h11v7H9.2L7 12.5 6 10H2.5Z" />
      <path d="M5 6.5h6" />
    </>
  ),
  '/sizing': (
    <>
      <path d="M6.5 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3.5" opacity=".55" />
      <path d="m9.5 9.5 4.5 4.5M14 10v4h-4" />
    </>
  ),
  '/mobile': (
    <>
      <rect x="4.5" y="1.5" width="7" height="13" rx="1.6" />
      <path d="M7 12.4h2" />
    </>
  ),
};

// The network chart's glyph also stands for its UI page.
ICONS['/ui/network'] = ICONS.network;

/** The glyph for a nav page, or a plain dot for one with none. */
export function NavIcon({ href, className }: { href: string; className?: string }) {
  const slug = href.split('/').filter(Boolean).pop() ?? '';
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-4 shrink-0', className)}
    >
      {ICONS[href] ?? ICONS[slug] ?? <circle cx="8" cy="8" r="2.5" {...F} />}
    </svg>
  );
}
