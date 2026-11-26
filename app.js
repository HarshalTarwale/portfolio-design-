(() => {
  'use strict';
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const mobileQuery = window.matchMedia('(max-width: 650px)');
  const hero = document.querySelector('.hero');
  const typeElements = [...document.querySelectorAll('.tech-text')];
  let disposeType = [];

  // ---- Hero: interactive Tech Text headline (React Bits engine) ----
  async function initializeType() {
    await document.fonts.ready;
    disposeType.forEach(dispose => dispose?.());
    disposeType = [];
    typeElements.forEach(element => {
      element.classList.remove('is-ready');
      if (motionQuery.matches || !window.mountTechText || !element.offsetWidth) return;
      try {
        const dispose = window.mountTechText(element, {
          text: mobileQuery.matches && element.dataset.mobileText ? element.dataset.mobileText : element.dataset.text,
          fontFamily: 'Syne', fontWeight: 700,
          fontSize: parseFloat(getComputedStyle(element).fontSize),
          letterSpacing: 0.00952, align: 'left',
          color: '#f8f8f5', accentColor: '#c6c6c6',
          reveal: 'letter', dashLength: 4, dashGap: 2, specks: 15,
          intro: 'none', introDuration: 2, clickKick: true, guides: false,
          sweep: false, draggable: finePointer.matches,
          selection: true, labels: true,
        });
        disposeType.push(dispose);
        requestAnimationFrame(() => requestAnimationFrame(() => element.classList.add('is-ready')));
      } catch (error) {
        console.warn('Interactive type could not initialize; readable text retained.', error);
      }
    });
  }
  initializeType();
  motionQuery.addEventListener('change', initializeType);
  mobileQuery.addEventListener('change', initializeType);

  // ---- Hero: ambient light follows the pointer ----
  let lightFrame = 0;
  hero.addEventListener('pointermove', event => {
    if (motionQuery.matches || !finePointer.matches || lightFrame) return;
    const x = event.clientX;
    const y = event.clientY;
    lightFrame = requestAnimationFrame(() => {
      const box = hero.getBoundingClientRect();
      hero.style.setProperty('--light-x', `${((x - box.left) / box.width) * 100}%`);
      hero.style.setProperty('--light-y', `${((y - box.top) / box.height) * 100}%`);
      lightFrame = 0;
    });
  }, { passive: true });

  // ---- Glass buttons: reflection tilt + ripple ----
  document.querySelectorAll('.button').forEach(button => {
    button.addEventListener('pointermove', event => {
      if (motionQuery.matches || !finePointer.matches) return;
      const box = button.getBoundingClientRect();
      const x = event.clientX - box.left - box.width / 2;
      const y = event.clientY - box.top - box.height / 2;
      button.style.setProperty('--tilt-x', `${-y * .06}deg`);
      button.style.setProperty('--tilt-y', `${x * .025}deg`);
      button.style.setProperty('--bx', `${event.clientX - box.left}px`);
      button.style.setProperty('--by', `${event.clientY - box.top}px`);
    });
    button.addEventListener('pointerleave', () => {
      button.style.setProperty('--tilt-x', '0deg');
      button.style.setProperty('--tilt-y', '0deg');
    });
    button.addEventListener('pointerdown', event => {
      if (motionQuery.matches) return;
      const ripple = document.createElement('span');
      const box = button.getBoundingClientRect();
      ripple.className = 'ripple';
      ripple.style.left = `${event.clientX - box.left}px`;
      ripple.style.top = `${event.clientY - box.top}px`;
      button.append(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    });
  });

  // ---- "Touch the type" hint: kicks the headline letters ----
  document.querySelector('#play-type').addEventListener('click', () => {
    if (motionQuery.matches) return;
    const line = typeElements[1];
    const box = line.getBoundingClientRect();
    const pointer = { clientX: box.left + Math.min(box.width * .5, 400), clientY: box.top + box.height / 2, pointerType: 'mouse', pointerId: 1, bubbles: false };
    line.dispatchEvent(new PointerEvent('pointermove', pointer));
    line.dispatchEvent(new PointerEvent('pointerdown', pointer));
    line.dispatchEvent(new PointerEvent('pointerup', pointer));
    window.setTimeout(() => line.dispatchEvent(new PointerEvent('pointerleave', pointer)), 900);
  });

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

  // ---- Live clocks (Nagpur / Dubai / London) ----
  const clocks = [...document.querySelectorAll('.clock')];
  const formatters = new Map();
  function tick() {
    const now = new Date();
    clocks.forEach(clock => {
      const key = `${clock.dataset.tz}|${'seconds' in clock.dataset}`;
      if (!formatters.has(key)) {
        formatters.set(key, new Intl.DateTimeFormat('en-GB', { timeZone: clock.dataset.tz, hour: '2-digit', minute: '2-digit', second: 'seconds' in clock.dataset ? '2-digit' : undefined, hour12: false }));
      }
      clock.textContent = formatters.get(key).format(now);
    });
  }
  tick();
  setInterval(tick, 1000);

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
