(() => {
  'use strict';

  // ---- Buttons: split labels into letters for the roll-up hover ----
  document.querySelectorAll('[data-roll]').forEach(label => {
    const text = label.textContent.trim();
    const btn = label.closest('.btn');
    if (btn && !btn.hasAttribute('aria-label')) btn.setAttribute('aria-label', text);
    label.setAttribute('aria-hidden', 'true');
    label.textContent = '';
    [...text].forEach((ch, i) => {
      const s = document.createElement('span');
      s.className = 'c';
      s.style.setProperty('--i', i);
      s.textContent = ch === ' ' ? ' ' : ch;
      label.append(s);
    });
  });

  // ---- About: ID badge on a lanyard (three.js, loaded only when the section is near) ----
  const stage = document.querySelector('.lanyard-wrap');
  if (stage) {
    if (window.matchMedia('(hover: none)').matches) stage.querySelector('.lanyard-hint').textContent = 'Tap to flip';
    const small = window.matchMedia('(max-width: 1100px)');
    const options = () => ({
      frontImage: 'assets/lanyard/card-front.png',
      backImage: 'assets/lanyard/card-back.png',
      strapImage: 'assets/lanyard/strap.jpg',
      finish: 'matte',
      cardColor: '#0b0908',
      strapColor: '#101010',
      metal: 'silver',
      strapWidth: .65,
      breeze: .35,
      intro: true,
      size: small.matches ? .58 : .5,
      strapLength: small.matches ? .6 : .7
    });
    let scriptReady = null;
    const loadScript = () => scriptReady || (scriptReady = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'vendor/js/lanyard.bundle.min.js';
      s.onload = resolve;
      s.onerror = reject;
      document.head.append(s);
    }));
    // fetch the engine a little early…
    new IntersectionObserver((entries, obs) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      loadScript().catch(() => {});
    }, { rootMargin: '900px 0px' }).observe(stage);
    // …but drop the badge in only once it's on screen, so the swing is seen
    new IntersectionObserver((entries, obs) => {
      if (!entries[0].isIntersecting) return;
      obs.disconnect();
      loadScript().then(() => {
        const api = window.mountLanyard?.(stage, options());
        if (!api) return;
        stage.classList.add('is-live');
        small.addEventListener('change', () => api.update(options()));
      }).catch(err => console.warn('Lanyard unavailable; showing the static badge.', err));
    }, { threshold: .35 }).observe(stage);
  }

  // ---- Project brief → prepared WhatsApp message ----
  const form = document.querySelector('#project-form');
  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const nameInput = form.elements.namedItem('name');
    if (!name) {
      nameInput.setCustomValidity('Please enter your name.');
      nameInput.reportValidity();
      nameInput.addEventListener('input', () => nameInput.setCustomValidity(''), { once: true });
      return;
    }
    const details = String(data.get('details') || '').trim();
    const timeline = data.get('timeline');
    const message = `Hey Harshal! I’m ${name}. I’d love to talk about a ${data.get('service')} project${timeline ? `, ideally ${timeline}` : ''}.${details ? `\n\n${details}` : ''}`;
    window.open(`https://wa.me/917028235485?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  });

  // ---- Footer wordmark: sized to the real page width (vw includes the scrollbar, so it would overflow) ----
  const wordmark = document.querySelector('.fm-inner');
  if (wordmark) {
    let lastBox = 0;
    const fit = (force = true) => {
      const box = wordmark.parentElement.clientWidth;
      if (!force && box === lastBox) return;
      lastBox = box;
      wordmark.style.fontSize = '';
      const base = parseFloat(getComputedStyle(wordmark).fontSize);
      const width = wordmark.getBoundingClientRect().width;
      if (width > 0) wordmark.style.fontSize = `${(base * box * .985) / width}px`;
    };
    fit();
    document.fonts?.ready.then(() => fit());
    new ResizeObserver(() => fit(false)).observe(wordmark.parentElement);
  }

  // ---- Live clocks (Nagpur / Dubai / London) ----
  const clocks = [...document.querySelectorAll('.clock')];
  const formatters = new Map();
  function tickClocks() {
    const now = new Date();
    clocks.forEach(clock => {
      const key = `${clock.dataset.tz}|${'seconds' in clock.dataset}`;
      if (!formatters.has(key)) {
        formatters.set(key, new Intl.DateTimeFormat('en-GB', { timeZone: clock.dataset.tz, hour: '2-digit', minute: '2-digit', second: 'seconds' in clock.dataset ? '2-digit' : undefined, hour12: false }));
      }
      clock.textContent = formatters.get(key).format(now);
    });
  }
  tickClocks();
  setInterval(tickClocks, 1000);

  // ---- Design ↔ code compare slider (native range input = keyboard + touch accessible) ----
  document.querySelectorAll('.compare').forEach(compare => {
    const range = compare.querySelector('.compare-range');
    const update = () => compare.style.setProperty('--pos', `${range.value}%`);
    range.addEventListener('input', update);
    update();
  });

  // ---- Bento tiles: pointer-tracked glow ----
  document.querySelectorAll('.tile').forEach(tile => {
    tile.addEventListener('pointermove', event => {
      const box = tile.getBoundingClientRect();
      tile.style.setProperty('--mx', `${event.clientX - box.left}px`);
      tile.style.setProperty('--my', `${event.clientY - box.top}px`);
    }, { passive: true });
  });
})();
