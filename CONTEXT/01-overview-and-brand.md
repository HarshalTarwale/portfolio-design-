# 01 — Overview & brand

## The project
- **Owner:** Harshal Tarwale — Full Stack Developer & UI/UX Designer, based in **Nagpur, India** (IST). Works for clients in India, Dubai/UAE and the UK.
- **Purpose:** a bold single-page portfolio whose only job is to **win freelance clients**. Every decision favours "impressive in the first 5 seconds" and "easy to start a conversation".
- **Primary conversion:** the Contact "project brief" form, which composes a prepared **WhatsApp message** (no backend). Secondary: "Let's talk" button, social links.
- **Pitch line:** "Let's make your Website iconic." / "One person. Zero handoff." (design + code by the same person).
- **Contact facts (used in code):** WhatsApp `https://wa.me/917028235485` · LinkedIn `https://www.linkedin.com/in/harshaltarwale/` · Instagram `https://www.instagram.com/harshal.tarwale/` · GitHub `https://github.com/HarshalTarwale`.
- Original hero layout came from Figma file `0a2qO6vKOabeZHGqpvtwVg`, node `187:103` (colours, column grid, streaked-blinds motif).

## Look & feel (one paragraph)
Black-and-white editorial layout with a single loud accent: a **fire gradient** (yellow → orange → red → near-black). Huge Syne display type with italic serif accent words, mono labels, generous space, grain overlay, glassy UI, WebGL moments (hero veil, glass nav, 3D ID badge). Quiet and "clean professional" in the hero (no cursor glow, no cursor-following headline) — the user explicitly rejected those.

## Design tokens (source: `site.css` `:root`, `styles.css` `:root`)
| Token | Value |
|-------|-------|
| `--fire` | `linear-gradient(100deg,#ffd400 0%,#ff9a00 17%,#ff5a14 36%,#e3200d 55%,#8f0c0c 77%,#2b1416 100%)` |
| `--fire-text` | `linear-gradient(95deg,#ffd23a 0%,#ff8a1e 30%,#ff4a17 60%,#e3200d 100%)` |
| ink / paper | `--ink #080806`, `--ink-2 #0e0d0b`, `--ink-3 #141311`, body bg `#000`; `--paper #f8f8f5`, `--paper-2 #f1ede6` |
| accent | `--accent #ff813f`, `--hot #ff5a1f`; selection `#ff6a1f` |
| text | `--text-dim #a19e96`, `--muted #999992`, labels `#8f8c84` |
| fonts | `--display` Syne (variable, 700/800), `--serif` Instrument Serif (italic accents), `--mono` JetBrains Mono (labels), `--ui` Onest → Inter (body/UI). **All self-hosted** (`assets/fonts/*.woff2`, `assets/fonts.css`, licences in `vendor/`) → use `next/font/local`. |
| easing | `--ease-out: cubic-bezier(.22,1,.36,1)` |
| radius | `--radius-xl: 36px` |
| layout | `--gutter: 6.1vw` (8vw ≤1100px, 22px ≤650px) |

Common type patterns: `.display` = Syne 700, `clamp(46px, 7.2vw, 138px)`, line-height .93, letter-spacing -.045em; `<em>` inside it switches to Instrument Serif italic 1.1em. `.label` = mono 11px uppercase .07em tracking.

## ⚠ Screen-size scaling rule (`--fs`) — keep it
`styles.css` defines `--fs: 1` and raises it on big monitors: **1.12 @ ≥1800px, 1.28 @ ≥2200px, 1.5 @ ≥2800px** (and widens `--gutter` to a centred ~1580px×fs column). Fixed px sizes in the CSS are written `calc(Npx * var(--fs))`. This is why the site doesn't look empty on 27" / 4K screens. Breakpoints used: 2800 / 2200 / 1800 / 1100 / 650 px.

## Tech used in the design (and what to do with it in Next.js)
| In the design | In Next.js |
|---|---|
| Plain HTML/CSS/JS, no build | Next.js App Router + TypeScript; keep CSS (modules or global) — don't rewrite styling in a new system unless asked |
| GSAP 3.15 + ScrollTrigger + SplitText + ScrambleText (now free under GSAP's standard licence) | `gsap` from npm (+ `@gsap/react` `useGSAP`); the plugins ship in the npm package |
| Lenis smooth scroll | `lenis` npm, wired to GSAP ticker/ScrollTrigger exactly as in `motion.js` |
| three.js lanyard (`src/lanyard.js`, bundled) | React Bits **Lanyard** is natively React (`@react-three/fiber`, `@react-three/rapier`, `meshline`) — original component is the upstream of this port; load client-side, lazily |
| Dark Veil WebGL (`src/backgrounds/DarkVeil.jsx`, original React Bits React code) | Use `DarkVeil.jsx` directly as a client component with `ogl` |
| Gooey Nav (`gooey-nav.js`, vanilla WebGL port) | Port to a client component (keep the shader + droplet physics; see 03) |
| Glass refraction (SVG `feDisplacementMap` in `gooey-nav.js`) | Same technique, client-only, Chromium only; frosted fallback elsewhere |
| React Bits licence | MIT + Commons Clause — fine to use on this site, not to resell as a component (`vendor/react-bits-LICENSE.md`) |

## Progressive enhancement principles already baked in
- Content is readable without JS (animated hidden states are set by JS via `html.js` / `html.motion` classes). In Next.js, avoid flash-of-hidden content: set initial states in effects/`useGSAP`, not in SSR markup, or use the same `html.motion` class approach.
- `prefers-reduced-motion`: no preloader, no WebGL, no smooth scroll, no pinning, static hero art; process section stacks.
- Return visits in the same session get a shorter preloader (`sessionStorage 'ht-visited'`, class `return-visit`).
- Native cursor everywhere (the custom cursor was removed).
