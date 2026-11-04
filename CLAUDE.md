# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Reglas de trabajo

- Responde siempre en español.
- Antes de usar una librería, consulta su documentación actual con Context7.
- Cuando termines un cambio en la web, pruébala con Playwright, revisa los errores de la consola y arréglalos hasta que funcione.
- No des una tarea por terminada sin haberla probado.

## What this is

A static website proposal for La Chulería, a bar & restaurant in Valdemoro. It is **not the official site** yet: every page has `noindex, nofollow` and `robots.txt` disallows everything until the restaurant approves it. `LEEME.md` is the README (in Spanish) and holds the pending-data table, the go-live checklist and the design rationale; keep it in sync when behaviour or file locations change.

Everything is in Spanish: page copy, code identifiers, comments and commit messages (short, descriptive Spanish sentences). Keep that convention.

## Running, building, deploying

- Plain HTML/CSS/JS. No package manager, no build step, no linter, no tests.
- Preview by opening `index.html` in a browser (needs internet for Google Fonts, GSAP from jsDelivr and the photos), or serve the folder, e.g. `python3 -m http.server` and open `http://localhost:8000/`. The README suggests VS Code Live Server.
- Published at `https://alejandromedranonavidades-netizen.github.io/la-chuleria/`. **GitHub Pages serves the `gh-pages` branch**, so a change is live only once it is also on `gh-pages` (today `main` and `gh-pages` point at the same commit).

## Architecture

**`js/datos.js` is the single source of truth.** It defines globals (`RESTAURANTE`, `CATEGORIAS`, `TITULOS_CATEGORIA`, `ETIQUETAS`, `FOTOS_WEB`, `FOTOS`, `PLATOS`, `BEBIDAS`) with contact info, opening hours, kitchen hours, reservation rules, the full menu and legal data. Values marked `PENDIENTE` are unconfirmed. Content changes should go here, not into the HTML.

- Hours are arrays per weekday indexed 0 (Sunday) to 6 (Saturday), like `Date.getDay()`. Closing after midnight is written by adding 24 (`"25:00"` = 1:00). `cocina` (kitchen hours) drives the time slots offered in the reservation form, together with `reservas.*`.
- Dishes reference photos by key into `FOTOS`; URLs are built as `FOTOS_WEB + ruta + "-" + tamaño + "." + (ext || "jpg")` (`urlFoto` in `main.js`), producing responsive `srcset`s. Photos are currently hotlinked from the restaurant's WordPress site. A dish without `foto` renders a green placeholder with its name.

**Script loading.** Every page loads, all with `defer` and in this order: `datos.js` → `main.js` → `cookies.js` → the page script (`inicio.js`, `carta.js`, `plato.js`, `reservas.js`) → GSAP 3.13 (+ ScrollTrigger, SplitText) from jsDelivr → `animaciones.js`. Scripts share globals; there are no modules. Order matters because later scripts call functions defined in earlier ones.

**`js/main.js`** holds shared helpers (time math `aMinutos`/`aHora`, `formatoPrecio`, `buscarPlato`, photo HTML builders `fotoPlato`/`filaCarta`) and runs on every page: fills the DOM from data attributes, paints open/closed status and hours, builds the header submenus, the Google rating seal and the floating call/WhatsApp button. HTML hooks it fills:
- `data-dato="telefono"` (dotted paths allowed, e.g. `valoracion.nota`), `data-enlace="telefono|email|mapa|glovo…"`, `data-legal="nif"`
- `data-categorias`, `data-horario-corto` for the submenu content

**Page scripts.** `carta.js` renders the full menu with search and injects the menu JSON-LD; `plato.js` renders a dish page from `plato.html?id=<plato.id>`, setting its own title/meta and JSON-LD; `reservas.js` handles the reservation form (honeypot, minimum fill time, submit rate limit) and posts to Formspree when `RESTAURANTE.reservas.formspree` is set, otherwise runs in demo mode. `cookies.js` shows the consent banner and only loads GA4 and the Google Map after consent.

**Animations** (`animaciones.js`) are progressive enhancement: the site must look complete with GSAP missing or with `prefers-reduced-motion`. Native scroll is never hijacked.

**Duplicated markup.** The header, nav with submenus, footer and `<head>` meta (title, description, Open Graph, robots) are copied into each of the 8 HTML pages. A change to navigation, footer or meta tags has to be repeated in every page. The restaurant JSON-LD (with hours) lives inline in `index.html` and must be updated by hand when `horario` changes.

**CSS.** All styles are in `css/estilos.css`, organised by the numbered index at the top of the file; colours, fonts and sizes are variables in section 1. Design rules described in `LEEME.md` matter here: red is used only for the "Reservar mesa" call to action, corners are 2 px, the logo circle is the only ornament, and text contrast must stay above 4.5:1.

**SEO files.** `sitemap.xml` lists the pages and every dish URL (`plato.html?id=…`); add or remove entries when dishes in `PLATOS` change. Canonical URLs in the sitemap and meta tags use the future domain `https://lachuleria.es`, while `og:image` points at the GitHub Pages URL until go-live.
