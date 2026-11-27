/* Scroll + motion layer. Content is fully readable without this file:
   every hidden state is applied here by GSAP, never by CSS. */
(() => {
  'use strict';
  const root = document.documentElement;
  const header = document.querySelector('.header');
  const preloader = document.querySelector('.preloader');
  const reduce = !root.classList.contains('motion');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // ---------- Header state (works with or without GSAP) ----------
  let lastY = window.scrollY;
  let headerLocked = false;
  function onScrollHeader() {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    document.body.classList.toggle('past-hero', y > window.innerHeight * .8);
    if (!headerLocked) header.classList.toggle('is-hidden', y > lastY && y > 500);
    lastY = y;
  }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  const removePreloader = () => { preloader?.remove(); try { sessionStorage.setItem('ht-visited', '1'); } catch (e) {} };
  if (reduce || !window.gsap || !window.ScrollTrigger) { removePreloader(); return; }

  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(window.SplitText);
  if (window.ScrambleTextPlugin) gsap.registerPlugin(window.ScrambleTextPlugin);
  const mm = gsap.matchMedia();

  // ---------- Smooth scroll ----------
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 1 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href^="#"]');
    if (!link) return;
    const id = link.getAttribute('href');
    if (id === '#main') return; // skip link keeps native focus behaviour
    const target = id === '#top' ? 0 : document.querySelector(id);
    if (target === null) return;
    event.preventDefault();
    headerLocked = true;
    const done = () => { headerLocked = false; if (id !== '#top') target.focus?.({ preventScroll: true }); };
    if (lenis) lenis.scrollTo(target, { force: true, duration: 1.5, easing: t => 1 - Math.pow(1 - t, 4), onComplete: done });
    else { window.scrollTo({ top: id === '#top' ? 0 : target.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' }); setTimeout(done, 900); }
    history.replaceState(null, '', id === '#top' ? location.pathname : id);
  });

  // ---------- Preloader → hero entrance ----------
  const heroItems = ['.header nav a', '.wordmark', '.hero-actions > *', '.social-rail a']
    .flatMap(sel => [...document.querySelectorAll(sel)]);
  const titleLines = [...document.querySelectorAll('.hero-title .hl-in')];
  gsap.set(heroItems, { y: 46, opacity: 0 });
  gsap.set(titleLines, { yPercent: 110, rotate: 2.5, transformOrigin: '0% 100%' });
  lenis?.stop();

  const fast = root.classList.contains('return-visit');
  const counter = { v: 0 };
  const countEl = preloader?.querySelector('.count-num');
  const barEl = preloader?.querySelector('.preloader-bar');
  const fontsReady = Promise.race([document.fonts.ready, new Promise(r => setTimeout(r, 2500))]);

  const intro = gsap.timeline({ paused: true, onComplete: () => { lenis?.start(); ScrollTrigger.refresh(); } });
  intro
    .to(preloader.querySelector('.preloader-count'), { yPercent: -30, opacity: 0, duration: .5, ease: 'power3.in' })
    .to(preloader.querySelectorAll('.preloader-top, .preloader-bottom'), { opacity: 0, duration: .3 }, '<')
    .to(preloader, { clipPath: 'inset(0 0 100% 0)', duration: .95, ease: 'expo.inOut', onComplete: () => { removePreloader(); lenis?.start(); } }, '-=.15')
    .to(titleLines, { yPercent: 0, rotate: 0, duration: 1.4, ease: 'expo.out', stagger: .12, clearProps: 'transform' }, '-=.6')
    .to(heroItems, { y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: .05, clearProps: 'transform,opacity' }, '-=1.2');

  gsap.set(preloader, { clipPath: 'inset(0 0 0% 0)' });
  gsap.to(counter, {
    v: 100, duration: fast ? .6 : 1.7, ease: 'power2.inOut',
    onUpdate: () => {
      if (countEl) countEl.textContent = Math.round(counter.v);
      barEl?.style.setProperty('--p', counter.v / 100);
    },
    onComplete: () => fontsReady.then(() => intro.play()),
  });
  // Failsafe: never leave the hero hidden if anything above stalls.
  setTimeout(() => { if (!intro.isActive() && intro.progress() === 0) { gsap.set([...heroItems, ...titleLines], { clearProps: 'transform,opacity' }); removePreloader(); lenis?.start(); } }, 7000);

  // ---------- Global: progress bar ----------
  const progress = document.querySelector('.scroll-progress');
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => progress.style.setProperty('--p', self.progress.toFixed(4)) });

  // ---------- Nav: active section ----------
  document.querySelectorAll('[data-nav]').forEach(link => {
    const section = document.querySelector(link.getAttribute('href'));
    if (!section) return;
    ScrollTrigger.create({ trigger: section, start: 'top 55%', end: 'bottom 55%', onToggle: self => link.classList.toggle('is-active', self.isActive) });
  });

  // ---------- Hero: parallax out ----------
  const heroOut = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('.hero-art', { yPercent: 22, ease: 'none', scrollTrigger: heroOut });
  gsap.to('.hero-content', { yPercent: -18, opacity: .2, ease: 'none', scrollTrigger: { ...heroOut } });

  // ---------- Headlines: masked line reveal ----------
  if (window.SplitText) {
    document.querySelectorAll('[data-split]').forEach(el => {
      window.SplitText.create(el, {
        type: 'lines', mask: 'lines', linesClass: 'sl', autoSplit: true,
        onSplit: self => gsap.from(self.lines, {
          yPercent: 108, duration: 1.25, ease: 'expo.out', stagger: .09,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        }),
      });
    });
  }

  // ---------- Labels: scramble in ----------
  document.querySelectorAll('[data-scramble]').forEach(el => {
    const text = el.textContent;
    ScrollTrigger.create({
      trigger: el, start: 'top 92%', once: true,
      onEnter: () => window.ScrambleTextPlugin
        ? gsap.to(el, { duration: 1.1, scrambleText: { text, chars: '01<>/_—+*#', speed: .5, revealDelay: .2 } })
        : null,
    });
  });

  // ---------- Marquees (tape + toolkit), velocity reactive ----------
  const marquees = [];
  document.querySelectorAll('[data-marquee]').forEach(row => {
    const track = row.querySelector('.tape-track');
    const originals = [...track.children];
    let guard = 0;
    while (track.scrollWidth < row.offsetWidth * 1.05 && guard++ < 8) {
      originals.forEach(node => { const c = node.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.append(c); });
    }
    [...track.children].forEach(node => { const c = node.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.append(c); });
    const half = track.scrollWidth / 2;
    const speed = row.classList.contains('stack-row') ? 40 : 70; // px per second
    const tween = gsap.fromTo(track, { x: 0 }, { x: -half, duration: half / speed, ease: 'none', repeat: -1 });
    tween.__dir = Number(row.dataset.marquee) || 1;
    tween.timeScale(tween.__dir);
    marquees.push(tween);
  });
  let boost = 0;
  let scrollDir = 1;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => { scrollDir = self.direction; boost = Math.min(Math.abs(self.getVelocity()) / 260, 7); } });
  gsap.ticker.add(() => {
    boost *= 0.93;
    marquees.forEach(t => t.timeScale(t.__dir * scrollDir * (1 + boost)));
  });
  gsap.to('.tape-row--fire', { xPercent: -6, ease: 'none', scrollTrigger: { trigger: '.tape', start: 'top bottom', end: 'bottom top', scrub: true } });
  gsap.to('.tape-row--dark', { xPercent: 6, ease: 'none', scrollTrigger: { trigger: '.tape', start: 'top bottom', end: 'bottom top', scrub: true } });

  // ---------- About: words sharpen from blur as you read ----------
  const statement = document.querySelector('[data-blur-reveal]');
  if (statement && window.SplitText) {
    const split = window.SplitText.create(statement, { type: 'words', wordsClass: 'bw' });
    // fully sharp by the time the paragraph's centre reaches mid-screen, so it can be read in full
    gsap.fromTo(split.words, { opacity: .12, filter: 'blur(7px)' }, {
      opacity: 1, filter: 'blur(0px)', ease: 'none', stagger: .1,
      scrollTrigger: { trigger: statement, start: 'top 82%', end: 'center 50%', scrub: .5 },
    });
    gsap.from(statement.querySelectorAll('.chip-img'), { width: 0, marginInline: 0, borderWidth: 0, duration: 1, ease: 'expo.out', stagger: .2, scrollTrigger: { trigger: statement, start: 'top 60%', once: true } });
  }
  gsap.from('.about-foot', { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: '.about-foot', start: 'top 92%', once: true } });

  // Count-up stats
  document.querySelectorAll('[data-count]').forEach(el => {
    const end = Number(el.dataset.count);
    const obj = { v: 0 };
    ScrollTrigger.create({
      trigger: el, start: 'top 90%', once: true,
      onEnter: () => gsap.to(obj, { v: end, duration: 1.6, ease: 'power3.out', onUpdate: () => { el.textContent = Math.round(obj.v); } }),
    });
  });
  gsap.from('.stat', { y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.stats', start: 'top 88%', once: true } });

  // ---------- Services rows + cursor preview ----------
  gsap.from('.service-row', { y: 50, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .1, scrollTrigger: { trigger: '.service-rows', start: 'top 85%', once: true } });
  function followPreview(items, preview) {
    if (!finePointer || !preview) return;
    const img = preview.querySelector('img');
    const xTo = gsap.quickTo(preview, 'x', { duration: .55, ease: 'power3' });
    const yTo = gsap.quickTo(preview, 'y', { duration: .55, ease: 'power3' });
    gsap.set(preview, { xPercent: -50, yPercent: -50 });
    let rot = 0;
    items.forEach(item => {
      item.addEventListener('pointerenter', event => {
        if (img.getAttribute('src') !== item.dataset.preview) img.src = item.dataset.preview;
        gsap.set(preview, { x: event.clientX, y: event.clientY });
        gsap.to(preview, { opacity: 1, scale: 1, duration: .45, ease: 'expo.out', overwrite: 'auto' });
      });
      item.addEventListener('pointermove', event => {
        const next = gsap.utils.clamp(-8, 8, event.movementX * .6);
        rot += (next - rot) * .2;
        xTo(event.clientX + 40); yTo(event.clientY);
        gsap.to(preview, { rotate: rot, duration: .4, overwrite: 'auto' });
      });
      item.addEventListener('pointerleave', () => gsap.to(preview, { opacity: 0, scale: .6, rotate: 0, duration: .35, ease: 'power2.in', overwrite: 'auto' }));
    });
    lenis?.on('scroll', () => gsap.to(preview, { opacity: 0, scale: .6, duration: .2, overwrite: 'auto' }));
  }
  followPreview([...document.querySelectorAll('.service-row')], document.querySelector('.service-preview'));
  followPreview([...document.querySelectorAll('.index-list a')], document.querySelector('.index-preview'));

  // ---------- Work: stacked cases ----------
  const cases = [...document.querySelectorAll('.case')];
  cases.forEach(c => {
    const shade = document.createElement('div');
    shade.className = 'case-shade';
    c.querySelector('.case-inner').append(shade);
    gsap.from(c.querySelectorAll('.case-info > *'), { y: 40, opacity: 0, duration: 1, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: c, start: 'top 75%', once: true } });
    gsap.from(c.querySelector('.case-visual'), { y: 80, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: c, start: 'top 80%', once: true } });
    const phone = c.querySelector('.phone');
    if (phone) gsap.fromTo(phone, { y: 70 }, { y: -30, ease: 'none', scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  mm.add('(min-width: 1101px)', () => {
    cases.forEach((c, i) => {
      c.style.top = `${92 + i * 14}px`;
      const next = cases[i + 1];
      if (!next) return;
      const tl = gsap.timeline({ scrollTrigger: { trigger: next, start: 'top bottom', end: () => `top ${92 + (i + 1) * 14}px`, scrub: true } });
      tl.to(c, { scale: .9 - (cases.length - i) * .01, ease: 'none' }, 0)
        .to(c.querySelector('.case-shade'), { opacity: .55, ease: 'none' }, 0);
    });
    return () => cases.forEach(c => { c.style.top = ''; });
  });
  // Glide illustration: data fills in
  const app = document.querySelector('.app');
  if (app) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: app, start: 'top 75%', once: true } });
    tl.from(app.querySelectorAll('.bar-anim i'), { scaleX: 0, duration: 1.4, ease: 'expo.out', stagger: .12 })
      .from(app.querySelectorAll('.app-chart i'), { scaleY: 0, transformOrigin: 'bottom', duration: 1, ease: 'expo.out', stagger: .05 }, '<.1')
      .from(app.querySelectorAll('.app-ledger p'), { x: -16, opacity: 0, duration: .6, stagger: .08, ease: 'power3.out' }, '<.2');
  }
  gsap.from('.index-list li', { y: 30, opacity: 0, duration: .9, ease: 'expo.out', stagger: .06, scrollTrigger: { trigger: '.index-list', start: 'top 85%', once: true } });

  // ---------- Process: pinned horizontal scroll ----------
  const steps = [...document.querySelectorAll('.step')];
  mm.add('(min-width: 901px)', () => {
    const track = document.querySelector('.process-track');
    const rail = document.querySelector('.process-rail');
    const line = document.querySelector('.process-line');
    const distance = () => {
      const pad = parseFloat(getComputedStyle(rail).paddingLeft) * 2;
      return Math.max(0, track.scrollWidth - (rail.clientWidth - pad));
    };
    gsap.to(track, {
      x: () => -distance(), ease: 'none',
      scrollTrigger: {
        trigger: '.process', pin: true, start: 'top top', end: () => `+=${distance() + window.innerHeight * .6}`, scrub: .8, invalidateOnRefresh: true,
        onUpdate: self => {
          line.style.setProperty('--p', self.progress.toFixed(4));
          steps.forEach((s, i) => s.classList.toggle('is-on', self.progress >= (i / steps.length) * 1.02 - .01));
        },
      },
    });
  });
  mm.add('(max-width: 900px)', () => {
    steps.forEach(s => ScrollTrigger.create({ trigger: s, start: 'top 70%', onEnter: () => s.classList.add('is-on') }));
  });

  // ---------- Why me ----------
  ScrollTrigger.batch('.tile', { start: 'top 88%', once: true, onEnter: batch => gsap.from(batch, { y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: .1 }) });
  const word = document.querySelector('[data-mp]');
  const play = document.querySelector('.motion-play');
  if (word && play) {
    if (!finePointer) word.textContent = 'Tap me';
    const letters = [...word.textContent];
    word.textContent = '';
    word.setAttribute('aria-label', letters.join(''));
    letters.forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.setAttribute('aria-hidden', 'true'); s.textContent = ch === ' ' ? ' ' : ch; word.append(s); });
    const chars = word.querySelectorAll('.ch');
    const bounce = () => gsap.fromTo(chars, { y: 0, rotate: 0 }, { keyframes: [{ y: -34, rotate: () => gsap.utils.random(-14, 14), duration: .28, ease: 'power2.out' }, { y: 0, rotate: 0, duration: .9, ease: 'elastic.out(1, .35)' }], stagger: .035, overwrite: true });
    play.addEventListener('pointerenter', bounce);
    play.addEventListener('click', bounce);
    const orb = play.querySelector('.mp-orb');
    const ox = gsap.quickTo(orb, 'x', { duration: .8, ease: 'power3' });
    const oy = gsap.quickTo(orb, 'y', { duration: .8, ease: 'power3' });
    play.addEventListener('pointermove', e => { const b = play.getBoundingClientRect(); ox(e.clientX - b.left - b.width / 2); oy(e.clientY - b.top - b.height / 2); });
    play.addEventListener('pointerleave', () => { ox(0); oy(0); });
    gsap.to(orb, { scale: 1.25, duration: 2.4, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    ScrollTrigger.create({ trigger: play, start: 'top 80%', once: true, onEnter: bounce });
  }
  // Compare slider: auto-demo once so visitors understand it
  const range = document.querySelector('.compare-range');
  if (range) {
    const demo = { v: 50 };
    ScrollTrigger.create({
      trigger: '.compare', start: 'top 70%', once: true,
      onEnter: () => gsap.timeline()
        .to(demo, { v: 22, duration: .9, ease: 'power2.inOut' })
        .to(demo, { v: 78, duration: 1.2, ease: 'power2.inOut' })
        .to(demo, { v: 50, duration: .9, ease: 'power2.inOut' })
        .eventCallback('onUpdate', () => { range.value = demo.v; range.dispatchEvent(new Event('input')); }),
    });
  }

  // ---------- Contact: section opens up ----------
  gsap.fromTo('.contact', { clipPath: 'inset(7% 5% 0% 5% round 60px)' }, { clipPath: 'inset(0% 0% 0% 0% round 36px)', ease: 'none', scrollTrigger: { trigger: '.contact', start: 'top bottom', end: 'top 25%', scrub: true } });
  gsap.from('.brief', { y: 80, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '.contact-grid', start: 'top 70%', once: true } });
  gsap.from('.contact-links li', { y: 30, opacity: 0, duration: .9, ease: 'expo.out', stagger: .07, scrollTrigger: { trigger: '.contact-links', start: 'top 90%', once: true } });

  // ---------- Footer: giant wordmark rises letter by letter ----------
  const mark = document.querySelector('.fm-inner');
  if (mark) {
    const text = mark.textContent;
    mark.textContent = '';
    [...text].forEach(ch => { const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch; mark.append(s); });
    gsap.from(mark.querySelectorAll('.ch'), { yPercent: 105, ease: 'none', stagger: .04, scrollTrigger: { trigger: '.footer-mark', start: 'top bottom', end: 'bottom bottom', scrub: .6 } });
  }

  // ---------- Magnetic elements ----------
  if (finePointer) {
    document.querySelectorAll('.magnetic').forEach(el => {
      const xTo = gsap.quickTo(el, 'x', { duration: .6, ease: 'power3' });
      const yTo = gsap.quickTo(el, 'y', { duration: .6, ease: 'power3' });
      el.addEventListener('pointermove', e => { const b = el.getBoundingClientRect(); xTo((e.clientX - b.left - b.width / 2) * .25); yTo((e.clientY - b.top - b.height / 2) * .3); });
      el.addEventListener('pointerleave', () => { gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1, .4)', overwrite: true }); });
    });
  }

  // Refresh measurements once images/fonts settle
  window.addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts.ready.then(() => ScrollTrigger.refresh());
})();
