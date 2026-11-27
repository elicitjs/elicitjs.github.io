'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef } from 'react';
import { SITE } from '@/lib/nav';
import type { NavGroup, NavPage } from '@/lib/types';
import { cn } from '@/lib/utils';
import { NavIcon } from '@/components/site/nav-icons';

export type Anchor = { id: string; title: string };

/**
 * Sidebar scroll position per surface. Every docs page renders its own
 * DocShell, so the nav remounts on each navigation; without this it would
 * restart at the top and jump.
 */
const savedScroll: Record<string, number> = {};

type Props = {
  /** The current route, trailing slash removed. */
  active: string;
  /** Which surface this nav lives in, so each keeps its own scroll position. */
  scrollKey?: string;
  /** Called after a link is followed, so the mobile sheet can close. */
  onNavigate?: () => void;
};

/**
 * The grouped page list, shared by the desktop sidebar and the mobile sheet.
 * A group with `chips` draws its pages as icon chips.
 */
export function DocsNav({ active, scrollKey = 'sidebar', onNavigate }: Props) {
  const activeRef = useRef<HTMLAnchorElement>(null);
  const navRef = useRef<HTMLElement>(null);

  // The nav remounts on every navigation, so put the sidebar back where it was
  // before the first paint, and keep recording it as it scrolls. Only a current
  // page that is out of view moves it, and then only as far as needed. The
  // window's scroll is never touched (scrollIntoView would move both).
  useLayoutEffect(() => {
    const viewport = navRef.current?.closest<HTMLElement>('[data-slot="scroll-area-viewport"]');
    if (!viewport) return;
    const saved = savedScroll[scrollKey];
    if (saved !== undefined) viewport.scrollTop = saved;

    const link = activeRef.current;
    if (link) {
      const v = viewport.getBoundingClientRect();
      const l = link.getBoundingClientRect();
      const margin = 48;
      if (saved === undefined) {
        viewport.scrollTop = Math.max(0, viewport.scrollTop + l.top - v.top - viewport.clientHeight / 3);
      } else if (l.top < v.top + margin) {
        viewport.scrollTop += l.top - v.top - margin;
      } else if (l.bottom > v.bottom - margin) {
        viewport.scrollTop += l.bottom - v.bottom + margin;
      }
    }
    savedScroll[scrollKey] = viewport.scrollTop;

    const onScroll = () => {
      savedScroll[scrollKey] = viewport.scrollTop;
    };
    viewport.addEventListener('scroll', onScroll, { passive: true });
    return () => viewport.removeEventListener('scroll', onScroll);
  }, [scrollKey, active]);

  // Should a page ever sit in two groups, only its first entry is marked as the
  // current page.
  let activeSeen = false;

  return (
    <nav ref={navRef} aria-label="Documentation" className="flex flex-col gap-5 px-3 pt-1 pb-6">
      {SITE.map((grp) => (
        <div key={grp.group}>
          <div className="mb-1 px-2.5 text-[0.68rem] font-semibold tracking-[0.08em] text-faint-foreground uppercase">
            {grp.group}
          </div>
          {runs(grp.pages).map((run, i) => renderRun(grp, run, i))}
        </div>
      ))}
    </nav>
  );

  function renderRun(grp: NavGroup, run: { heading?: string; pages: NavPage[] }, i: number) {
    if (grp.chips) {
      return (
        <div key={i} className={cn(i > 0 && 'mt-3')}>
          {run.heading ? <RunHeading>{run.heading}</RunHeading> : null}
          <ul className="flex flex-wrap gap-1.5 px-1.5">{run.pages.map(renderChip)}</ul>
        </div>
      );
    }
    const list = <ul className="flex flex-col gap-px">{run.pages.map(renderPage)}</ul>;
    if (!run.heading) return <div key={i}>{list}</div>;
    // A category inside a group: a coloured label with a rule after it, and its
    // pages indented on a guide line, so it never reads as a page.
    return (
      <div key={i} className="mt-3 first:mt-1">
        <RunHeading>{run.heading}</RunHeading>
        <div className="ml-2.5 border-l border-sidebar-border pl-1">{list}</div>
      </div>
    );
  }

  function renderChip(p: NavPage) {
    const isActive = p.href === active && !activeSeen;
    if (isActive) activeSeen = true;
    const label = p.chip ?? p.title;
    const link = (
      <Link
        ref={isActive ? activeRef : undefined}
        href={p.href}
        onClick={onNavigate}
        aria-current={isActive ? 'page' : undefined}
        className={cn(
          'group/chip flex items-center gap-1.5 rounded-md border py-1 pr-2 pl-1.5 text-[0.78rem] leading-none text-sidebar-foreground no-underline transition-colors',
          'border-sidebar-border bg-background/60 hover:border-border-strong hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          'outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring/50',
          isActive &&
            'border-brand bg-sidebar-accent font-medium text-sidebar-accent-foreground hover:border-brand',
        )}
      >
        <NavIcon
          href={p.href}
          className={cn(
            'transition-colors group-hover/chip:text-sidebar-primary',
            isActive ? 'text-sidebar-primary' : 'text-muted-foreground',
          )}
        />
        {label}
      </Link>
    );
    return <li key={p.href}>{link}</li>;
  }

  function renderPage(p: NavPage) {
    const isActive = p.href === active && !activeSeen;
    if (isActive) activeSeen = true;
    return (
      <li key={p.href}>
        <Link
          ref={isActive ? activeRef : undefined}
          href={p.href}
          onClick={onNavigate}
          aria-current={isActive ? 'page' : undefined}
          className={cn(
            'relative flex items-center rounded-md px-2.5 py-[0.3rem] text-[0.84rem] leading-snug text-sidebar-foreground no-underline transition-colors',
            'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
            'outline-none focus-visible:ring-3 focus-visible:ring-sidebar-ring/50',
            isActive &&
              'bg-sidebar-accent font-medium text-sidebar-accent-foreground before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-brand',
          )}
        >
          {p.title}
        </Link>
      </li>
    );
  }
}

function RunHeading({ children }: { children: string }) {
  return (
    <div className="mb-1.5 flex items-center gap-2 px-2.5 text-[0.66rem] font-semibold tracking-[0.06em] text-sidebar-primary uppercase after:h-px after:flex-1 after:bg-sidebar-border">
      {children}
    </div>
  );
}

/**
 * The sections of the page being read, as a thin strip that sticks to the top
 * of the content (under the mobile top bar below lg). Renders nothing for a
 * page with no sections to jump to. Its height is `--anchor-strip` in
 * docs.css, which anchor jumps use to land clear of it.
 */
export function PageAnchors({
  anchors,
  current,
  onNavigate,
}: {
  anchors: Anchor[];
  /** The section currently in view, highlighted among the anchors. */
  current: string | null;
  onNavigate?: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);

  // Keep the highlighted section in view inside the strip's own horizontal
  // scroll, without touching the window's.
  useEffect(() => {
    const box = scroller.current;
    const link = box?.querySelector<HTMLElement>('[aria-current="location"]');
    if (!box || !link) return;
    const delta =
      link.getBoundingClientRect().left -
      box.getBoundingClientRect().left -
      (box.clientWidth - link.offsetWidth) / 2;
    box.scrollTo({ left: Math.max(0, box.scrollLeft + delta), behavior: 'smooth' });
  }, [current]);

  const show = anchors.length > 1 || anchors.some((a) => a.id === 'api');
  if (!show) return null;
  return (
    <nav
      aria-label="On this page"
      className="sticky top-14 z-30 border-b border-sidebar-border bg-sidebar shadow-[0_2px_8px_-2px_rgb(0_0_0/0.08)] lg:top-0"
    >
      {/* Same width and gutters as the page, so the text lines up with it. */}
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-10">
        <div
          ref={scroller}
          className="flex h-[var(--anchor-strip)] items-stretch gap-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <span className="hidden shrink-0 items-center text-[0.68rem] font-semibold tracking-[0.08em] text-faint-foreground uppercase sm:flex">
            On this page
          </span>
          {anchors.map((a) => (
            <a
              key={a.id}
              href={`#${a.id}`}
              onClick={onNavigate}
              aria-current={current === a.id ? 'location' : undefined}
              className={cn(
                'flex shrink-0 items-center border-b-2 px-0.5 text-[0.8rem] leading-none whitespace-nowrap no-underline transition-colors',
                'outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                current === a.id
                  ? 'border-brand font-medium text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-border-strong hover:text-foreground',
              )}
            >
              {a.title}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}

/** Split a group's pages into runs, a new one at each page that carries a `heading`. */
function runs(pages: NavPage[]): { heading?: string; pages: NavPage[] }[] {
  const out: { heading?: string; pages: NavPage[] }[] = [];
  for (const p of pages) {
    if (p.heading || out.length === 0) out.push({ heading: p.heading, pages: [] });
    out[out.length - 1].pages.push(p);
  }
  return out;
}
