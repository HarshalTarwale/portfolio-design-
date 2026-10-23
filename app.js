(() => {
  'use strict';
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const mobileQuery = window.matchMedia('(max-width: 650px)');
  const hero = document.querySelector('.hero');
  const typeElements = [...document.querySelectorAll('.tech-text')];
  let disposeType = [];

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

  document.querySelectorAll('.magnetic').forEach(button => {
    button.addEventListener('pointermove', event => {
      if (motionQuery.matches || !finePointer.matches) return;
      const box = button.getBoundingClientRect();
      const x = event.clientX - box.left - box.width / 2;
      const y = event.clientY - box.top - box.height / 2;
      // Keep the button boundaries aligned; only the glass reflection tilts.
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

  const dialog = document.querySelector('#detail-panel');
  const panelContent = document.querySelector('#panel-content');
  let lastTrigger = null;
  function openPanel(name, trigger) {
    const template = document.querySelector(`#panel-${name}`);
    if (!template) return;
    if (!dialog.open) lastTrigger = trigger;
    panelContent.replaceChildren(template.content.cloneNode(true));
    document.body.classList.add('panel-open');
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
    document.querySelector('.close-panel').focus({ preventScroll: true });
  }
  document.addEventListener('click', event => {
    const trigger = event.target.closest('[data-panel]');
    if (trigger) openPanel(trigger.dataset.panel, trigger);
  });
  document.querySelector('.close-panel').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('panel-open');
    lastTrigger?.focus({ preventScroll: true });
  });
  document.addEventListener('submit', event => {
    if (event.target.id !== 'project-form') return;
    event.preventDefault();
    const data = new FormData(event.target);
    const name = String(data.get('name') || '').trim();
    const nameInput = event.target.elements.namedItem('name');
    if (!name) {
      nameInput.setCustomValidity('Please enter your name.');
      nameInput.reportValidity();
      nameInput.addEventListener('input', () => nameInput.setCustomValidity(''), { once: true });
      return;
    }
    const details = String(data.get('details') || '').trim();
    const message = `Hey Harshal! I’m ${name}. I’d love to talk about a ${data.get('service')} project.${details ? `\n\n${details}` : ''}`;
    window.open(`https://wa.me/917028235485?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  });

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
})();
