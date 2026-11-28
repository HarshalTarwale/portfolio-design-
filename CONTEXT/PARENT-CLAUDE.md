# Harshal Tarwale portfolio — Next.js build

(Copy this file to the folder that contains `DESIGN/` and rename it to `CLAUDE.md`.)

## Layout of this workspace
- `DESIGN/` — the finished, working design (plain HTML/CSS/JS). **Read-only reference. Do not edit it** and do not build the Next.js app inside it.
- `portfolio-next/` — the Next.js app you are building (create it if missing).

## Before writing any code
Read, in order: `DESIGN/CONTEXT/README.md`, `01-overview-and-brand.md`, `02-sections-and-content.md`, `03-motion-and-effects.md`, `04-nextjs-porting-guide.md`. Source of truth is the code in `DESIGN/` (`index.html`, `styles.css`, `hero.css`, `site.css`, `app.js`, `motion.js`, `gooey-nav.js`, `hero-bg.js`, `src/`). Run it with `node DESIGN/server.cjs` → http://127.0.0.1:4173 to compare.

## Rules
- Faithful port: same layout, copy, colours, type, spacing, motion. Don't redesign, restyle or "improve" without asking.
- Keep GSAP + Lenis (not Framer Motion), keep the existing CSS (don't convert to Tailwind), keep the `--fs` big-screen scaling.
- Client-only for WebGL/three.js/GSAP; dispose everything on unmount (StrictMode-safe); pause WebGL off-screen; respect `prefers-reduced-motion`.
- Things removed on purpose (never re-add): custom cursor, hero cursor glow / mouse-following headline, other hero backgrounds (only Dark Veil), social tooltips, header hide-on-scroll, name on the ID card front.
- Work in the order in `04-nextjs-porting-guide.md`; verify each step against the design at 390 / 1440 / 1920 / 2560 widths.
