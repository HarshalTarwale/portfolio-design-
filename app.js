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
