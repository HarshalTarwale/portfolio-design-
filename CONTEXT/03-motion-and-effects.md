# 03 — Motion, WebGL & interactive effects

Quality bar: smooth, premium, never heavy. The owner is a UI/UX designer — fidelity to what's here matters more than adding new things.

## Smooth scroll + GSAP wiring (`motion.js`)
- **Lenis** drives scroll; connected to GSAP's ticker and `ScrollTrigger.update`. Disabled under reduced motion. Anchor clicks scroll via Lenis (`scrollTo`, then focus the target).
- Plugins: ScrollTrigger, SplitText, ScrambleText. `gsap.matchMedia` is used to gate desktop-only effects (pinning, previews).
- Header state: only toggles `is-scrolled` (scrollY > 40) and `body.past-hero`. (No hide-on-scroll.)
- Progress bar `.scroll-progress i` scales with page progress.
- Final `ScrollTrigger.refresh()` after fonts/images settle — in Next.js do it after `document.fonts.ready` and on image load of pinned sections.

## Reveals
- **Headlines** (`[data-split]`): SplitText masked line reveal.
- **Labels**: ScrambleText "scramble in".
- **About statement**: words un-blur as you scroll (scrub). Must be fully sharp when the paragraph centre hits mid-screen.
- **Stats**: count-up from `data-count`.
- **Footer wordmark**: one-shot letter rise (not scrubbed — scrubbing left letters stuck mid-way).
- **Contact**: section opens up on scroll.
- **Buttons `.btn`** (`hero.css`): label split into letters (`app.js`, `.c` spans); on hover the fire "ember" floods the pill, label rolls up letter by letter, arrow swaps. Variants `--fire`, `--ghost`, `--ink`, `--sm`, `--block`. Magnetic effect on some elements (`motion.js` "Magnetic elements").

## Marquees
Tape + toolkit marquees auto-scroll; speed/direction follow scroll velocity.

## Work & Services
- Work: four **sticky stacked** cards; cases scale/dim as the next stacks over.
- Services rows: hover fill + **cursor-following project preview** (desktop/hover devices only).
- "More builds" index: cursor preview images.
- Process: **pinned horizontal scroll** (desktop) via ScrollTrigger pin + scrubbed x-translate + progress line; stacks otherwise. Pin spacing affects later triggers — nav spy uses `refreshPriority:-1` for this reason.

## WebGL / three.js pieces (each = one GL context; keep the total low)
1. **Hero Dark Veil** — `src/backgrounds/DarkVeil.jsx` (original React Bits code, WebGL2 via `ogl`). Props listed in 02. Perf: `dpr:1`, `quality .6`, **pause when off-screen** (IntersectionObserver). On context loss / no WebGL2 / reduced motion → fall back to ember trail or static `background.webp`.
2. **Gooey Nav** — `gooey-nav.js` (≈30 KB). WebGL2 SDF metaball shader + droplet physics (the React Bits original, ported to vanilla) with per-pill fire gradient (`fire(p, box)`), translucent glass body, top light. Theme constants at top: `PILL '#ff6a00'`, `TINTS ['#ffc21a','#ff9a00','#ff6a00','#ff3d10']`, `HOVER rgba(255,255,255,.1)`, `SHADOW .22`. API idea: `go(index)` (−1 = no active → melt away). Click holds the pill for 1700 ms so scroll-spy doesn't fight the click animation. Active state is read from the `.is-active` class set by scroll-spy (MutationObserver) — in React, drive it with props/state instead.
3. **Glass refraction** (same file, "Glass" section) — one SVG `<filter>` per glass element (`#nav-glass-N`) using `feDisplacementMap` with a generated displacement map; applied via `backdrop-filter: url(#filter) blur(6px) saturate(1.4)` + `rgba(10,9,8,.16)`. Params `G = {borderWidth:.07, brightness:50, opacity:.93, blur:11, distortion:-26, red:0, green:1, blue:2}` (distortion was reduced from -180 → -26 because the owner said refraction must be subtle: "good but not grab attention"). **Chromium only** — Safari/Firefox get frosted glass (class `.is-refractive` is only added when supported). Also toggles `.on-light` when the nav overlaps `[data-nav-light]`.
4. **Lanyard ID badge** — `src/lanyard.js` (three.js + physics), lazily loaded when About approaches; options (images, size, strap length, finish `matte`, breeze) in `app.js` → "About: ID badge on a lanyard". Intro: starts bunched (0.55 rest), tiny 0.06 rad tilt, elastic settle. Pause/ dispose when off-screen if possible.
5. **Ember trail** (`hero-gl.js`) — fallback hero only.

**Total live contexts at worst:** veil + gooey nav + lanyard = 3. Don't add more without disposing others.

## Performance rules the owner cares about (they noticed lag in About and "reloads")
- Known cost centres: lanyard canvas (retina), word-blur filter on many spans, backdrop-filter SVG glass (3 layers), the animated full-screen grain overlay, the hero veil. Mitigations to build in Next.js: DPR caps (`Math.min(devicePixelRatio, 1.5–2)`), **pause/unmount WebGL when off-screen**, `will-change` only while animating, reduce grain cost (static PNG or lower-res canvas) on low-power/touch, lower `quality`/skip veil on touch/low-end, `prefers-reduced-motion` fallbacks.
- The "site reloads repeatedly" the owner saw was **not** app code — no reload logic exists. Most likely VS Code Live Server auto-reload on every file save (or GPU memory pressure from the contexts above). In Next.js dev, Fast Refresh may also remount WebGL components — guard against double-mount (cleanup `dispose()` on unmount, React StrictMode double-invoke safe).

## Things that were deliberately removed (don't bring back)
Custom cursor · cursor glow in hero · headline following the mouse · Pixel Snow / Flux Lines / Aero Shards backgrounds (only Dark Veil stays) · social-icon name tooltips · header hide-on-scroll · name on ID card front.
