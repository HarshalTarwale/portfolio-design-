# 04 — Next.js porting guide

## Goal
Pixel- and motion-faithful port of this site to Next.js (App Router, TypeScript). Single page; static export is fine (no backend — the form opens WhatsApp). Deploy target e.g. Vercel.

## Suggested structure
```
portfolio-next/
  app/
    layout.tsx            fonts (next/font/local), metadata (copy from <head>), html class "js motion" handling, <Grain/>, <ScrollProgress/>, <Header/>, <SocialRail/>
    page.tsx              composes sections in order
    globals.css           ← styles.css + hero.css + site.css (start by pasting as-is; split later)
  components/
    Preloader, Header (+GooeyNav, GlassFilters), Hero (+DarkVeil), Tape, About (+Lanyard, Stats), Services, Work (+Case, IndexList),
    Process, Why (+Compare, Motion playground, Toolkit), Contact (+BriefForm), Footer (+Wordmark), Btn
  lib/ smooth-scroll (Lenis+GSAP), useReducedMotion, useInView/pause-offscreen
  data/ services.ts, cases.ts, process.ts, stats.ts, links.ts   ← extract from index.html
  public/ assets/ (fonts, work, lanyard, icons, background.webp)
```

## Porting order (each step testable against the design)
1. Scaffold + fonts + `globals.css` (paste the three stylesheets unchanged; keep the `--fs` scale and breakpoints) + static markup for all sections from `index.html`. Compare against the design at 1440 / 1920 / 2560 / 390 widths before adding motion.
2. Lenis + GSAP setup (single provider, `useGSAP`/`gsap.context` with cleanup, `ScrollTrigger.refresh` after fonts).
3. Preloader → hero entrance, reveals, marquees, counters.
4. Header island + scroll-spy (use IntersectionObserver/ScrollTrigger → state; pass `activeIndex` to GooeyNav).
5. Services/Work/Process (sticky stack, pinned horizontal scroll, previews).
6. WebGL: DarkVeil (use `src/backgrounds/DarkVeil.jsx` as-is, dynamic import `ssr:false`), Gooey Nav, Lanyard (dynamic import, mount when near viewport, dispose on unmount).
7. Contact form → WhatsApp, footer wordmark fit, social rail.
8. Perf + a11y + reduced-motion pass (see 03), then SEO (metadata, OG image, sitemap/robots, JSON-LD Person).

## Pitfalls
- **SSR/hydration:** anything touching `window`, WebGL, `matchMedia`, `sessionStorage` must run client-side only (`'use client'` + effects, `dynamic(..., {ssr:false})`). Don't SSR hidden/animated initial states that would flash or mismatch — set them in effects, or keep the `html.motion` class pattern.
- **GSAP cleanup & StrictMode:** every ScrollTrigger/Lenis/WebGL instance must be killed/disposed in effect cleanup; dev double-mount must not duplicate triggers or leak GL contexts (browsers cap ~16, and the owner already noticed lag).
- **Pinned section + other triggers:** pinning adds spacer height; triggers created before it measure wrong. Create the nav spy with lower refresh priority, or call `ScrollTrigger.refresh()` after all are created.
- **Fonts:** Syne variable + Instrument Serif (regular + italic) + JetBrains Mono + Onest/Inter — all local files; `font-display: swap`, preload Syne. Layout depends on Syne metrics, so wait for `document.fonts.ready` before SplitText and `refresh()`.
- **Images:** work screenshots are lazy 1440×900 JPGs with a `-m` mobile variant — use `next/image` (explicit width/height to avoid CLS) but keep the same visual sizing; hero `background.webp` is only the fallback/LCP image.
- **Glass nav:** SVG-filter `backdrop-filter` works in Chromium only; keep the feature detection and frosted fallback. Filters must be in the DOM (render a hidden `<svg>` with `<filter id>`s) before the CSS references them.
- **Footer wordmark fit:** size to the real container width (`clientWidth`, not `100vw`) — `100vw` includes the scrollbar and clipped the wordmark on big screens.
- **Smooth-scroll + anchor links:** route `#id` clicks through Lenis; keep `scroll-padding-top` and focus handling.
- Do **not** swap GSAP for Framer Motion or restyle with Tailwind unless the owner asks; port, don't redesign.

## Content updates after launch
Projects, services, process steps, stats live in `data/*.ts` (extracted from `index.html`). New project = add data + two screenshots (`name.jpg` 1440×900, `name-m.jpg` 390×844).

## Acceptance checklist
- [ ] Side-by-side with the design at 390 / 768 / 1024 / 1440 / 1920 / 2560: same layout, spacing, type, colours.
- [ ] No horizontal overflow on mobile; footer wordmark fully visible on all widths.
- [ ] Preloader → hero entrance works; hero never stays hidden; reduced-motion shows everything instantly.
- [ ] Header: plain links at top; island after scroll; stays visible; active pill follows scroll and clicks; glass refraction subtle; ink flips over Services.
- [ ] About: statement fully readable at mid-screen; badge drops gently, drags, flips; stats count up.
- [ ] Work cards stack; process pins horizontally on desktop, stacks on mobile; compare slider works with keyboard/touch.
- [ ] Form: empty name blocks; message contains name, type, timeline, idea; opens `https://wa.me/917028235485?text=…`.
- [ ] Lighthouse: Performance ≥ 90 mobile target, A11y ≥ 95, no console errors; GL contexts disposed on unmount/off-screen.
- [ ] External links `rel="noopener noreferrer"`.

## Using the existing QA script as a spec
`DESIGN/qa/check.cjs` is a Playwright smoke test (preloader gone, headline text, hero bg running, nav scroll+active, every section renders, lanyard goes live, form → WhatsApp URL, mobile no-overflow, reduced motion). Its Playwright path is hard-coded to the owner's machine — set `PLAYWRIGHT_MODULE` / `CHROME_PATH` env vars, point `URL` at the Next dev/prod server, and adapt selectors. Screenshots of the target look: `DESIGN/qa/*.png`.
