# Harshal Tarwale — portfolio

Single-page portfolio for a Full Stack Developer & UI/UX Designer. Plain HTML, CSS and JavaScript — no framework or build step. Colours, column grid and the streaked-blinds motif come from the original Figma hero (`0a2qO6vKOabeZHGqpvtwVg`, node `187:103`).

## Preview

```sh
node server.cjs
```

Visit http://127.0.0.1:4173. Stop with Ctrl+C. (Opening `index.html` directly also works.)

## Page structure

| # | Section | What it does for a client |
|---|---------|---------------------------|
| — | Preloader | 0→100 counter in the fire gradient; shortened on repeat visits within a session. |
| — | Hero | Figma 187:103 layout (wordmark, two-line headline, buttons). Interactive WebGL “ember trail”: the original fire-streak artwork sits dim at 25% with a faint heat haze; the pointer leaves a glowing, streaked ember trail that reveals and refracts the artwork, and a slow ghost ember drifts when idle. Header shows only the nav until you scroll. |
| — | Tape marquee | Crossing tapes: what I build. Speed and direction follow scroll velocity. |
| 01 | About | 3D ID badge on a lanyard (React Bits Lanyard, three.js): its strap disappears up under the fire tape so it hangs from it; drag, throw, click to flip (back side has contact details). Statement sharpens from blur word by word; availability + live IST clock; count-up stats. |
| 02 | Services | Light “sheet” section. Rows fill on hover; a related project screenshot follows the cursor. |
| 03 | Selected work | Four stacked, sticky case cards (desktop + phone mockups of the live sites); “More builds” index with cursor previews. |
| 04 | Process | Pinned horizontal scroll with a progress line (stacks vertically on tablet/phone). |
| 05 | Why me | Bento grid: draggable Figma ↔ code compare, motion playground, checks, time zones, toolkit marquee. |
| 06 | Contact | Fire-gradient section; project brief composes a WhatsApp message (name, project type, timeline, idea). |
| — | Footer | Giant `harshal.t` wordmark rising letter by letter, live clock, links. |

## Design system

- **Colour:** ink `#000/#080806`, paper `#f1ede6`, fire gradient `#ffd400 → #ff9a00 → #ff5a14 → #e3200d → #8f0c0c → #2b1416` (from the brand reference).
- **Type:** Syne (display), Instrument Serif italic (accent words), JetBrains Mono (labels), Onest/Inter (UI/body). All self-hosted under `assets/`.
- **Buttons (`.btn`):** cream pill with a fire “ember” behind the arrow; on hover the ember floods the pill, the label rolls up letter by letter and the arrow swaps. Variants: `--fire` (default), `--ghost` (glass, floods cream), `--ink` (for the fire section, floods black), `--sm`, `--block`.
- **Screen sizes:** fixed text sizes and text widths are multiplied by `--fs` (`styles.css`): 1 up to 1799px, then 1.12 / 1.28 / 1.5 at 1800 / 2200 / 2800px, so big monitors don't look empty. The footer wordmark is sized in `app.js` to the real page width (scrollbar excluded).
- **Grid:** Figma column guides at 89 / 495 / 720 / 945 / 1349 px of 1440, drawn faintly behind dark sections (`.lined`).

## Files

- `index.html` — all markup.
- `styles.css` — base, header, social rail.
- `hero.css` — button system and hero layout.
- `hero-gl.js` — WebGL background (pauses off-screen, adapts resolution, falls back to `assets/background.webp`).
- `site.css` — every section after the hero, header, cursor, preloader, responsive rules.
- `app.js` — button letter split, WhatsApp brief, clocks, compare slider.
- `motion.js` — Lenis smooth scroll + GSAP ScrollTrigger/SplitText/ScrambleText: preloader, reveals, marquees, stacked cases, pinned process, previews, magnetic elements.
- `assets/work/` — screenshots of the live project sites (desktop 1440×900, mobile 390×844).
- `src/lanyard.js` — React Bits Lanyard ported to plain JS (`mountLanyard(container, options)`); physics and materials unchanged.
- `vendor/js/lanyard.bundle.min.js` — that module bundled with the parts of three.js 0.187 it uses (MIT, `vendor/three-LICENSE.md`); loaded only when the About section approaches.
- `assets/lanyard/` — badge front/back (1024×1440) and strap tile, rendered from HTML in the site's type and colours.
- `vendor/js/` — GSAP 3.15.1 (Standard “no charge” license, https://gsap.com/standard-license) and Lenis 1.3.29 (MIT, `vendor/lenis-LICENSE.md`).
- `qa/check.cjs` — browser QA (desktop, mobile overflow, reduced motion, nav, brief). Run with the server up: `node qa/check.cjs`.

## Accessibility & resilience

- All hidden/animated states are set by JavaScript, so content is readable with JS disabled.
- `prefers-reduced-motion`: no preloader, WebGL, smooth scroll, pinning or reveals; the hero shows the static background and the process section stacks.
- The compare slider is a native range input (keyboard + touch). The native cursor is used everywhere.

## Updating content

- Projects: edit the `.case` articles and `.index-list` items in `index.html`; drop new screenshots into `assets/work/`.
- Stats: the `data-count` values in the About section.

## Header nav

Over the hero the header is just the four links (About · Services · Work · Connect, in page order). Once you scroll it becomes a centred **island**: `harshal.t` in a small glass pill | the nav capsule | the “Let’s talk” fire button (wordmark and button slide out from behind the capsule; hidden ≤1100px where there's no room). The capsule is **clear glass**: no tint, only light on its edges; in Chromium the glass pieces refract what's behind them through SVG displacement filters (React Bits Glass Surface technique), elsewhere it's clear frosted glass. Labels switch to dark ink over light sections (`data-nav-light`). The active section is React Bits **Gooey Nav**: a translucent glass pill in the contact-section fire gradient that bursts into fire droplets and re-forms on the next item; it follows scroll (spy in `motion.js`) and clicks, and melts away where no link applies. All in `gooey-nav.js` (Gooey Nav shader/physics are the original, plus the gradient/translucency); styles in `site.css` → “Header”.

## Hero background

`hero-bg.js` mounts the React Bits **Dark Veil** (original code, `src/backgrounds/DarkVeil.jsx`) behind the hero, tinted red-orange to match the contact section. It reacts to the pointer. Without WebGL2 or with reduced motion, the ember trail (`hero-gl.js`) / static artwork is used. They run unchanged on a small React stand-in (`react-shim.js`). Tune brightness/colour in `veilProps()`; rebuild with `npm i esbuild@0.24` then `node src/backgrounds/build.cjs`.

## Rebuilding the lanyard

After editing `src/lanyard.js`, bundle it with three.js (any folder that has `three` installed):

```sh
npm i three@0.187.0
npx esbuild src/lanyard.js --bundle --minify --format=iife --target=es2020 --outfile=vendor/js/lanyard.bundle.min.js
```

Badge options (images, size, strap length, finish, breeze) are set in `app.js` → “About: ID badge on a lanyard”. React Bits code is MIT + Commons Clause (`vendor/react-bits-LICENSE.md`): fine to use on this site, not to resell as a component.
