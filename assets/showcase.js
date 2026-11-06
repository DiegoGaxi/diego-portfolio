// Vitrina de proyectos en carrusel: una lámina por proyecto con sus capturas, ficha y enlaces.
// Lee los mismos datos que el resto del sitio (data/projects.json y data/media.json).

const base = new URL('../', import.meta.url);
const asset = (p) => new URL(p, base).href;
const FIRST = 'lienox';

const T = {
  es: {
    prev: 'Proyecto anterior', next: 'Proyecto siguiente', all: 'Todos', more: 'Leer más', less: 'Leer menos',
    site: 'Ver sitio', repo: 'Repositorio', swap: 'Ver la otra captura', of: 'de', noShots: 'Sin capturas públicas',
    filter: 'Filtrar por tecnología', region: 'Carrusel de proyectos', slide: 'Proyecto', error: 'No se pudieron cargar los proyectos.',
    empty: 'Ningún proyecto con esa tecnología.', hint: 'Desliza o usa las flechas',
  },
  en: {
    prev: 'Previous project', next: 'Next project', all: 'All', more: 'Read more', less: 'Read less',
    site: 'Visit site', repo: 'Repository', swap: 'Show the other screenshot', of: 'of', noShots: 'No public screenshots',
    filter: 'Filter by technology', region: 'Projects carousel', slide: 'Project', error: 'Could not load the projects.',
    empty: 'No project uses that technology.', hint: 'Swipe or use the arrows',
  },
};

const ICON = {
  prev: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M15 5l-7 7 7 7"/></svg>',
  next: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path d="M9 5l7 7-7 7"/></svg>',
  out: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M7 17 17 7M8 7h9v9"/></svg>',
  swap: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" focusable="false"><path d="M4 8h13l-3.5-3.5M20 16H7l3.5 3.5"/></svg>',
};

const STAGES = ['teal', 'clay', 'blue', 'moss'];

let projects = [];
let media = {};
let tag = null;
let lang = 'es';
let active = 0;
const root = document.getElementById('showcase');

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const loc = (v) => (v && typeof v === 'object' && !Array.isArray(v) ? v[lang] ?? v.es : v);
const t = (k) => T[lang][k];
const safeUrl = (u) => {
  if (!u) return null;
  try { const x = new URL(u, location.href); return x.protocol === 'https:' || x.protocol === 'http:' ? x.href : null; } catch { return null; }
};
const motionOn = () => document.documentElement.dataset.motion !== 'off' && !matchMedia('(prefers-reduced-motion: reduce)').matches;
const currentLang = () => {
  try { return localStorage.getItem('lang') === 'en' ? 'en' : 'es'; } catch { return 'es'; }
};

function splitTitle(title) {
  const i = title.indexOf(' — ');
  return i > 0 ? [title.slice(0, i), title.slice(i + 3)] : [title, ''];
}

function stageHtml(p, i) {
  const m = media[p.slug];
  const shots = m?.shots?.length ? m.shots : [];
  const tone = STAGES[i % STAGES.length];
  if (!shots.length) {
    const [name] = splitTitle(loc(p.title));
    return `<div class="plate__stage plate__stage--type" data-tone="${tone}">
      <span class="plate__mark" aria-hidden="true">${esc(name)}</span>
      <span class="plate__noshots">${esc(t('noShots'))}</span>
    </div>`;
  }
  const kind = m.kind === 'phone' ? 'phone' : 'desktop';
  const imgs = shots.slice(0, 2).map((s, n) => `<figure class="plate__shot" style="aspect-ratio:${s.w} / ${s.h}" data-n="${n}">
      <img src="${esc(asset(s.src))}" alt="${esc(loc(s.alt))}" width="${s.w}" height="${s.h}" loading="${i < 2 ? 'eager' : 'lazy'}" decoding="async" draggable="false" />
    </figure>`).join('');
  const swap = kind === 'desktop' && shots.length > 1
    ? `<button type="button" class="plate__swap" data-swap>${ICON.swap}<span>${esc(t('swap'))}</span></button>` : '';
  return `<div class="plate__stage" data-tone="${tone}" data-kind="${kind}" data-count="${Math.min(shots.length, 2)}">${imgs}${swap}</div>`;
}

function slideHtml(p, i, total) {
  const [name, sub] = splitTitle(loc(p.title));
  const year = new Date(p.published_at).getFullYear();
  const site = safeUrl(p.demo_url);
  const repo = safeUrl(p.repo_url);
  const desc = loc(p.description_long) ?? '';
  const id = `plate-${esc(p.slug)}`;
  return `<li class="plate" data-slug="${esc(p.slug)}" id="${id}" role="group" aria-roledescription="slide" aria-label="${esc(t('slide'))} ${i + 1} ${esc(t('of'))} ${total}: ${esc(name)}">
    ${stageHtml(p, i)}
    <div class="plate__text">
      <p class="plate__meta"><span class="plate__year">${year}</span><span class="plate__count">${String(i + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}</span></p>
      <h3 class="plate__title">${esc(name)}${sub ? `<span class="plate__sub">${esc(sub)}</span>` : ''}</h3>
      <p class="plate__summary">${esc(loc(p.summary))}</p>
      ${desc ? `<div class="plate__more" id="${id}-more" hidden>${desc.split(/\n\n+/).map((x) => `<p>${esc(x)}</p>`).join('')}</div>` : ''}
      <ul class="chips plate__tags">${p.tags.map((x) => `<li class="chip">${esc(x)}</li>`).join('')}</ul>
      <div class="plate__links">
        ${site ? `<a class="cta cta--primary" href="${esc(site)}" target="_blank" rel="noopener"><span>${esc(t('site'))}</span>${ICON.out}</a>` : ''}
        ${repo ? `<a class="cta cta--ghost" href="${esc(repo)}" target="_blank" rel="noopener"><span>${esc(t('repo'))}</span>${ICON.out}</a>` : ''}
        ${desc ? `<button type="button" class="cta cta--link plate__toggle" aria-expanded="false" aria-controls="${id}-more" data-more>${esc(t('more'))}</button>` : ''}
      </div>
    </div>
  </li>`;
}

function filtered() {
  return tag ? projects.filter((p) => p.tags.includes(tag)) : projects;
}

function filterHtml() {
  const counts = new Map();
  projects.forEach((p) => p.tags.forEach((x) => counts.set(x, (counts.get(x) ?? 0) + 1)));
  const tags = [...counts].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]);
  const btn = (value, label, n) => `<button type="button" class="filter__btn" data-tag="${esc(value)}" aria-pressed="${(tag ?? '') === value}">${esc(label)} <span class="filter__n">${n}</span></button>`;
  return [btn('', t('all'), projects.length), ...tags.map(([x, n]) => btn(x, x, n))].join('');
}

function render({ keepPosition = false } = {}) {
  const list = filtered();
  const prevSlug = keepPosition ? list[active]?.slug : null;
  root.innerHTML = `
    <div class="filter showcase__filter" role="group" aria-label="${esc(t('filter'))}">${filterHtml()}</div>
    <div class="showcase__viewport" role="region" aria-roledescription="carousel" aria-label="${esc(t('region'))}">
      ${list.length
        ? `<ol class="showcase__track" tabindex="0">${list.map((p, i) => slideHtml(p, i, list.length)).join('')}</ol>`
        : `<p class="empty-state">${esc(t('empty'))}</p>`}
    </div>
    <div class="showcase__bar" ${list.length < 2 ? 'hidden' : ''}>
      <p class="showcase__status" aria-live="polite"><span class="showcase__now">01</span><span class="showcase__total"> / ${String(list.length).padStart(2, '0')}</span></p>
      <div class="showcase__progress" aria-hidden="true"><span></span></div>
      <p class="showcase__hint">${esc(t('hint'))}</p>
      <div class="showcase__nav">
        <button type="button" class="showcase__btn" data-go="-1" aria-label="${esc(t('prev'))}">${ICON.prev}</button>
        <button type="button" class="showcase__btn" data-go="1" aria-label="${esc(t('next'))}">${ICON.next}</button>
      </div>
    </div>`;
  active = 0;
  bindTrack();
  if (prevSlug) {
    const i = list.findIndex((p) => p.slug === prevSlug);
    if (i > 0) goTo(i, false);
  }
  window.dispatchEvent(new Event('resize'));
}

function track() { return root.querySelector('.showcase__track'); }
function slides() { return [...root.querySelectorAll('.plate')]; }

function goTo(i, smooth = true) {
  const tr = track();
  const all = slides();
  if (!tr || !all.length) return;
  const n = Math.max(0, Math.min(all.length - 1, i));
  const pad = parseFloat(getComputedStyle(tr).scrollPaddingLeft) || 0;
  tr.scrollTo({ left: all[n].offsetLeft - pad, behavior: smooth && motionOn() ? 'smooth' : 'auto' });
  setActive(n);
}

function setActive(n) {
  active = n;
  const all = slides();
  all.forEach((s, i) => s.classList.toggle('is-active', i === n));
  const now = root.querySelector('.showcase__now');
  if (now) now.textContent = String(n + 1).padStart(2, '0');
  const bar = root.querySelector('.showcase__progress span');
  if (bar) bar.style.transform = `scaleX(${all.length > 1 ? (n + 1) / all.length : 1})`;
  const [prev, next] = root.querySelectorAll('.showcase__btn');
  if (prev) prev.disabled = n === 0;
  if (next) next.disabled = n === all.length - 1;
}

function nearest() {
  const tr = track();
  const all = slides();
  if (!tr || !all.length) return 0;
  const pad = parseFloat(getComputedStyle(tr).scrollPaddingLeft) || 0;
  const x = tr.scrollLeft + pad;
  let best = 0;
  let dist = Infinity;
  all.forEach((s, i) => {
    const d = Math.abs(s.offsetLeft - x);
    if (d < dist) { dist = d; best = i; }
  });
  if (tr.scrollLeft + tr.clientWidth >= tr.scrollWidth - 4) best = all.length - 1;
  return best;
}

function bindTrack() {
  const tr = track();
  if (!tr) return;
  let raf = 0;
  tr.addEventListener('scroll', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => { const n = nearest(); if (n !== active) setActive(n); });
  }, { passive: true });
  tr.addEventListener('keydown', (e) => {
    if (e.target !== tr && !tr.contains(e.target)) return;
    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(active + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(active - 1); }
    if (e.key === 'Home') { e.preventDefault(); goTo(0); }
    if (e.key === 'End') { e.preventDefault(); goTo(slides().length - 1); }
  });

  // Arrastrar con el mouse (en táctil ya desliza solo).
  let drag = null;
  tr.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('a,button')) return;
    drag = { x: e.clientX, left: tr.scrollLeft, moved: false, id: e.pointerId };
  });
  window.addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 6) {
      drag.moved = true;
      tr.classList.add('is-dragging');
      tr.setPointerCapture?.(drag.id);
    }
    if (drag.moved) tr.scrollLeft = drag.left - dx;
  });
  const end = () => {
    if (!drag) return;
    const moved = drag.moved;
    const dx = tr.scrollLeft - drag.left;
    drag = null;
    tr.classList.remove('is-dragging');
    if (moved) {
      const n = nearest();
      goTo(Math.abs(dx) > 60 && n === active ? active + Math.sign(dx) : n);
      tr.addEventListener('click', (ev) => { ev.preventDefault(); ev.stopPropagation(); }, { capture: true, once: true });
    }
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);
  setActive(0);
}

root?.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]');
  if (go) { goTo(active + Number(go.dataset.go)); return; }

  const f = e.target.closest('.filter__btn');
  if (f) {
    tag = f.dataset.tag || null;
    render();
    return;
  }

  const more = e.target.closest('[data-more]');
  if (more) {
    const panel = document.getElementById(more.getAttribute('aria-controls'));
    const open = more.getAttribute('aria-expanded') !== 'true';
    more.setAttribute('aria-expanded', String(open));
    more.textContent = t(open ? 'less' : 'more');
    if (panel) panel.hidden = !open;
    window.dispatchEvent(new Event('resize'));
    return;
  }

  const swap = e.target.closest('[data-swap]');
  if (swap) {
    swap.closest('.plate__stage')?.classList.toggle('is-swapped');
    return;
  }

  // Tocar una lámina vecina la trae al centro.
  const plate = e.target.closest('.plate');
  if (plate && !plate.classList.contains('is-active') && !e.target.closest('a')) {
    goTo(slides().indexOf(plate));
  }
});

document.addEventListener('click', (e) => {
  const b = e.target.closest('.lang-switch__btn');
  if (!b || !root) return;
  const next = b.dataset.lang === 'en' ? 'en' : 'es';
  if (next !== lang) { lang = next; render({ keepPosition: true }); }
});

async function load() {
  if (!root) return;
  lang = currentLang();
  try {
    const [p, m] = await Promise.all([
      fetch(asset('data/projects.json')).then((r) => { if (!r.ok) throw new Error('projects'); return r.json(); }),
      fetch(asset('data/media.json')).then((r) => (r.ok ? r.json() : {})).catch(() => ({})),
    ]);
    projects = [...p.filter((x) => x.slug === FIRST), ...p.filter((x) => x.slug !== FIRST)];
    media = m;
  } catch {
    root.innerHTML = `<p class="notice">${esc(t('error'))}</p>`;
    return;
  }
  render();
  const route = location.pathname.match(/^\/proyectos\/([^/]+)$/);
  if (route) {
    const i = projects.findIndex((x) => x.slug === decodeURIComponent(route[1]));
    if (i >= 0) {
      root.scrollIntoView({ block: 'start' });
      goTo(i, false);
    }
  }
}

load();
