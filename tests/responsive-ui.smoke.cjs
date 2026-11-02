/* Source-level browser regression tests for the agency landing page.
   Run: npm install --no-save --no-package-lock playwright
        npx playwright install chromium
        node tests/responsive-ui.smoke.cjs
*/
const { chromium } = require('playwright');
const { resolve } = require('path');
const { pathToFileURL } = require('url');
const fs = require('fs');

const sourceUrl = pathToFileURL(resolve(__dirname, '..', 'index.html')).href;
const sizes = [320, 375, 430, 768, 1024, 1440];
const failures = [];

function assert(condition, details) {
  if (!condition) throw new Error(details);
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  fs.mkdirSync(resolve(__dirname, 'screenshots'), { recursive: true });

  try {
    for (const width of sizes) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        isMobile: width <= 600,
        hasTouch: width <= 600,
        deviceScaleFactor: 1,
        reducedMotion: 'reduce'
      });
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      try {
        await page.goto(sourceUrl, { waitUntil: 'domcontentloaded' });
        const basics = await page.evaluate(() => {
          const ids = Array.from(document.querySelectorAll('[id]'), el => el.id);
          return {
            viewport: document.documentElement.clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            h1: document.querySelectorAll('h1').length,
            missingAnchors: Array.from(document.querySelectorAll('a[href^="#"]'))
              .map(a => a.getAttribute('href').slice(1))
              .filter(id => id && !document.getElementById(id)),
            duplicateIds: ids.filter((id, i) => ids.indexOf(id) !== i)
          };
        });
        assert(basics.scrollWidth <= basics.viewport + 1,
          `Horizontal overflow: ${basics.scrollWidth}px in ${basics.viewport}px viewport`);
        assert(basics.h1 === 1, 'Expected one primary heading');
        assert(basics.missingAnchors.length === 0, 'Unresolved internal navigation');
        assert(basics.duplicateIds.length === 0, 'Duplicate element IDs');

        if (width <= 900) {
          const toggle = page.locator('.mobile-toggle');
          const toggleHeight = await toggle.evaluate(el => el.getBoundingClientRect().height);
          assert(toggleHeight >= 44, 'Mobile menu touch target is smaller than 44px');
          await toggle.click();
          assert(await toggle.getAttribute('aria-expanded') === 'true', 'Mobile menu did not open');
          assert(await page.locator('#primary-navigation').evaluate(el => el.classList.contains('is-open')),
            'Mobile navigation is not visible');
          const mobileCTA = page.locator('#primary-navigation .nav-mobile-cta');
          assert(await mobileCTA.isVisible(), 'Mobile project CTA is missing');
          assert(await mobileCTA.getAttribute('href') === '#contact', 'Mobile CTA has wrong destination');
          assert(await mobileCTA.evaluate(el => el.getBoundingClientRect().height) >= 44,
            'Mobile CTA is smaller than 44px');
          await toggle.click();
          assert(await toggle.getAttribute('aria-expanded') === 'false', 'Mobile menu did not close');
        } else {
          assert(await page.locator('#primary-navigation').isVisible(), 'Desktop navigation is hidden');
          assert(!(await page.locator('.nav-mobile-cta').isVisible()), 'Mobile-only CTA visible on desktop');
        }

        const links = await page.evaluate(() => {
          const get = sel => {
            const el = document.querySelector(sel);
            const style = getComputedStyle(el);
            return { decoration: style.textDecorationLine, color: style.color,
              height: el.getBoundingClientRect().height, display: style.display };
          };
          return {
            nav: get('.nav-links a'),
            footer: get('footer .footer-grid a[href="#services"]'),
            primary: get('.hero-actions .orange-btn'),
            secondary: get('.hero-actions .outline-btn')
          };
        });
        assert(links.nav.decoration === 'none', 'Navigation links retain default underline');
        assert(links.nav.color !== 'rgb(0, 0, 238)', 'Navigation links retain browser default blue');
        assert(links.footer.decoration === 'underline', 'Footer lacks its designed hover underline');
        assert(links.primary.decoration === 'none' && links.secondary.decoration === 'none',
          'Primary/secondary CTA has an unintended underline');
        if (width > 900) assert(links.nav.height >= 44, 'Desktop navigation target below 44px');

        const faq = page.locator('.acc-btn');
        await faq.nth(1).click();
        assert(await faq.nth(1).getAttribute('aria-expanded') === 'true', 'FAQ did not open');
        assert(await faq.nth(0).getAttribute('aria-expanded') === 'false', 'FAQ did not close previous item');

        await page.locator('.insight-open').first().click();
        assert(await page.locator('#insight-dialog').evaluate(el => el.open), 'Insight dialog did not open');
        await page.locator('.insight-close').click();
        assert(!(await page.locator('#insight-dialog').evaluate(el => el.open)), 'Insight dialog did not close');

        assert(errors.length === 0, `Browser errors: ${errors.join('; ')}`);
        console.log(`PASS ${width}px: no overflow; link styles, mobile CTA, FAQ and Insights functional`);
      } catch (error) {
        failures.push(`${width}px: ${error.message}`);
        await page.screenshot({
          path: resolve(__dirname, 'screenshots', `failure-${width}.png`),
          fullPage: true
        }).catch(() => {});
        console.error(`FAIL ${width}px: ${error.message}`);
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  if (failures.length) {
    console.error('\nFailed checks:\n' + failures.join('\n'));
    process.exitCode = 1;
  } else {
    console.log('\nAll responsive UI smoke checks passed.');
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
