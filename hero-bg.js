/* Hero background — React Bits "Dark Veil" (original code, see src/backgrounds/), themed in the
   fire palette. It reacts to the pointer.
   If WebGL2 isn't available (or the script fails), the ember-trail hero (hero-gl.js) is used instead. */
(() => {
  'use strict';
  const hero = document.querySelector('.hero');
  const art = hero?.querySelector('.hero-art');
  if (!hero || !art) return;
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = window.matchMedia('(pointer: coarse)').matches;

  const veilProps = () => ({
    color: '#ff3a0c',
    speed: 0.45,
    scale: 1,
    flow: 1,
    warp: 0.15,
    brightness: 3.5,
    sheen: 0.3,
    glow: 1.6,
    grain: 0.01,
    quality: touch ? 0.4 : 0.6,
    dpr: 1, // soft gradients don't need retina pixels: 1× is a quarter of the GPU work at DPR 2
    mouseStrength: 1
  });

  const ember = () => {
    root.classList.remove('has-bg');
    window.startEmber?.();
  };

  const load = src => new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = resolve;
    s.onerror = reject;
    document.head.append(s);
  });

  const layerFor = name => {
    const layer = document.createElement('div');
    layer.className = `hero-bg hero-bg--${name}`;
    art.insertBefore(layer, art.querySelector('.hero-fade'));
    return layer;
  };

  (async () => {
    if (reduce) return ember();
    root.classList.add('has-bg');
    try {
      await load('vendor/js/bg-veil.min.js');
      const layer = layerFor('veil');
      window.HeroBG.veil(layer, veilProps());
      requestAnimationFrame(() => layer.classList.add('is-on'));
    } catch (err) {
      console.warn('Hero background unavailable; using the ember trail.', err);
      ember();
    }
  })();
})();
