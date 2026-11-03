// Full SPA navigation regression: no document reload, history, route state,
// SEO metadata, deep links and safe page-by-page event initialization.
(async function runSpaSmoke() {
  "use strict";
  const { chromium } = require("playwright");
  const { createSiteServer } = require("../scripts/dev-server.cjs");
  const server = createSiteServer();
  const assert = (value, message) => { if (!value) throw Error(message); };
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const base = "http://127.0.0.1:" + server.address().port;
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of [375, 1440]) {
      const page = await browser.newPage({
        viewport: { width, height: 900 },
        isMobile: width === 375,
        hasTouch: width === 375,
        reducedMotion: "reduce"
      });
      const errors = [];
      const fallbacks = [];
      page.on("pageerror", e => errors.push(e.message));
      page.on("console", msg => { if (msg.text().includes("Softly SPA navigation fallback:")) fallbacks.push(msg.text()); });
      const route = async pathname => {
        await page.waitForFunction(expected =>
          location.pathname + location.search === expected &&
          document.querySelector("main")?.getAttribute("aria-busy") !== "true", pathname);
      };
      const clickWithoutScrolling = async selector => {
        await page.evaluate(css => {
          const element = document.querySelector(css);
          if (!element) throw Error("Cannot find link " + css);
          element.click();
        }, selector);
      };
      const checkNoReload = async expectedPage => {
        const data = await page.evaluate(() => ({
          sentinel: window.__softlySpaSentinel,
          page: document.body.dataset.page,
          title: document.title,
          canonical: document.querySelector('link[rel="canonical"]')?.href,
          eventCount: window.__softlyEvents || 0
        }));
        assert(data.sentinel === "unchanged-browser-document",
          "A navigation unexpectedly reloaded the document at " + width + " route=" + page.url() + " fallback=" + fallbacks.join(" | "));
        assert(data.page === expectedPage,
          "Incorrect page state after client navigation: " + JSON.stringify(data));
        assert(new URL(data.canonical).pathname === new URL(page.url()).pathname,
          "Canonical metadata did not update for " + page.url());
        assert(data.eventCount > 0, "The route-change lifecycle event did not fire");
      };

      try {
        const start = await page.goto(base + "/", { waitUntil: "load" });
        assert(start.status() === 200, "Homepage must be available without the router");
        assert(await page.locator(".hero-content").count() === 1,
          "Original homepage hero changed");
        await page.evaluate(() => {
          window.__softlySpaSentinel = "unchanged-browser-document";
          window.__softlyEvents = 0;
          document.addEventListener("site:navigated", () => { window.__softlyEvents++; });
        });
        // Native click delegates to the SPA router, rather than a full reload.
        await clickWithoutScrolling('footer a[href="/work/"]');
        await route("/work/");
        await checkNoReload("work");
        assert((await page.title()).includes("Concepts"), "Work title not updated");
        const chips = page.locator("[data-filter]");
        await chips.filter({ hasText: "Brand & Editorial" }).click();
        assert(await page.locator(".showcase-card:visible").count() === 2,
          "Work filter stopped working after a SPA transition");

        // Browser Back/Forward must render the matching content without reload.
        await clickWithoutScrolling('footer a[href="/insights/"]');
        await route("/insights/");
        await checkNoReload("insights");
        await page.locator("[data-article-search]").fill("automation");
        assert(await page.locator(".article-card:visible").count() === 1,
          "Article search stopped working after a SPA transition");

        await page.evaluate(() => history.back());
        await route("/work/");
        await checkNoReload("work");
        assert(await page.locator(".showcase-card:visible").count() === 6,
          "Returning to Work did not initialize its controls");

        await page.evaluate(() => history.forward());
        await route("/insights/");
        await checkNoReload("insights");
        assert(await page.locator("[data-article-search]").count() === 1,
          "Forward history did not restore the Insights document");

        // Navigate to a concept and then to a query-parameterized contact form.
        await clickWithoutScrolling('footer a[href="/work/"]');
        await route("/work/");
        await clickWithoutScrolling('.showcase-card h3 a[href="/work/novahire/"]');
        await route("/work/novahire/");
        await checkNoReload("work");
        await clickWithoutScrolling('.related-links a[href^="/contact/?service="]');
        await route("/contact/?service=Custom%20Design%20Concept");
        await checkNoReload("contact");
        assert(await page.locator("#project-service").inputValue() ===
          "Custom Design Concept", "Contact query preselection failed");
        assert(!await page.locator("#project-form").evaluate(el => el.checkValidity()),
          "Empty form should remain invalid");

        // Direct loading and refreshing every route still works without client state.
        const reloaded = await page.reload({ waitUntil: "load" });
        assert(reloaded.status() === 200, "Direct contact refresh failed");
        assert(await page.locator("#project-service").inputValue() ===
          "Custom Design Concept", "Direct route query handling failed");
        assert(await page.evaluate(() => window.__softlySpaSentinel) === undefined,
          "Refresh did not produce a new browser document");
        // A deliberate hard reload clears this test-only sentinel.
        // Re-establish it before checking subsequent no-reload SPA transitions.
        await page.evaluate(() => {
          window.__softlySpaSentinel = "unchanged-browser-document";
          window.__softlyEvents = 0;
          document.addEventListener("site:navigated", () => { window.__softlyEvents++; });
        });

        // A deep hash URL works when crossed from another SPA page.
        await clickWithoutScrolling('footer a[href="/services/#brand-strategy"]');
        await page.waitForFunction(() =>
          location.pathname === "/services/" && location.hash === "#brand-strategy" &&
          !!document.getElementById("brand-strategy"));
        assert(await page.locator(".services-showcase-hero").count() === 1,
          "The existing Services hero was modified");
        const viewport = await page.evaluate(() => ({
          width: document.documentElement.clientWidth,
          scroll: document.documentElement.scrollWidth
        }));
        assert(viewport.scroll <= viewport.width + 1, "SPA caused horizontal overflow");

        // The new independent brand guide also participates in SPA transitions.
        await clickWithoutScrolling('footer a[href="/brand/"]');
        await route("/brand/");
        await checkNoReload("brand");
        assert(await page.locator(".brand-logo-panel img").count() === 2,
          "Brand identity signatures missing after SPA navigation");
        assert(await page.locator(".brand-color").count() === 6,
          "Brand colors missing after SPA navigation");
        await page.locator(".brand-color").first().click();
        await page.waitForFunction(() =>
          (document.querySelector("[data-color-status]")?.textContent || "").includes("#"));
        const card=await page.request.get(base + "/assets/brand/social-card.png");
        assert(card.status()===200, "Brand social PNG not available");
        
        // A new visitor can open the direct route with no SPA navigation.
        const fresh = await browser.newPage();
        const direct = await fresh.goto(base + "/process/", { waitUntil: "load" });
        assert(direct.status() === 200, "Direct Process page unavailable");
        assert(await fresh.locator(".editorial-showcase-hero").count() === 1,
          "Direct route is missing pre-rendered content");
        await fresh.close();
        assert(errors.length === 0, "Browser runtime errors: " + errors.join("; "));
        console.log("PASS native SPA " + width +
          "px: navigation, history, direct links, search, filters, query state");
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
})().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
