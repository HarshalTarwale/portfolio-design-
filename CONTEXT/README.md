# CONTEXT — start here

This folder explains the finished **design** of Harshal Tarwale's portfolio so it can be rebuilt in **Next.js** with as little guessing as possible.

The design is a working, polished, plain HTML/CSS/JS site (the parent folder). **It is the source of truth: if anything here disagrees with the code, the code wins.** The goal of the Next.js build is a faithful port — same look, same motion, same copy — with a proper component structure, SEO and performance.

## Read in this order

| File | What it gives you |
|------|-------------------|
| `01-overview-and-brand.md` | Who/what the site is for, brand, colours, type, tokens, tech used, the big-screen scaling rule |
| `02-sections-and-content.md` | Every section top to bottom: purpose, content, behaviour, where it lives in the code |
| `03-motion-and-effects.md` | Every animation / WebGL / interactive effect, how it works, what to keep, performance rules |
| `04-nextjs-porting-guide.md` | Recommended Next.js structure, what to port how, pitfalls, acceptance checklist |
| `PARENT-CLAUDE.md` | Ready-made `CLAUDE.md` — copy it to the folder that holds both `DESIGN/` and the Next.js code |

## Folder map of the design (this repo)

```
index.html        all markup + copy (single page)
styles.css        :root tokens (--fs scale), base, social rail
hero.css          hero layout + the .btn button system
site.css          every other section, header/nav, preloader, responsive rules
app.js            button letter-split, WhatsApp brief, clocks, compare slider, lanyard loader, footer wordmark fit
motion.js         Lenis + GSAP ScrollTrigger/SplitText/ScrambleText: all scroll/reveal/pin animation
hero-bg.js        mounts the Dark Veil WebGL hero background
hero-gl.js        ember-trail WebGL fallback hero (no-WebGL2 / reduced motion)
gooey-nav.js      Gooey Nav (WebGL metaball pill) + glass-refraction filters for the header
src/              un-minified sources: lanyard.js (three.js badge), backgrounds/DarkVeil.jsx (+build)
vendor/js/        gsap 3.15, ScrollTrigger, SplitText, ScrambleText, lenis, bundled lanyard + veil
assets/           fonts, hero art, social icons, lanyard card images, work screenshots (desktop + -m mobile)
qa/check.cjs      Playwright smoke test of the whole page (see 04 for how to reuse)
server.cjs        tiny static server: `node server.cjs` → http://127.0.0.1:4173
README.md         design-side docs (overlaps with this folder; this folder is the handoff version)
```

## Suggested first message to Claude (in the folder that holds both folders)

> The complete design is in `DESIGN/` (a working HTML/CSS/JS site). Read `DESIGN/CONTEXT/README.md` and the files it lists first, then build the Next.js version in `portfolio-next/` as a faithful port. Open `DESIGN/index.html` in a browser (`node DESIGN/server.cjs`) whenever you need to compare — it is the reference. Don't redesign anything; ask me before changing look, copy or motion.
