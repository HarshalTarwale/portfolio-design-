const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Users/asus/AppData/Local/npm-cache/_npx/705bc6b22212b352/node_modules/playwright-core');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 919 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  const response = await page.goto('http://127.0.0.1:4173/');
  assert.equal(response.status(), 200);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForSelector('.tech-text.is-ready');
  await page.waitForTimeout(600);
  await page.screenshot({ path: 'qa/desktop.png', fullPage: true });
  const assets = await page.locator('.hero img, .social-rail img').evaluateAll(images => images.map(image => ({ src: image.getAttribute('src'), loaded: image.complete && image.naturalWidth > 0, width: image.getBoundingClientRect().width, height: image.getBoundingClientRect().height })));
  assert(assets.every(asset => asset.loaded && asset.width > 0 && asset.height > 0));
  assert.equal(await page.locator('#linkedin-link').getAttribute('href'), 'https://www.linkedin.com/in/harshaltarwale/');
  assert.equal(await page.locator('.social-rail a').first().getAttribute('href'), 'https://wa.me/917028235485');
  const ink = await page.locator('.tech-text.is-ready canvas').evaluateAll(canvases => canvases.map(canvas => {
    const pixels = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
    let count = 0;
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] > 0) count++;
    return count;
  }));
  assert(ink.every(count => count > 5000), 'Both canvas headings render visible ink');
  const before = await page.locator('.social-rail').boundingBox();
  await page.evaluate(() => window.scrollTo(0, 116));
  const after = await page.locator('.social-rail').boundingBox();
  assert.equal(Math.round(before.y), Math.round(after.y), 'Social rail remains fixed while scrolling');
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.mouse.move(511, 482);
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'qa/text-hover.png' });
  await page.mouse.click(511, 482);
  await page.waitForTimeout(80);
  await page.screenshot({ path: 'qa/text-click.png' });
  await page.mouse.move(1250, 750);
  await page.getByRole('button', { name: 'Start a project', exact: true }).click();
  assert(await page.locator('#detail-panel').evaluate(element => element.open));
  await page.locator('#project-name').fill('Test User');
  await page.locator('#project-details').fill('A bold portfolio with motion.');
  await page.locator('input[value="UI/UX design"]').check();
  await page.evaluate(() => { window.open = (...args) => { window.testPopup = args; }; });
  await page.getByRole('button', { name: 'Let’s talk on WhatsApp' }).click();
  const popup = await page.evaluate(() => window.testPopup);
  assert(popup[0].startsWith('https://wa.me/917028235485?text='));
  assert(decodeURIComponent(popup[0]).includes('Test User'));
  assert(decodeURIComponent(popup[0]).includes('UI/UX design'));
  await page.screenshot({ path: 'qa/contact.png' });
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#detail-panel').evaluate(element => element.open), false);
  assert.equal(await page.evaluate(() => document.activeElement.textContent.includes('Start a project')), true);
  for (const name of ['Services', 'Work', 'About', 'Connect']) {
    await page.getByRole('navigation').getByRole('button', { name, exact: true }).click();
    assert(await page.locator('#panel-title').isVisible());
    await page.getByRole('button', { name: 'Close panel' }).click();
  }
  await page.getByRole('button', { name: 'A little curious? Touch the type.' }).click();
  await page.waitForTimeout(100);
  const layouts = [];
  for (const width of [320, 390, 768, 1024, 1920]) {
    await page.setViewportSize({ width, height: width < 600 ? 844 : 1000 });
    await page.waitForTimeout(200);
    const dimensions = await page.evaluate(() => ({ width: innerWidth, scrollWidth: document.documentElement.scrollWidth }));
    assert.equal(dimensions.width, dimensions.scrollWidth, `No horizontal overflow at ${width}`);
    layouts.push(dimensions);
    if (width === 390) {
      await page.screenshot({ path: 'qa/mobile.png', fullPage: true });
      await page.getByRole('button', { name: 'Start a project', exact: true }).click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: 'qa/mobile-contact.png', fullPage: true });
      await page.keyboard.press('Escape');
    }
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(100);
  assert.equal(await page.locator('.tech-text.is-ready').count(), 0);
  assert(await page.locator('.text-fallback').first().isVisible());
  const fallback = await browser.newPage({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  await fallback.goto('http://127.0.0.1:4173/');
  assert(await fallback.locator('.text-fallback').first().isVisible());
  assert.equal(errors.length, 0, errors.join('\n'));
  const report = { status: 'passed', assets, headingInkPixels: ink, layouts, checks: ['desktop and mobile rendering', 'local assets loaded', 'canvas type renders', 'fixed social rail', 'navigation panels', 'WhatsApp message composition (intercepted, not sent)', 'Escape and focus restoration', 'responsive widths 320–1920px', 'reduced motion', 'text fallback without JavaScript', 'no browser errors'] };
  fs.writeFileSync('qa/report.json', JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
