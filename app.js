// Portafolio de Diego Gaxiola — sitio estático (sin build). Datos desde ./data/*.json.
const START_DATE = new Date('2018-09-01');
const AVAILABLE = true;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// En un hosting estático (GitHub Pages) no hay API: se lee el snapshot JSON.
// Si algún día se sirve con backend Hono, intenta primero la API.
async function fetchJson(apiPath, staticPath) {
  try {
    const res = await fetch(apiPath);
    const ct = res.headers.get('content-type') ?? '';
    if (res.ok && ct.includes('application/json')) return await res.json();
  } catch {
    /* sin backend: usamos el snapshot estático */
  }
  const res = await fetch(staticPath);
  return await res.json();
}

function formatMonthYear(dateStr, lang) {
  const [y, m, day] = dateStr.slice(0, 10).split('-').map(Number);
  const d = new Date(y, m - 1, day);
  const locale = lang === 'en' ? 'en-US' : 'es-MX';
  return d.toLocaleDateString(locale, { month: 'short', year: 'numeric' });
}

/* ---- i18n: strings de UI + selector de idioma ---- */
let I18N = {};
let lang = 'es';

function initI18n() {
  try {
    const saved = localStorage.getItem('lang');
    if (saved === 'es' || saved === 'en') lang = saved;
  } catch {}
  if (!I18N[lang]) lang = 'es';

  const apply = () => {
    const dict = I18N[lang] || {};
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (dict[key] != null) el.textContent = dict[key];
    });
    document.querySelectorAll('.lang-switch__btn').forEach((b) => {
      const active = b.dataset.lang === lang;
      b.setAttribute('aria-pressed', String(active));
      b.classList.toggle('is-active', active);
    });
  };

  document.querySelectorAll('.lang-switch__btn').forEach((b) => {
    b.addEventListener('click', () => {
      lang = b.dataset.lang;
      try { localStorage.setItem('lang', lang); } catch {}
      apply();
      renderTimeline();
      renderGrid();
    });
  });

  apply();
}

function t(key) {
  return (I18N[lang] && I18N[lang][key]) || key;
}

function yearsSince(start) {
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  const anniversary = new Date(now.getFullYear(), start.getMonth(), start.getDate());
  if (now < anniversary) years -= 1;
  return years;
}

/* ---- reveal on scroll (compartido) ---- */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
);

function observeReveals(nodes) {
  nodes.forEach((n) => revealObserver.observe(n));
}

/* ---- toast ---- */
let toastTimer;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.hidden = false;
  toast.textContent = msg;
  // forzar reflow para que la transición de opacidad se dispare al añadir .show
  void toast.offsetWidth;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2400);
}

/* ---- tema claro / oscuro ---- */
function initTheme() {
  const toggle = document.getElementById('theme-toggle');
  const label = toggle?.querySelector('.theme-toggle__label');
  const sync = () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (toggle) toggle.setAttribute('aria-pressed', String(dark));
    if (label) label.textContent = dark ? t('theme.night') : t('theme.day');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#16140f' : '#f3ead8');
  };
  sync();
  toggle?.addEventListener('click', () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    const next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem('theme', next);
    } catch {}
    sync();
  });
}

/* ---- scroll: progreso, masthead, nav activa ---- */
function initScroll() {
  const bar = document.getElementById('scroll-progress-bar');
  const masthead = document.getElementById('masthead');
  const navLinks = Array.from(document.querySelectorAll('.masthead__nav a[data-nav]'));
  const targets = navLinks
    .map((a) => ({ link: a, section: document.querySelector(a.getAttribute('href')) }))
    .filter((t) => t.section);

  let ticking = false;
  const update = () => {
    ticking = false;
    const doc = document.documentElement;
    const max = doc.scrollHeight - doc.clientHeight;
    const pct = max > 0 ? (doc.scrollTop / max) * 100 : 0;
    if (bar) bar.style.width = pct.toFixed(2) + '%';
    if (masthead) masthead.classList.toggle('masthead--scrolled', doc.scrollTop > 8);

    const line = doc.scrollTop + 90;
    let active = null;
    targets.forEach((t) => {
      if (t.section.offsetTop <= line) active = t.link;
    });
    navLinks.forEach((a) => a.classList.toggle('is-active', a === active));
  };

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

/* ---- retrato reactivo al puntero (firma de marca) ---- */
function initPortrait() {
  const fig = document.getElementById('hero-portrait');
  if (!fig || reduceMotion || !finePointer) return;
  fig.addEventListener('pointermove', (e) => {
    const r = fig.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 2 - 1;
    const y = ((e.clientY - r.top) / r.height) * 2 - 1;
    fig.style.setProperty('--px', x.toFixed(3));
    fig.style.setProperty('--py', y.toFixed(3));
  });
  fig.addEventListener('pointerleave', () => {
    fig.style.setProperty('--px', '0');
    fig.style.setProperty('--py', '0');
  });
}

function initHero() {
  const years = Math.max(yearsSince(START_DATE), 7);
  const yearsBadge = document.getElementById('years-badge');
  if (yearsBadge) yearsBadge.textContent = `${years}+ ${t('hero.yearsUnit')}`;

  const availabilityBadge = document.getElementById('availability-badge');
  if (availabilityBadge) {
    availabilityBadge.textContent = AVAILABLE ? t('hero.available') : t('hero.unavailable');
    availabilityBadge.classList.add(AVAILABLE ? 'badge--available' : 'badge--unavailable');
  }

  document.querySelectorAll('[data-scroll-target]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const target = el.getAttribute('data-scroll-target');
      if (!target) return;
      const node = document.querySelector(target);
      if (node) {
        e.preventDefault();
        node.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  });

  const footerYear = document.getElementById('footer-year');
  if (footerYear) footerYear.textContent = String(new Date().getFullYear());

  // Si la foto no está disponible, mostramos un monograma riso en vez de imagen rota.
  const portrait = document.querySelector('.hero__portrait-img');
  if (portrait) {
    const applyMonogram = () => {
      portrait.onerror = null;
      portrait.style.filter = 'none';
      portrait.src =
        'data:image/svg+xml,' +
        encodeURIComponent(
          "<svg xmlns='http://www.w3.org/2000/svg' width='400' height='400'><rect width='400' height='400' fill='#1b3b36'/><text x='200' y='250' font-family='Georgia, serif' font-weight='700' font-size='190' fill='#f3ead8' text-anchor='middle'>DG</text></svg>"
        );
    };
    portrait.addEventListener('error', applyMonogram, { once: true });
    if (portrait.complete && portrait.naturalWidth === 0) applyMonogram();
  }
}

/* ---- copiar email ---- */
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    /* fallback legacy */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function initCopyEmail() {
  const btn = document.getElementById('copy-email');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const email = btn.dataset.email;
    const ok = await copyText(email);
    showToast(ok ? t('detail.emailCopied') + email : email);
  });
}

async function initTimeline() {
  const list = document.getElementById('timeline-list');
  if (!list) return;
  window.__timelineEntries = await fetchJson('/api/timeline', './data/timeline.json');
  renderTimeline();
}

function renderTimeline() {
  const list = document.getElementById('timeline-list');
  if (!list || !window.__timelineEntries) return;
  const entries = window.__timelineEntries;
  try {
    list.innerHTML = entries
      .map((entry, i) => {
        const isCurrent = !entry.end_date;
        const role = entry.role?.[lang] ?? entry.role;
        const achievements = entry.achievements?.[lang] ?? entry.achievements ?? [];
        const dateRange = `${formatMonthYear(entry.start_date, lang)} — ${
          entry.end_date ? formatMonthYear(entry.end_date, lang) : t('timeline.current')
        }`;
        return `
          <li class="timeline-entry${isCurrent ? ' timeline-entry--current' : ''}" style="--reveal-delay: ${
          i * 90
        }ms">
            <div class="timeline-entry__header">
              <h3 class="timeline-entry__company">${entry.company}</h3>
              <span class="timeline-entry__role">${role}</span>
              <span class="timeline-entry__dates">${dateRange}</span>
            </div>
            <ul class="timeline-entry__achievements">
              ${achievements.map((a) => `<li class="achievement-bullet">${a}</li>`).join('')}
            </ul>
            <div class="chip-row">
              ${entry.tech_stack.map((tech) => `<span class="tech-chip">${tech}</span>`).join('')}
            </div>
          </li>
        `;
      })
      .join('');
    observeReveals(list.querySelectorAll('.timeline-entry'));
  } catch {
    list.innerHTML = `<li class="empty-state">${t('timeline.error')}</li>`;
  }
}

let allProjects = [];
let activeTag = null;
let lastFocusedCard = null;

function attachTilt(card) {
  if (reduceMotion || !finePointer) return;
  card.addEventListener('pointermove', (e) => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 2 - 1;
    const y = ((e.clientY - r.top) / r.height) * 2 - 1;
    card.style.setProperty('--tiltY', (x * 4).toFixed(2) + 'deg');
    card.style.setProperty('--tiltX', (-y * 4).toFixed(2) + 'deg');
  });
  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--tiltX', '0deg');
    card.style.setProperty('--tiltY', '0deg');
  });
}

function renderGrid() {
  const grid = document.getElementById('projects-grid');
  const emptyState = document.getElementById('empty-state');
  if (!grid || !emptyState) return;

  if (allProjects.length === 0) {
    grid.innerHTML = '';
    emptyState.hidden = false;
    return;
  }
  emptyState.hidden = true;

  const visible = activeTag ? allProjects.filter((p) => p.tags.includes(activeTag)) : allProjects;

  grid.innerHTML = visible
    .map(
      (p, i) => `
      <button class="project-card" data-slug="${p.slug}" style="--i: ${i}" aria-label="Ver detalle de ${p.title[lang] ?? p.title}">
        <span class="project-card__plate">Nº ${String(i + 1).padStart(2, '0')}</span>
        <div class="project-card__layer project-card__layer--teal"></div>
        <div class="project-card__layer project-card__layer--orange"></div>
        <div class="vu-meter">
          ${Array.from({ length: 5 }, () => '<span class="vu-meter__bar"></span>').join('')}
        </div>
        ${p.cover_image_url ? `<img class="project-card__cover" src="${p.cover_image_url}" alt="" loading="lazy" />` : '<div class="project-card__cover"></div>'}
        <h3 class="project-card__title">${p.title[lang] ?? p.title}</h3>
        <p class="project-card__summary">${p.summary[lang] ?? p.summary}</p>
        <div class="chip-row">
          ${p.tags.map((t) => `<span class="tech-chip">${t}</span>`).join('')}
        </div>
      </button>
    `
    )
    .join('');

  grid.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('click', () => openDetail(card.dataset.slug, card));
    card.addEventListener('mouseenter', () => triggerPrint(card));
    attachTilt(card);
    observer.observe(card);
  });
}

// Efecto de impresión/registro: la clase .printing dispara las animaciones CSS (misregister + VU).
function triggerPrint(card) {
  if (card.classList.contains('printing')) return;
  card.classList.add('printing');
  window.setTimeout(() => card.classList.remove('printing'), 700);
}

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        triggerPrint(entry.target);
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.3 }
);

function renderTagFilter() {
  const filter = document.getElementById('tag-filter');
  if (!filter) return;
  const tags = Array.from(new Set(allProjects.flatMap((p) => p.tags)));
  filter.innerHTML = tags
    .map((t) => `<button class="tag-chip" data-tag="${t}" aria-pressed="false">${t}</button>`)
    .join('');

  filter.querySelectorAll('.tag-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const tag = chip.dataset.tag;
      const isActive = activeTag === tag;
      filter.querySelectorAll('.tag-chip').forEach((c) => c.setAttribute('aria-pressed', 'false'));
      activeTag = isActive ? null : tag;
      if (!isActive) chip.setAttribute('aria-pressed', 'true');
      renderGrid();
    });
  });
}

async function initVitrina() {
  try {
    allProjects = await fetchJson('/api/projects', './data/projects.json');
  } catch {
    allProjects = [];
  }
  renderTagFilter();
  renderGrid();
}

async function openDetail(slug, originCard) {
  lastFocusedCard = originCard;
  const modal = document.getElementById('project-detail');
  const titleEl = document.getElementById('detail-title');
  const summaryEl = document.getElementById('detail-summary');
  const descEl = document.getElementById('detail-description');
  const tagsEl = document.getElementById('detail-tags');
  const repoEl = document.getElementById('detail-repo');
  const demoEl = document.getElementById('detail-demo');

  modal.hidden = false;
  document.body.style.overflow = 'hidden';

  try {
    let project;
    const res = await fetch(`/api/projects/${slug}`);
    const ct = res.headers.get('content-type') ?? '';
    if (res.ok && ct.includes('application/json')) {
      project = await res.json();
    } else {
      // Sin backend (GitHub Pages): resolvemos desde el snapshot ya cargado.
      const found = allProjects.find((p) => p.slug === slug);
      if (!found) throw new Error('not_found');
      project = found;
    }

    titleEl.textContent = project.title?.[lang] ?? project.title;
    summaryEl.textContent = project.summary?.[lang] ?? project.summary;
    descEl.textContent = (project.description_long?.[lang] ?? project.description_long) ?? '';
    tagsEl.innerHTML = project.tags.map((t) => `<span class="tech-chip">${t}</span>`).join('');
    repoEl.href = project.repo_url ?? '#';
    repoEl.style.display = project.repo_url ? 'inline-block' : 'none';
    demoEl.href = project.demo_url ?? '#';
    demoEl.style.display = project.demo_url ? 'inline-block' : 'none';
  } catch {
    titleEl.textContent = t('detail.notFound');
    summaryEl.textContent = '';
    descEl.innerHTML = `<span class="project-detail__error">${t('detail.notFoundDesc')}</span>`;
    tagsEl.innerHTML = '';
    repoEl.style.display = 'none';
    demoEl.style.display = 'none';
  }

  const closeBtn = modal.querySelector('.project-detail__close');
  if (closeBtn) closeBtn.focus();
}

function closeDetail() {
  const modal = document.getElementById('project-detail');
  modal.hidden = true;
  document.body.style.overflow = '';
  if (window.location.pathname.endsWith('/proyectos')) {
    window.history.pushState({}, '', './');
  }
  if (lastFocusedCard) lastFocusedCard.focus();
}

function initDetailModal() {
  const modal = document.getElementById('project-detail');
  modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeDetail));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.hidden) closeDetail();
  });
}

async function boot() {
  // Carga el diccionario de idiomas primero; initI18n aplica ES por defecto.
  try {
    I18N = await fetchJson('/api/i18n', './data/i18n.json');
  } catch {
    I18N = {};
  }
  initI18n();
  initTheme();
  initScroll();
  initHero();
  initPortrait();
  initCopyEmail();
  observeReveals(document.querySelectorAll('[data-reveal]'));
  initTimeline();
  initVitrina();
  initDetailModal();
}

boot();
