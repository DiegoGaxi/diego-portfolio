// Portafolio de Diego Gaxiola — sitio estático (sin build). Datos desde ./data/*.json.
const START_DATE = new Date('2018-09-01');
const AVAILABLE = true;

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

function formatMonthYear(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' });
}

function yearsSince(start) {
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  const anniversary = new Date(now.getFullYear(), start.getMonth(), start.getDate());
  if (now < anniversary) years -= 1;
  return years;
}

function initHero() {
  const years = Math.max(yearsSince(START_DATE), 7);
  const yearsBadge = document.getElementById('years-badge');
  if (yearsBadge) yearsBadge.textContent = `${years}+ años`;

  const availabilityBadge = document.getElementById('availability-badge');
  if (availabilityBadge) {
    availabilityBadge.textContent = AVAILABLE ? 'Disponible para proyectos' : 'No disponible';
    availabilityBadge.classList.add(AVAILABLE ? 'badge--available' : 'badge--unavailable');
  }

  document.querySelectorAll('[data-scroll-target]').forEach((el) => {
    el.addEventListener('click', (e) => {
      const target = el.getAttribute('data-scroll-target');
      if (!target) return;
      const node = document.querySelector(target);
      if (node) {
        e.preventDefault();
        node.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
    // La imagen puede haber fallado ya (deferred module): si terminó sin dimensiones, es error.
    if (portrait.complete && portrait.naturalWidth === 0) applyMonogram();
  }
}

async function initTimeline() {
  const list = document.getElementById('timeline-list');
  if (!list) return;
  try {
    const entries = await fetchJson('/api/timeline', './data/timeline.json');
    list.innerHTML = entries
      .map((entry) => {
        const isCurrent = !entry.end_date;
        const dateRange = `${formatMonthYear(entry.start_date)} — ${
          entry.end_date ? formatMonthYear(entry.end_date) : 'Actualidad'
        }`;
        return `
          <li class="timeline-entry${isCurrent ? ' timeline-entry--current' : ''}">
            <div class="timeline-entry__header">
              <h3 class="timeline-entry__company">${entry.company}</h3>
              <span class="timeline-entry__role">${entry.role}</span>
              <span class="timeline-entry__dates">${dateRange}</span>
            </div>
            <ul class="timeline-entry__achievements">
              ${entry.achievements.map((a) => `<li class="achievement-bullet">${a}</li>`).join('')}
            </ul>
            <div class="chip-row">
              ${entry.tech_stack.map((t) => `<span class="tech-chip">${t}</span>`).join('')}
            </div>
          </li>
        `;
      })
      .join('');
  } catch {
    list.innerHTML = '<li class="empty-state">No se pudo cargar la trayectoria.</li>';
  }
}

let allProjects = [];
let activeTag = null;
let lastFocusedCard = null;

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
      (p) => `
      <button class="project-card" data-slug="${p.slug}" aria-label="Ver detalle de ${p.title}">
        <div class="project-card__layer project-card__layer--teal"></div>
        <div class="project-card__layer project-card__layer--orange"></div>
        <div class="vu-meter">
          ${Array.from({ length: 5 }, () => '<span class="vu-meter__bar"></span>').join('')}
        </div>
        ${p.cover_image_url ? `<img class="project-card__cover" src="${p.cover_image_url}" alt="" loading="lazy" />` : '<div class="project-card__cover"></div>'}
        <h3 class="project-card__title">${p.title}</h3>
        <p class="project-card__summary">${p.summary}</p>
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

    titleEl.textContent = project.title;
    summaryEl.textContent = project.summary;
    descEl.textContent = project.description_long ?? '';
    tagsEl.innerHTML = project.tags.map((t) => `<span class="tech-chip">${t}</span>`).join('');
    repoEl.href = project.repo_url ?? '#';
    repoEl.style.display = project.repo_url ? 'inline-block' : 'none';
    demoEl.href = project.demo_url ?? '#';
    demoEl.style.display = project.demo_url ? 'inline-block' : 'none';
  } catch {
    titleEl.textContent = 'Proyecto no encontrado';
    summaryEl.textContent = '';
    descEl.innerHTML = '<span class="project-detail__error">Este proyecto no existe o ya no está publicado.</span>';
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

initHero();
initTimeline();
initVitrina();
initDetailModal();
