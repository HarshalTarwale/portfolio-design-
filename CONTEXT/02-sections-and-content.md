# 02 — Sections & content (top to bottom)

All copy lives in `index.html` — **copy it verbatim** (move it into typed data files for repeatable items: services, cases, index list, process steps, stats). Section CSS is in `site.css` (hero in `hero.css`). Page order and ids:

`preloader → header → hero(#top) → tape → About(#about) → Services(#services) → Work(#work) → Process(#process) → Why(#why) → Contact(#contact) → footer`

Fixed overlays: `.grain` (animated noise, z 150), `.scroll-progress` (top bar), `.social-rail` (right side), `.header`.

## Preloader
Full-screen black. Top: `harshal.t` / `Portfolio ©2026`. Giant 0→100 % counter in fire-text gradient. Bottom: `Design ▬▬ Develop` progress bar. Skipped under reduced motion; shortened for return visits. After it, the hero entrance animation runs (`motion.js` "Preloader → hero entrance", with a failsafe so the hero is never left hidden).

## Header / Nav (important, most iterated)
- **At top of page (over hero):** only four plain text links — About · Services · Work · Connect (page order; "Connect" → `#contact`).
- **After scrolling >40px (`is-scrolled`):** becomes a centred **island**: `harshal.t` wordmark (quiet glass pill, left) | **glass nav capsule** (centre, the focus) | **"Let's talk"** glass button (right). Wordmark and button slide out from behind the capsule. Hidden ≤1100px (nav only).
- **Always visible while scrolled** (it used to hide on scroll-down — that was removed on request).
- Capsule = clear refracting glass (no tint/border). Active link = React Bits **Gooey Nav** pill: translucent glass in the contact-section fire gradient that bursts into droplets and re-forms on the next item; follows scroll-spy and clicks; melts away when no link applies.
- Over light sections (`data-nav-light`, i.e. Services) the header gets `.on-light` and ink colours flip dark.
- "Let's talk": glass at rest with the arrow circle already orange-gradient; on hover the circle expands and floods the whole button orange, text/arrow swap (`.btn` system).
- Code: markup top of `index.html`; CSS `site.css` → "Header"; `gooey-nav.js`; scroll-spy in `motion.js` ("Nav: active section", ScrollTrigger per section `start:'top 55%'`, `refreshPriority:-1`).

## Hero (`#top`, `hero.css`, `hero-bg.js`)
- Headline **"Let's make your Website iconic."** (`#hero-heading`, two lines, `<em>` serif accent), wordmark, two buttons (fire primary + ghost), `.hero-meta` row (availability + "Scroll" cue). Clean and static — **no cursor glow, no mouse-follow headline**.
- Background: React Bits **Dark Veil**, tinted red-orange to match the contact section, brighter than stock, reacts subtly to the pointer. Props in `hero-bg.js → veilProps()`: `color #ff3a0c, speed .45, scale 1, flow 1, warp .15, brightness 3.5, sheen .3, glow 1.6, grain .01, quality .6 (.4 touch), dpr 1, mouseStrength 1`. A soft dark radial shade sits behind the headline for legibility. Fallback: ember-trail canvas (`hero-gl.js`) / `assets/background.webp`.
- Hero parallaxes out on scroll.

## Tape (marquee, between hero and About)
Two crossing tapes, fire-gradient: "Websites ✺ Online stores ✺ Web apps ✺ UI/UX design ✺ Dashboards ✺ Landing pages ✺" and "Figma → Code → Live ✺ Design × Develop ✺". Speed/direction react to scroll velocity.

## 01 About (`#about`, `.lined` = faint Figma column guides)
- Left/centre: **3D ID badge on a lanyard** (three.js + physics): strap hangs from under the fire tape; drag/throw; click flips (back = contact details). Front = photo only (grayscale, zoomed, no name) — `assets/lanyard/card-front.png`, back `card-back.png`, strap `strap.jpg`. Intro: gentle elastic drop from a bunched strap (not a wild swing). Mounted lazily when About nears the viewport (`.lanyard-wrap.is-live`). Label "Click to flip".
- Right: label `(01) — Hello`, statement "I'm Harshal — a designer who codes, and a developer who designs." + paragraph + "One person. Zero handoff…". The statement **sharpens from blur word-by-word and is fully readable by the time its centre reaches mid-screen** (`motion.js` "About: words sharpen"; scrub .5, start `top 82%` → end `center 50%`). Link "See what I've shipped"; availability chip "Open for new projects · Nagpur, India · live IST clock".
- Stats (count-up, `data-count`): **13+** Live builds on the web · **3** Countries — India, UAE, UK · **2** Disciplines · **1** Point of contact.

## 02 Services (`#services`, light "paper" section, `data-nav-light`)
Title "What I *do* for you" + lede. Numbered rows (01 UI/UX Design, …) each with description + tags; rows fill on hover and a **related project screenshot follows the cursor** (preview). Edit data in `index.html`.

## 03 Work (`#work`)
Title "Work that *works.*". **Four stacked sticky case cards** (desktop + phone mockups of live sites; categories E-commerce / Luxury brand site / SaaS product / Agency redesign, year 2026), then a **"More builds" index list** with cursor image previews. Live links include maisonbotanique, erayah-design, glide, harshaltarwale.github.io/BB--design-v2, tech-monkeys, da-reality, dimera, crunch, advenco, vedic-group, etc. (see `index.html` lines ~205–330). Screenshots: `assets/work/<name>.jpg` (desktop 1440×900) and `<name>-m.jpg` (mobile 390×844) — lazy loaded. One case (Glide) has an illustration whose data "fills in" on scroll.

## 04 Process (`#process`)
"From idea to *live*, in four steps." — Discover · Design · Build · Launch, each with description and "You get …". **Desktop: pinned horizontal scroll with a progress line. Tablet/phone (and reduced motion): stacks vertically.**

## 05 Why me (`#why`) — bento grid
"Designer's eye. *Developer's* brain." Tiles: **draggable Figma ↔ Code compare slider** (native range input; auto-demo once; shows a "Heirlooms, reimagined" hero in design vs. its React code), **motion playground**, checks list, time zones, **toolkit marquee**.

## 06 Contact (`#contact`) — fire-gradient section
Title "Let's make your website *iconic.*", links (WhatsApp / LinkedIn / Instagram / GitHub). **Project brief form** (`#project-form`): name (required, max 80), project type (Website / E-commerce / Web app / UI/UX design), timeline (ASAP / 1–2 months / Flexible), idea textarea (max 1500). Submit "Send on WhatsApp" builds a text message and `window.open('https://wa.me/917028235485?text=' + encodeURIComponent(…))`. Empty name blocks submit. Logic: `app.js` → "brief". Section "opens up" (clip) on scroll.

## Footer
Giant `harshal.t` wordmark that **fits the real page width** (JS fit + ResizeObserver, scrollbar excluded) and rises letter-by-letter once (`expo.out`, stagger .05, trigger `top 92%`). Live clock, links.

## Social rail (right edge, fixed)
WhatsApp, Instagram, LinkedIn icons (`assets/*.png`), 60% opacity → on hover scale + white glow. **No name tooltips** (removed on request). Hidden ≤650px; past hero ≤1100px.

## Meta
`<title>` "Harshal Tarwale — Full Stack Developer & UI/UX Designer"; OG title "Harshal Tarwale — Let's make your website iconic."; theme-color `#080806`; favicon `assets/favicon.svg`; skip-link; landmarks/aria-labels throughout (keep them).
