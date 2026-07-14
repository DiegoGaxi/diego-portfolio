# Diego Portfolio — Dev Master Prompt

## Qué es
Portafolio profesional de **Diego Gaxiola**, Software Engineer con 7+ años de experiencia full-stack / AI-native (EPAM/BBVA, Neoris, Fuentebuena, Agentcy). Presenta su trayectoria y sirve como **vitrina viva**: cada proyecto construido en AgentChain se publica aquí a medida que se completa, sin necesidad de redeploy manual (vía tabla `projects` en Postgres + API propia).

## Soul thesis
> Usarlo debe sentirse como hojear un fanzine técnico impreso en risógrafo en una imprenta de barrio en 1978 — tinta plana, grano, un registro que nunca calza perfecto — pero cuyo pulso es el de una terminal analógica que todavía cree, con optimismo, en el futuro del software.

## Dirección creativa (fusión de las dos lentes)
- **Risograph / duotone:** tinta plana de 2-3 colores sobre "papel" cálido, grano visible, desalineación de capas (misregistration) como elemento decorativo intencional, formas sólidas sin degradados.
- **Retro-futurismo refinado (70s/80s):** tipografía de terminal/CRT para labels y metadatos, glow sutil en acentos, optimismo analógico — nunca neón genérico ni cyberpunk cliché.
- **Momento firma:** al hacer scroll o hover sobre una tarjeta de proyecto, esta "se imprime" — un efecto de registro de tinta desalineada que se auto-corrige con un snap táctil (como una prensa terminando una pasada), acompañado de un indicador tipo VU-meter analógico que sube y se asienta. Es el único componente de este tipo en el sitio — no se repite en otro lugar para no diluirlo.

## Paleta (world_palette / style_guide, NO genérica)
- Papel (bg): `#F3EAD8` (crema cálido, textura de grano sutil)
- Tinta primaria (texto/estructura): `#1A1A18`
- Tinta teal (riso "pine"): `#1B3B36`
- Tinta naranja (riso "flame", acento CTA): `#C1440E`
- Tinta azul retro-CRT (glow/metadata): `#2B4570`
- Alerta/rojo riso: `#A8322D`
Prohibido azul/morado índigo por defecto, glassmorphism, y el esqueleto SaaS genérico (hero centrado → 3 cards → pricing).

## Tipografía
- Display/headlines: serif poster tipo **Fraunces** (peso 600-900, ligero contraste, sensación de imprenta).
- Metadata/labels/código: monoespaciada tipo **IBM Plex Mono** (terminal/CRT).
- Cuerpo: sans humanista tipo **Work Sans** o **Inter**.

## Stack técnico
- **Runtime:** Bun (obligatorio, NUNCA npm/node directo).
- **Backend:** Hono sobre Bun, TypeScript, sirve API + estáticos en un solo proceso.
- **Frontend:** Vite + TypeScript vanilla + GSAP (para el efecto de impresión/registro y ScrollTrigger), CSS con variables de diseño (tokens de arriba), sin framework pesado (no Next/React) — el sitio es mayormente estático con un puñado de fetches.
- **DB:** PostgreSQL 16 (user `postgres` / pass `pg`), acceso con `postgres.js` (SQL crudo, sin ORM pesado).
- **Puerto:** >10100 (asignado por `agentchain project server start`), NUNCA puertos prohibidos.

## Estructura de contenido (secciones/páginas)
1. **Home** — hero (nombre, rol, años, disponibilidad) + timeline de experiencia (EPAM/BBVA, Neoris, Fuentebuena, Agentcy) + stack de skills.
2. **Vitrina de proyectos** — grid de tarjetas alimentado desde `GET /api/projects`, con el efecto de impresión al hacer scroll/hover.
3. **Detalle de proyecto** — vista ampliada de un proyecto (`GET /api/projects/:slug`).
4. **Contacto** — enlaces (email, LinkedIn, GitHub) + footer editorial.

## Reglas de negocio clave
- Solo proyectos `status = 'published'` se muestran públicamente.
- Slugs únicos URL-safe, con sufijo numérico en colisión.
- Escritura de la API (`POST /api/projects`) protegida por bearer token estático (`ADMIN_API_TOKEN` en `.env`), nunca expuesto al frontend.

## Non-negotiables
- Accesibilidad WCAG AA real sobre la paleta duotone (validar contraste tinta/papel, no asumir).
- Performance: FCP < 1.5s en 3G rápido, sin frameworks pesados innecesarios.
- Nunca usar `.env` con secretos en el repo; nunca matar procesos por nombre, solo por PID de puerto asignado.
