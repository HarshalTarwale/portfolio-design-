# Harshal Tarwale — portfolio

Single-page portfolio for a Full Stack Developer & UI/UX Designer. Plain HTML, CSS and JavaScript — no framework or build step. The hero is the Figma design (`0a2qO6vKOabeZHGqpvtwVg`, node `187:103`); everything below it extends that design's colours, type and column grid.

## Preview

```sh
node server.cjs
```

Visit http://127.0.0.1:4173. Stop with Ctrl+C. (Opening `index.html` directly also works.)

## Page structure

| # | Section | What it does for a client |
|---|---------|---------------------------|
| — | Preloader | 0→100 counter in the fire gradient; shortened on repeat visits within a session. |
| — | Hero (Figma) | Interactive Tech Text headline, glass CTAs, social rail. |
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
- **Type:** Syne (display, 400–800), Instrument Serif italic (accent words), JetBrains Mono (labels), Onest/Inter (UI/body). All self-hosted under `assets/`.
- **Grid:** Figma column guides at 89 / 495 / 720 / 945 / 1349 px of 1440, drawn faintly behind dark sections (`.lined`).

## Files

- `index.html` — all markup.
- `styles.css` — hero (from the Figma build) and base.
- `site.css` — every section after the hero, header, cursor, preloader, responsive rules.
- `app.js` — Tech Text hero, glass buttons, WhatsApp brief, clocks, compare slider.
- `motion.js` — Lenis smooth scroll + GSAP ScrollTrigger/SplitText/ScrambleText: preloader, reveals, marquees, stacked cases, pinned process, previews, magnetic elements, cursor.
- `tech-text.js` — browser adaptation of React Bits Tech Text (see `vendor/TechText.original.jsx`).
- `assets/work/` — screenshots of the live project sites (desktop 1440×900, mobile 390×844).
- `vendor/js/` — GSAP 3.15.1 (Standard “no charge” license, https://gsap.com/standard-license) and Lenis 1.3.29 (MIT, `vendor/lenis-LICENSE.md`).
- `qa/check.cjs` — browser QA (desktop, mobile overflow, reduced motion, nav, brief). Run with the server up: `node qa/check.cjs`.

## Accessibility & resilience

- All hidden/animated states are set by JavaScript, so content is readable with JS disabled.
- `prefers-reduced-motion`: no preloader, smooth scroll, pinning, cursor or reveals; the process section stacks.
- The compare slider is a native range input (keyboard + touch). Custom cursor only on fine pointers.

## Updating content

- Projects: edit the `.case` articles and `.index-list` items in `index.html`; drop new screenshots into `assets/work/`.
- Stats: the `data-count` values in the About section.
