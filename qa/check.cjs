// Browser QA for the full portfolio page. Run `node server.cjs` first, then `node qa/check.cjs`.
// Uses a locally available Playwright; set PLAYWRIGHT_MODULE / CHROME_PATH on another machine.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/asus/AppData/Local/npm-cache/_npx/705bc6b22212b352/node_modules/playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const URL = 'http://127.0.0.1:4173/';
const executablePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function scrollTo(page, selector, offset = 0) {
  const goal = await page.evaluate(([s, o]) => (s === 'END' ? document.documentElement.scrollHeight : document.querySelector(s).getBoundingClientRect().top + window.scrollY + o), [selector, offset]);
  for (let i = 0; i < 10; i++) { await page.evaluate(g => window.scrollTo(0, window.scrollY + (g - window.scrollY) / 2), goal); await page.waitForTimeout(80); }
  await page.evaluate(g => window.scrollTo(0, g), goal);
  await page.waitForTimeout(1300);
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath });
  const report = {};

  // ---------- Desktop ----------
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  assert.equal((await page.goto(URL)).status(), 200);
  await page.waitForSelector('.preloader', { state: 'detached', timeout: 8000 });
  assert.equal((await page.locator('#hero-heading').innerText()).replace(/\s+/g, ' ').trim(), 'Let’s make your Website iconic.');
  await page.waitForFunction(() => document.documentElement.classList.contains('has-gl'), null, { timeout: 5000 }).catch(() => {});
  report.webgl = await page.evaluate(() => document.documentElement.classList.contains('has-gl'));
  assert.equal(await page.locator('.cursor').count(), 0, 'No custom cursor');
  assert.equal(await page.evaluate(() => getComputedStyle(document.querySelector('.header-cta')).opacity), '0', 'Header CTA hidden at the top');
  assert.equal(await page.locator('.btn .btn-text .c').first().count(), 1, 'Button labels split for the roll');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'qa/desktop.png' });

  const images = await page.locator('img[src]:not([loading=lazy])').evaluateAll(list => list.map(i => ({ src: i.getAttribute('src'), ok: i.complete && i.naturalWidth > 0 })));
  assert(images.every(i => i.ok), `Eager images load: ${JSON.stringify(images.filter(i => !i.ok))}`);
  assert.equal(await page.locator('#linkedin-link').getAttribute('href'), 'https://www.linkedin.com/in/harshaltarwale/');
  assert.equal(await page.locator('.social-rail a').first().getAttribute('href'), 'https://wa.me/917028235485');
  const external = await page.locator('a[target=_blank]').evaluateAll(list => list.every(a => a.rel.includes('noopener')));
  assert(external, 'External links use rel=noopener');

  // Nav scrolls to sections and marks the active link
  await page.locator('.header nav a', { hasText: 'Work' }).click();
  await page.waitForTimeout(2200);
  const workTop = await page.evaluate(() => document.querySelector('#work').getBoundingClientRect().top);
  assert(Math.abs(workTop) < 120, `Work section reached by nav (top=${workTop})`);
  assert.deepEqual(await page.locator('.header nav a.is-active').allTextContents(), ['Work']);

  // Every section renders visible content once scrolled to
  for (const sel of ['.about', '.services', '.work', '.process', '.why', '.contact', '.footer']) {
    await scrollTo(page, sel, 120);
    const visible = await page.evaluate(s => { const r = document.querySelector(s).getBoundingClientRect(); return r.height > 200; }, sel);
    assert(visible, `${sel} renders`);
  }
  // The ID badge mounts once the About section is on screen
  await scrollTo(page, '.about', -160);
  report.lanyard = await page.waitForFunction(() => document.querySelector('.lanyard-wrap').classList.contains('is-live'), null, { timeout: 8000 }).then(() => true).catch(() => false);
  assert(report.lanyard, 'Lanyard badge goes live');
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'qa/about.png' });

  // Lazy project screenshots load once reached
  await scrollTo(page, '.index-list', -200);
  const lazy = await page.locator('.case img, .index-list img').evaluateAll(list => list.filter(i => i.offsetParent !== null && !(i.complete && i.naturalWidth > 0)).map(i => i.src));
  report.lazyNotLoaded = lazy;

  // Brief → prepared WhatsApp message
  await scrollTo(page, '.contact', 100);
  await page.locator('#project-name').fill('Test User');
  await page.locator('#project-details').fill('A bold portfolio with motion.');
  await page.locator('input[value="UI/UX design"]').check({ force: true });
  await page.locator('input[name=timeline][value="as soon as possible"]').check({ force: true });
  await page.evaluate(() => { window.open = (...args) => { window.testPopup = args; }; });
  await page.getByRole('button', { name: 'Send on WhatsApp' }).click();
  const popup = decodeURIComponent((await page.evaluate(() => window.testPopup))[0]);
  assert(popup.startsWith('https://wa.me/917028235485?text='));
  for (const part of ['Test User', 'UI/UX design', 'as soon as possible', 'A bold portfolio with motion.']) assert(popup.includes(part), `Message includes ${part}`);
  await page.screenshot({ path: 'qa/contact.png' });

  // Empty name is rejected
  await page.locator('#project-name').fill('');
  await page.evaluate(() => { window.testPopup = null; });
  await page.getByRole('button', { name: 'Send on WhatsApp' }).click();
  assert.equal(await page.evaluate(() => window.testPopup), null, 'Empty name blocks submission');

  await scrollTo(page, 'END');
  await page.screenshot({ path: 'qa/footer.png' });
  assert.deepEqual(errors, [], `No console errors: ${errors.join(' | ')}`);
  await page.close();

  // ---------- Mobile ----------
  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  const m = await mobile.newPage();
  await m.goto(URL);
  await m.waitForSelector('.preloader', { state: 'detached', timeout: 8000 });
  await m.waitForTimeout(2800);
  await m.screenshot({ path: 'qa/mobile.png' });
  const overflow = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  assert(overflow <= 0, `No horizontal overflow on mobile (${overflow}px)`);
  await scrollTo(m, '.work', 200);
  await m.screenshot({ path: 'qa/mobile-work.png' });
  await mobile.close();

  // ---------- Reduced motion: no preloader, everything readable ----------
  const calm = await browser.newContext({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
  const c = await calm.newPage();
  await c.goto(URL);
  await c.waitForTimeout(800);
  assert.equal(await c.locator('.preloader').count(), 0, 'Preloader skipped with reduced motion');
  await scrollTo(c, '.about', 100);
  const opacity = await c.evaluate(() => getComputedStyle(document.querySelector('.statement')).opacity);
  assert.equal(opacity, '1');
  await calm.close();

  await browser.close();
  report.result = 'pass';
  fs.writeFileSync('qa/report.json', JSON.stringify(report, null, 2));
  console.log('QA passed', report);
})().catch(error => { console.error(error); process.exit(1); });
