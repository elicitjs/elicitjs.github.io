// app.js — the VIBE recreations site. Classic script, no build step, so the
// folder opens straight from disk (file://) as well as from any static host.
(function () {
  'use strict';

  const CAT = window.CATALOG || [];
  const V = window.VIBE;

  // ------------------------------------------------------------ helpers
  const $ = (sel, el = document) => el.querySelector(sel);
  const h = (tag, attrs = {}, ...kids) => {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (v == null || v === false) continue;
      if (k === 'class') el.className = v;
      else if (k === 'html') el.innerHTML = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
      else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    }
    for (const kid of kids.flat()) {
      if (kid == null || kid === false) continue;
      el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
    }
    return el;
  };
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  // Inline markdown for prose fields: `code`, **bold**, _italic_, [text](url).
  const md = (s) => esc(s || '')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    .replace(/(^|[\s(])_([^_\s][^_]*?)_(?=[\s.,;:!?)]|$)/g, '$1<i>$2</i>')
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  // Block markdown for the analysis prose: ## headings, - lists, paragraphs.
  const mdBlocks = (s) => String(s || '').trim().split(/\n\s*\n/).map((b) => {
    if (/^###\s/.test(b)) return `<h4>${md(b.replace(/^###\s+/, ''))}</h4>`;
    if (/^##\s/.test(b)) return `<h3>${md(b.replace(/^##\s+/, ''))}</h3>`;
    if (/^\s*[-*]\s/.test(b)) return '<ul>' + b.split(/\n(?=\s*[-*]\s)/).map((li) => `<li>${md(li.replace(/^\s*[-*]\s+/, ''))}</li>`).join('') + '</ul>';
    if (/^\|/.test(b)) {
      const rows = b.split('\n').filter((r) => !/^\|\s*-/.test(r)).map((r) => r.replace(/^\||\|$/g, '').split('|').map((c) => c.trim()));
      return '<table class="tbl"><thead><tr>' + rows[0].map((c) => `<th>${md(c)}</th>`).join('') + '</tr></thead><tbody>' +
        rows.slice(1).map((r) => '<tr>' + r.map((c) => `<td>${md(c)}</td>`).join('') + '</tr>').join('') + '</tbody></table>';
    }
    return `<p>${md(b.replace(/\n/g, ' '))}</p>`;
  }).join('');

  // ------------------------------------------------------------ catalog
  const all = CAT.map((c) => ({ ...c, ...(V.entries[c.id] || {}), catalog: c }));
  const byId = Object.fromEntries(all.map((e) => [e.id, e]));
  const statusOf = (e) => (V.entries[e.id] ? (V.entries[e.id].status || 'none') : 'todo');
  const STATUS = {
    full: { label: 'Recreated' },
    partial: { label: 'Partly recreated' },
    none: { label: 'Not possible' },
    todo: { label: 'Not yet analysed' },
  };
  const SOURCES = ['FiveThirtyEight', 'The New York Times', 'The Guardian', 'CNN', 'Unknown'];
  const shotUrl = (e) => encodeURI(e.catalog.screenshot);

  // ------------------------------------------------------------ code view
  function highlightJs(line) {
    const re = /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)(?=\s*\()|([A-Za-z_$][\w$]*)(?=\s*:)|(\b(?:const|let|var|function|return|new|await|async|if|else|for|of|in|true|false|null|undefined|typeof)\b)/g;
    let out = '', last = 0, m;
    while ((m = re.exec(line))) {
      out += esc(line.slice(last, m.index));
      const t = esc(m[0]);
      out += m[1] ? `<span class="t-c">${t}</span>`
        : m[2] ? `<span class="t-s">${t}</span>`
          : m[3] ? `<span class="t-n">${t}</span>`
            : m[4] ? `<span class="t-f">${t}</span>`
              : m[5] ? `<span class="t-k">${t}</span>`
                : `<span class="t-w">${t}</span>`;
      last = m.index + m[0].length;
    }
    return out + esc(line.slice(last));
  }
  // A line ending in `//! note` is HIGHLIGHTED (it is what makes the elicitation
  // work); the marker is stripped and the note shown beside the line.
  function codeView(code, { title, open = true } = {}) {
    const lines = String(code).replace(/\s+$/, '').split('\n');
    const rows = lines.map((raw) => {
      const mk = raw.match(/^(.*?)\s*\/\/!\s?(.*)$/);
      const text = mk ? mk[1] : raw;
      const note = mk ? mk[2] : '';
      return `<div class="ln${mk ? ' hl' : ''}"><span class="lc">${highlightJs(text) || ' '}</span>${note ? `<span class="note">${md(note)}</span>` : ''}</div>`;
    }).join('');
    const hlCount = lines.filter((l) => /\/\/!/.test(l)).length;
    return h('details', { class: 'code', open: open || null },
      h('summary', {}, h('span', {}, title || 'Code'),
        hlCount ? h('span', { class: 'hlcount' }, `${hlCount} highlighted line${hlCount > 1 ? 's make' : ' makes'} the elicitation work`) : null,
        h('button', {
          class: 'copy', type: 'button', onclick: (ev) => {
            ev.preventDefault();
            const clean = lines.map((l) => l.replace(/\s*\/\/!.*$/, '')).join('\n');
            navigator.clipboard?.writeText(clean);
            ev.target.textContent = 'Copied'; setTimeout(() => (ev.target.textContent = 'Copy'), 1200);
          },
        }, 'Copy')),
      h('pre', { html: rows }));
  }

  // ------------------------------------------------------------ Elicit.js runner
  const E = window.elicit;
  const {
    line: _l, axis: _a, legend: _lg, stack: _s, geo: _g, waffle: _w, trend: _t,
    network: _n, hierarchy: _hi, when: _wh, scale: _sc, ...universalEdits
  } = E.edit;
  const dataCache = new Map();
  function fetchData(url, opts = {}) {
    const key = url + JSON.stringify(opts);
    if (!dataCache.has(key)) {
      const kind = opts.type || (/\.csv(\?|$)/.test(url) ? 'csv' : /\.tsv(\?|$)/.test(url) ? 'tsv' : 'json');
      const p = kind === 'csv' ? d3.csv(url, d3.autoType)
        : kind === 'tsv' ? d3.tsv(url, d3.autoType)
          : kind === 'text' ? d3.text(url) : d3.json(url);
      dataCache.set(key, p);
    }
    // A fresh copy per caller, so one chart's edits never leak into another's rows.
    const copy = (d) => (Array.isArray(d) ? [...d] : d && typeof d === 'object' && !(d instanceof Date) ? { ...d } : d);
    return dataCache.get(key).then((v) => (Array.isArray(v) ? v.map(copy) : v));
  }
  const vegaData = (file, opts) => fetchData('https://cdn.jsdelivr.net/npm/vega-datasets@3/data/' + file.replace(/^data\//, ''), opts);

  // The page around a chart: a question line, buttons, a note that reveals the
  // answer. Entry code mounts these beside its chart(s).
  const ui = {
    question: (text) => h('div', { class: 'ui-question', html: md(text) }),
    button: (label, onClick, attrs = {}) => h('button', { class: 'ui-button', type: 'button', onclick: onClick, ...attrs }, label),
    row: (...kids) => h('div', { class: 'ui-row' }, ...kids),
    note: (text = '') => h('div', { class: 'ui-note', html: md(text) }),
    input: (attrs = {}) => h('input', { class: 'ui-input', ...attrs }),
    md,
  };

  function makeScope(mount) {
    return {
      ...E.plot, ...E.elements, ...E.constraints, constraints: E.constraints,
      ...universalEdits,
      Elicit: E.Elicit, when: E.edit.when, edit: E.edit, elements: E.elements,
      guides: E.guides, widgets: E.widgets, format: E.format, authoring: E.authoring,
      layout: E.layout, looks: E.looks, themes: E.themes,
      d3, topojson: window.topojson, fetchData, vegaData, ui, h, mount,
    };
  }
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

  // Run an Elicit.js snippet into `host`. Resolves { chart, charts, warnings, error }.
  // Runs are SERIALIZED: warnings are captured by patching console.warn, so two
  // charts building at once would each collect the other's.
  let runQueue = Promise.resolve();
  function runElicit(code, host) {
    const p = runQueue.then(() => runElicitNow(code, host));
    runQueue = p.catch(() => {});
    return p;
  }
  async function runElicitNow(code, host) {
    if (E.setWarnings) E.setWarnings(true);
    const warnings = [];
    const origWarn = console.warn;
    console.warn = function (...args) {
      if (typeof args[0] === 'string' && args[0].startsWith('[elicit]')) warnings.push(args.join(' '));
      return origWarn.apply(this, args);
    };
    const charts = [];
    // A chart (what `Elicit(...)` returns) mounts its `dom()`; a plain node is appended.
    const mount = (el) => {
      if (el && typeof el.dom === 'function') { const d = el.dom(); d.classList.add('ui-chart'); host.append(d); charts.push(el); }
      else if (el instanceof Node) host.append(el);
      return el;
    };
    try {
      const scope = makeScope(mount);
      const fn = new AsyncFunction(...Object.keys(scope), code);
      await fn(...Object.values(scope));
      await new Promise((r) => requestAnimationFrame(() => r()));
      return { chart: charts[0] || null, charts, warnings };
    } catch (error) {
      host.append(h('div', { class: 'err' }, `Error: ${error && error.message || error}`));
      return { chart: charts[0] || null, charts, warnings, error: String(error && error.stack || error) };
    } finally {
      await new Promise((r) => setTimeout(r, 30));
      console.warn = origWarn;
    }
  }

  // ------------------------------------------------------------ data panel
  function fmtVal(v) {
    if (v == null) return `<span class="t-w">${v}</span>`;
    if (typeof v === 'number') return `<span class="t-n">${Number.isInteger(v) ? v : v.toFixed(2)}</span>`;
    if (v instanceof Date) return `<span class="t-s">${v.toISOString().slice(0, 10)}</span>`;
    if (typeof v === 'string') return `<span class="t-s">"${esc(v.length > 40 ? v.slice(0, 40) + '…' : v)}"</span>`;
    const s = JSON.stringify(v);
    return `<span class="t-n">${esc(s.length > 40 ? s.slice(0, 40) + '…' : s)}</span>`;
  }
  function dataPanel(charts) {
    const body = h('pre', { class: 'data-body' });
    const count = h('span', { class: 'data-count' });
    const panel = h('div', { class: 'data' }, h('div', { class: 'data-head' }, h('span', {}, 'getData()'), count), body);
    const render = () => {
      const groups = [];
      charts.forEach((c, ci) => {
        let d;
        try { d = c.getData(); } catch { return; }
        const label = charts.length > 1 ? `chart ${ci + 1}` : null;
        if (Array.isArray(d)) groups.push([label, d]);
        else Object.entries(d || {}).forEach(([n, r]) => groups.push([label ? `${label} · ${n}` : n, r]));
      });
      count.textContent = groups.map(([n, r]) => (n ? `${n} ` : '') + `${r.length} row${r.length === 1 ? '' : 's'}`).join(' · ');
      body.innerHTML = groups.map(([n, rows]) => {
        const shown = rows.slice(0, 60);
        const pad = String(Math.max(rows.length - 1, 0)).length;
        const txt = shown.map((r, i) => `<span class="idx">${String(i).padStart(pad)}</span>  { ` +
          Object.entries(r).map(([k, v]) => `<span class="t-k">${esc(k)}:</span> ${fmtVal(v)}`).join(', ') + ' }').join('\n');
        return (n ? `<span class="tbl">${esc(n)}</span>\n` : '') + (txt || '<span class="t-c">no rows</span>') +
          (rows.length > 60 ? `\n<span class="t-c">… ${rows.length - 60} more</span>` : '');
      }).join('\n\n');
    };
    charts.forEach((c) => c.on && c.on('change', render));
    render();
    return panel;
  }

  // ------------------------------------------------------------ routes + sidebar
  // #/          overview          #/analysis    analysis          #/<id>   one example
  const nav = $('#nav');
  const main = $('#main');
  let blocks = [];
  window.VIBE_STATE = { route: null, done: false, blocks };

  function parseRoute() {
    const p = (location.hash || '#/').slice(2);
    if (!p) return { page: 'overview' };
    if (p === 'analysis') return { page: 'analysis' };
    return { page: 'entry', id: p };
  }
  function buildNav(r) {
    nav.innerHTML = '';
    const top = h('div', { class: 'nav-group' },
      h('a', { class: 'nav-item' + (r.page === 'overview' ? ' active' : ''), href: '#/' }, 'Overview', h('span', { class: 'n' }, all.length)),
      h('a', { class: 'nav-item' + (r.page === 'analysis' ? ' active' : ''), href: '#/analysis' }, 'Analysis'));
    nav.append(top);
    for (const src of SOURCES) {
      const list = all.filter((e) => e.source === src);
      if (!list.length) continue;
      const g = h('div', { class: 'nav-group' }, h('div', { class: 'nav-head' }, src));
      const sub = h('div', { class: 'nav-sub' });
      list.forEach((e) => sub.append(h('a', { class: 'nav-subitem' + (r.id === e.id ? ' active' : ''), href: `#/${e.id}`, title: e.title },
        h('span', { class: `dot s-${statusOf(e)}` }), h('span', {}, `${e.row}. ${e.title}`))));
      g.append(sub);
      nav.append(g);
    }
    nav.append(h('div', { class: 'nav-legend' }, ...['full', 'partial', 'none'].map((s) => h('span', {}, h('span', { class: `dot s-${s}` }), STATUS[s].label))));
  }
  function updateTopbar(r) {
    document.querySelectorAll('.toplinks a').forEach((a) => a.classList.toggle('on', a.dataset.page === r.page));
  }
  function counts(list) {
    const c = { full: 0, partial: 0, none: 0, todo: 0 };
    list.forEach((e) => c[statusOf(e)]++);
    return c;
  }
  function statBar(list) {
    const c = counts(list);
    return h('div', { class: 'statbar' }, ...['full', 'partial', 'none', 'todo'].filter((s) => c[s]).map((s) =>
      h('div', { class: `seg s-${s}`, style: { flex: c[s] }, title: `${STATUS[s].label}: ${c[s]}` }, c[s])));
  }
  const badge = (e) => { const s = statusOf(e); return h('span', { class: `badge s-${s}` }, STATUS[s].label); };

  function card(e) {
    const c = e.catalog.codes || {};
    return h('a', { class: 'ex', href: `#/${e.id}` },
      h('div', { class: 'ex-thumb shotthumb' }, h('img', { src: shotUrl(e), alt: '', loading: 'lazy' })),
      h('div', { class: 'ex-meta' },
        h('div', { class: 'ex-title' }, e.title),
        h('div', { class: 'ex-sub' }, h('span', { class: `dot s-${statusOf(e)}` }), h('span', {}, [c.interaction, c.vis].filter(Boolean).join(' · ') || e.source))));
  }

  // ------------------------------------------------------------ pages
  function pageOverview() {
    const c = counts(all);
    main.append(h('header', { class: 'page-head' },
      h('div', { class: 'eyebrow' }, 'Belief elicitation in the wild'),
      h('h1', {}, 'VIBE recreations'),
      h('p', { class: 'lead', html: md('Twenty-five interactive pieces from FiveThirtyEight, The New York Times, The Guardian and CNN that ask readers what they believe before showing them the data: sliders, “you draw it” lines, maps, rankings and quizzes. They come from the example set of the VIBE design space for visual belief elicitation. Each page shows the original as it was published, the strategy it uses to elicit a belief, and an Elicit.js recreation, or why one is not possible.') }),
      h('div', { class: 'head-stats' }, statBar(all),
        h('span', { class: 'small muted' }, `${c.full} recreated · ${c.partial} partly · ${c.none} not possible` + (c.todo ? ` · ${c.todo} not yet analysed` : '')))));
    for (const src of SOURCES) {
      const list = all.filter((e) => e.source === src);
      if (!list.length) continue;
      main.append(h('section', { class: 'src-group' }, h('h2', {}, src, ' ', h('small', {}, `${list.length}`)), h('div', { class: 'ex-grid' }, ...list.map(card))));
    }
  }

  function pageAnalysis() {
    const c = counts(all);
    main.append(h('header', { class: 'page-head' }, h('div', { class: 'eyebrow' }, 'Outcome'), h('h1', {}, 'Analysis'),
      h('div', { class: 'head-stats' }, statBar(all), h('span', { class: 'small muted' }, `${c.full} recreated · ${c.partial} partly · ${c.none} not possible`))));
    if (V.analysis) main.append(h('div', { class: 'prose', html: mdBlocks(V.analysis) }));

    // What is missing, ranked by how many examples need it.
    const need = {};
    all.forEach((e) => (e.needs || []).forEach((k) => (need[k] ||= []).push(e)));
    const ranked = Object.entries(need).sort((a, b) => b[1].length - a[1].length);
    if (ranked.length) {
      main.append(h('h2', {}, 'What is missing'),
        h('table', { class: 'tbl' }, h('thead', {}, h('tr', {}, h('th', {}, 'Feature'), h('th', {}, 'Examples'), h('th', {}, 'Needed by'))),
          h('tbody', {}, ...ranked.map(([k, list]) => h('tr', {},
            h('td', {}, h('b', {}, (V.features[k] || {}).label || k), h('div', { class: 'small muted', html: md((V.features[k] || {}).description || '') })),
            h('td', { class: 'num' }, list.length),
            h('td', {}, ...list.map((e) => h('a', { class: 'chip', href: `#/${e.id}` }, `${e.row}`))))))));
    }
    main.append(h('h2', {}, 'Every example'),
      h('table', { class: 'tbl' }, h('thead', {}, h('tr', {}, h('th', {}, '#'), h('th', {}, 'Example'), h('th', {}, 'Technique'), h('th', {}, 'Status'), h('th', {}, 'Verdict'))),
        h('tbody', {}, ...all.map((e) => {
          const cc = e.catalog.codes || {};
          return h('tr', {},
            h('td', { class: 'num' }, e.row),
            h('td', {}, h('a', { href: `#/${e.id}` }, e.title), h('div', { class: 'small muted' }, e.source)),
            h('td', { class: 'small' }, [cc.parameter, cc.interaction, cc.vis].filter(Boolean).join(' · ')),
            h('td', {}, badge(e)),
            h('td', { class: 'small', html: md(e.verdict || '') }));
        }))));
  }

  function codesRow(e) {
    const c = e.catalog.codes;
    if (!c) return e.catalog.note ? h('p', { class: 'small muted', html: md(e.catalog.note) }) : null;
    const ex = c.expertise || {};
    const cell = (k, v, sub) => v ? h('div', { class: 'code-card' }, h('div', { class: 'k' }, k), h('div', { class: 'v' }, v, sub ? h('small', {}, ' ', sub) : null)) : null;
    return h('div', { class: 'codes', title: 'Codes from the VIBE spreadsheet' },
      cell('Why', c.why),
      cell('What', c.parameter, c.uncertainty && c.uncertainty !== 'None' ? `· uncertainty: ${c.uncertainty}` : ''),
      cell('How', [c.interaction, c.vis].filter(Boolean).join(' · '), c.inference ? `· ${c.inference.toLowerCase()} inference` : ''),
      cell('Feedback', [c.feedbackType, c.feedbackSource].filter((x) => x && x !== 'None').join(' · ') || 'None'),
      cell('Who', c.who, `· expertise: graphical ${(ex.graphical || '?').toLowerCase()}, statistical ${(ex.statistical || '?').toLowerCase()}, domain ${(ex.domain || '?').toLowerCase()}`));
  }

  async function pageEntry(id) {
    const e = byId[id];
    if (!e) { main.append(h('h1', {}, 'Not found'), h('p', {}, id)); return; }
    const s = statusOf(e);
    const idx = all.indexOf(e);
    const prev = all[idx - 1], next = all[idx + 1];
    main.classList.add('wide');
    const o = e.original || {};

    main.append(h('header', { class: 'ex-head' },
      h('div', { class: 'crumbs' }, h('a', { href: '#/' }, 'VIBE'), h('span', { class: 'sep' }, '/'), h('span', {}, e.source), h('span', { class: 'sep' }, '/'), h('span', {}, `Row ${e.row}`)),
      h('div', { class: 'ex-titlerow' },
        h('h1', {}, e.title), badge(e),
        h('div', { class: 'pager-btns' },
          prev ? h('a', { class: 'btn', href: `#/${prev.id}`, title: prev.title }, '← Previous') : h('span', { class: 'btn disabled' }, '← Previous'),
          next ? h('a', { class: 'btn', href: `#/${next.id}`, title: next.title }, 'Next →') : h('span', { class: 'btn disabled' }, 'Next →'))),
      e.verdict ? h('p', { class: 'ex-verdict', html: md(e.verdict) }) : null),
      codesRow(e));

    // ---- panels: the original (screenshot) and the Elicit.js views
    const cmp = h('div', { class: 'compare' });
    const avail = o.availability ? h('span', { class: `avail ${o.availability}` }, { live: 'still live', archived: 'archived copy', gone: 'gone' }[o.availability] || o.availability) : null;
    const links = [e.url ? { label: 'Original URL', url: e.url } : null, ...(o.links || [])].filter(Boolean);
    cmp.append(h('section', { class: 'panel' },
      h('div', { class: 'panel-head' }, h('span', { class: 'panel-title' }, 'Original'), h('span', { class: 'panel-sub' }, e.source), avail,
        e.url ? h('a', { class: 'panel-link', href: e.url, target: '_blank', rel: 'noopener' }, 'Open ↗') : null),
      h('div', { class: 'intro' }, o.summary ? h('p', { class: 'intro-text', html: md(o.summary) }) : h('p', { class: 'intro-text muted' }, 'Screenshot from the VIBE example set.')),
      h('div', { class: 'shot-host' }, h('img', { class: 'shot', src: shotUrl(e), alt: `Screenshot: ${e.title}` })),
      h('div', { class: 'links' }, ...links.map((l) => h('a', { href: l.url, target: '_blank', rel: 'noopener' }, l.label + ' ↗')))));
    const rightPanel = h('section', { class: 'panel' });
    cmp.append(rightPanel);
    main.append(cmp);

    // ---- details: the strategy (left) and the active view (right)
    const details = h('section', { class: 'notes' });
    const about = h('div', { class: 'note-col' });
    const st = e.strategy || {};
    if (st.elicits || st.technique || st.inElicit) {
      about.append(h('h3', { class: 'note-h' }, 'Elicitation strategy'),
        h('div', { class: 'strategy' },
          st.elicits ? h('div', { class: 'row' }, h('b', {}, 'What it elicits'), h('div', { html: md(st.elicits) })) : null,
          st.technique ? h('div', { class: 'row' }, h('b', {}, 'How the original asks'), h('div', { html: md(st.technique) })) : null,
          st.inElicit ? h('div', { class: 'row' }, h('b', {}, 'In Elicit.js'), h('div', { html: md(st.inElicit) })) : null));
    }
    if ((o.steps || []).length) about.append(h('div', { class: 'note-sub' }, 'The flow of the original'), h('ol', { class: 'steps' }, ...o.steps.map((x) => h('li', { html: md(x) }))));
    if (o.answers) about.append(h('div', { class: 'answer', html: '<b>What the piece revealed.</b> ' + md(o.answers) }));
    if (e.whyNot) about.append(h('div', { class: 'note-sub' }, s === 'none' ? 'Why Elicit.js can’t recreate it' : 'What Elicit.js can’t do here'), h('div', { class: 'whynot', html: md(e.whyNot) }));
    const facts = h('dl', { class: 'facts' });
    if ((e.needs || []).length) facts.append(h('dt', {}, s === 'none' ? 'Needs' : 'Missing'), h('dd', {}, ...e.needs.map((k) => h('span', { class: 'chip', title: (V.features[k] || {}).description || '' }, (V.features[k] || {}).label || k))));
    if (facts.childNodes.length) about.append(facts);
    if ((e.gaps || []).length) about.append(h('div', { class: 'note-sub' }, 'Differences from the original'), h('ul', { class: 'gap-list' }, ...e.gaps.map((g) => h('li', { html: md(g) }))));
    if (e.alternative) about.append(h('div', { class: 'note-sub' }, 'What Elicit.js can ask instead'), h('p', { class: 'small', html: md(e.alternative) }));
    if (s === 'todo') about.append(h('p', { class: 'muted' }, 'This example has not been analysed yet.'));
    details.append(about);
    const viewCol = h('div', { class: 'note-col note-view' });

    const views = [];
    if (e.recreation) views.push({ key: 'rec', label: e.recreation.title || 'Recreation', v: e.recreation, rec: true });
    (e.variants || []).forEach((v, i) => views.push({ key: `var-${i}`, label: v.title || `Variant ${i + 1}`, v, i }));

    const runs = [];
    if (!views.length) {
      rightPanel.append(h('div', { class: 'panel-head' }, h('span', { class: 'panel-title' }, 'Elicit.js'),
        h('span', { class: 'panel-sub' }, s === 'todo' ? 'not yet analysed' : 'no recreation')),
      h('div', { class: s === 'todo' ? 'placeholder' : 'placeholder none' },
        s === 'todo' ? 'This example has not been analysed yet.' : h('span', {}, h('b', {}, 'No Elicit.js recreation. '), 'The notes below say why.')));
    } else {
      details.append(viewCol);
      const tabs = h('div', { class: 'tabs', role: 'tablist' });
      const intros = h('div', { class: 'intro-stack' });
      const panes = h('div', { class: 'panes' });
      const codeArea = h('div', { class: 'code-area' });
      rightPanel.append(h('div', { class: 'panel-head tabs-head' }, h('span', { class: 'panel-title' }, 'Elicit.js'), tabs), intros, panes, codeArea);
      const select = (k) => views.forEach((w, j) => {
        w.tab.classList.toggle('on', j === k); w.tab.setAttribute('aria-selected', j === k ? 'true' : 'false');
        w.intro.hidden = w.pane.hidden = w.note.hidden = w.codeEl.hidden = j !== k;
      });
      views.forEach((w, k) => {
        if (k === 1 && views[0].rec) tabs.append(h('span', { class: 'tab-sep', 'aria-hidden': 'true' }));
        w.tab = h('button', { class: 'tab', role: 'tab', type: 'button', 'data-view': w.rec ? 'rec' : 'variant', 'data-index': k, onclick: () => select(k) }, w.label);
        tabs.append(w.tab);
        const f = w.v;
        w.intro = h('div', { class: 'intro' },
          h('div', { class: 'intro-title' }, w.rec ? 'Recreation' : (f.title || 'Variant'),
            h('span', { class: 'intro-count' }, w.rec ? 'as close to the original as Elicit.js gets' : 'what else the same strategy can ask')));
        if (f.question) w.intro.append(h('p', { class: 'question' }, h('span', { class: 'qmark' }, 'Q'), h('span', { html: md(f.question) })));
        if (f.try) w.intro.append(h('p', { class: 'try', html: '<b>Try</b> ' + md(f.try) }));
        intros.append(w.intro);

        const host = h('div', { class: 'chart-host' });
        w.pane = h('div', { class: 'pane', role: 'tabpanel' }, host);
        panes.append(w.pane);
        w.codeEl = codeView(f.code || '', { title: 'Elicit.js spec' });
        codeArea.append(w.codeEl);

        w.note = h('div', { class: 'note-pane' }, h('h3', { class: 'note-h' }, 'How it works'));
        const dataSlot = h('div', { class: 'data-slot' });
        if (f.why) w.note.append(h('div', { class: 'why', html: md(f.why) }));
        if ((f.uses || []).length) w.note.append(h('div', { class: 'uses' }, h('b', {}, 'Uses '), ...f.uses.map((u) => h('code', {}, u))));
        w.note.append(dataSlot);
        viewCol.append(w.note);

        const blk = { id: `${id}:${w.key}`, kind: w.rec ? 'recreation' : 'variant', state: 'pending', title: w.label };
        blocks.push(blk);
        const run = () => {
          host.innerHTML = ''; dataSlot.innerHTML = '';
          return runElicit(f.code || '', host).then((r) => {
            Object.assign(blk, { state: r.error ? 'error' : 'ok', error: r.error, warnings: r.warnings, chart: r.chart, charts: r.charts });
            if (r.warnings.length) host.append(h('div', { class: 'warn' }, r.warnings.join('\n')));
            const withData = r.charts.filter((c) => c.getData);
            if (withData.length) dataSlot.append(dataPanel(withData));
          });
        };
        w.pane.append(h('div', { class: 'pane-foot' }, h('button', { class: 'reset', type: 'button', onclick: run }, '↺ Reset')));
        blk.promise = run();
        runs.push(blk.promise);
      });
      select(0);
    }
    main.append(h('h2', { class: 'details-title' }, 'Details'), details);
    await Promise.all(runs);
  }

  // ------------------------------------------------------------ router
  async function route() {
    const r = parseRoute();
    const key = location.hash || '#/';
    blocks = [];
    window.VIBE_STATE = { route: key, done: false, blocks };
    document.body.classList.remove('nav-open');
    main.innerHTML = ''; main.classList.remove('wide');
    buildNav(r); updateTopbar(r);
    try {
      if (r.page === 'overview') pageOverview();
      else if (r.page === 'analysis') pageAnalysis();
      else await pageEntry(r.id);
    } catch (err) {
      main.append(h('div', { class: 'err' }, String(err && err.stack || err)));
    }
    window.scrollTo(0, 0);
    if (window.VIBE_STATE.route === key) window.VIBE_STATE.done = true;
    const active = nav.querySelector('.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
  }
  $('#menu').addEventListener('click', () => document.body.classList.toggle('nav-open'));
  window.addEventListener('hashchange', route);
  route();
})();
