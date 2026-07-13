# Diego Gaxiola — Portafolio

Portafolio profesional de **Diego Gaxiola**, Software Engineer full-stack (7+ años, AI-native).

Sitio **estático** (HTML + CSS + JS vanilla, sin build ni dependencias) desplegado en **GitHub Pages**.

**En vivo:** https://diegogaxi.github.io/diego-portfolio/

## Estructura

| Archivo | Rol |
|---|---|
| `index.html` | Página: hero, trayectoria, stack, vitrina, contacto |
| `style.css` | Estética risograph/retro-futurista, responsive (mobile/tablet/desktop) |
| `app.js` | Render de trayectoria y vitrina desde `data/*.json`, modal de detalle, efecto de impresión |
| `data/projects.json` | Snapshot de proyectos (repos públicos reales) |
| `data/timeline.json` | Snapshot de la trayectoria profesional |

## Despliegue

Cada push a `main` dispara el workflow `.github/workflows/deploy.yml`, que publica el sitio en GitHub Pages.

## Foto de perfil

La foto se sirve desde `diego-portrait.jpg` (en la raíz). Si el archivo no está presente, el hero muestra un monograma «DG» como respaldo.
