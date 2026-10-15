# Diego Gaxiola — Portafolio

Portafolio profesional de **Diego Gaxiola**, Software Engineer full-stack (7+ años, AI-native).

Sitio **estático** desplegado en **GitHub Pages**.

**En vivo:** https://diegogaxi.github.io/diego-portfolio/

## Qué hay aquí

Este repositorio solo contiene el sitio ya compilado (`index.html`, `assets/`, `data/`, `projects/`, `cv/`). El código fuente
(Vite + TypeScript, GSAP y Three.js, con una API Hono + PostgreSQL para la versión con servidor) vive en el proyecto local y se
compila para esta versión con `bun run build:pages`; `bun run deploy:pages` lo compila y lo publica aquí.

| Ruta | Contenido |
|---|---|
| `index.html`, `assets/` | Página y su código (escena 3D, parallax y animaciones) |
| `data/*.json` | Proyectos, trayectoria, textos ES/EN y capturas de cada app |
| `projects/<proyecto>/` | Dos capturas reales de cada app |
| `cv/` | CV en español e inglés (PDF) |
| `diego-portrait.jpg` | Foto de perfil |

## Despliegue

Cada push a `main` dispara la compilación automática de GitHub Pages («pages build and deployment»).

En esta versión estática no hay base de datos: los datos salen de `data/*.json`. Dos cosas sí son dinámicas y llaman al servidor del
portafolio publicado con Lienox (`https://diego.lienox.com`, fijado al compilar con `VITE_BOOKING_API`):

- **La agenda de citas**: si el servidor no responde, ofrece escribir por correo.
- **La medición de visitas** (anónima: sin cookies, sin IP, sin nombre; respeta «no rastrear»): si el servidor no responde, simplemente no mide.
