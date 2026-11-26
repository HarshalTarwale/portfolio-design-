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
| 01 | About | Statement sharpens from blur word by word; ID card with live IST clock; count-up stats. |
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
- `vendor/js/` — GSAP 3.15.1 (Standard “no charge” license, https://gsap.com/standard-license) and Lenis 1.3.29 (MIT, `vendor/lenis-LICENSE.md`).
- `qa/check.cjs` — browser QA (desktop, mobile overflow, reduced motion, nav, brief). Run with the server up: `node qa/check.cjs`.

## Accessibility & resilience

- All hidden/animated states are set by JavaScript, so content is readable with JS disabled.
- `prefers-reduced-motion`: no preloader, WebGL, smooth scroll, pinning or reveals; the hero shows the static background and the process section stacks.
- The compare slider is a native range input (keyboard + touch). The native cursor is used everywhere.

## Updating content

- Projects: edit the `.case` articles and `.index-list` items in `index.html`; drop new screenshots into `assets/work/`.
- Stats: the `data-count` values in the About section.
