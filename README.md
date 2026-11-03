# Softly Solutions — Independent Multi-page Design Showcase

A standalone, responsive agency-style website demonstrating a complete reusable design language. **Built solely from this repository:** no code, branding, dependencies, or components are reused from other projects.

**Production:** https://agency.pincodeit.com/  
**Stack:** HTML5 · advanced CSS3 (Flexbox, Grid, custom properties, responsive layout) · modern ES6+ vanilla JavaScript · Cloudflare Workers Static Assets

## Pages

| Section | Clean URL |
|---|---|
| Home | `/` |
| Services | `/services/` |
| Concepts | `/work/` |
| The Studio | `/about/` |
| Process | `/process/` |
| Insights | `/insights/` |
| Contact | `/contact/` |
| Design System | `/design-system/` |
| Brand Guide | `/brand/` |

Includes **six independent illustrative concept detail pages**, **three complete original article pages**, and a custom 404 page: **19 generated HTML routes** in total.

## Source structure

```text
src/
  layout.html              Shared semantic HTML document template
  partials/                Navigation, footer, CTA, dialog, original hero
  pages/                   Each main page's content markup
  content/                 Independent portfolio concepts and articles (JSON)
  styles/                  site.css + pages.css + brand.css, all first-party
  brand/                   Logo masters, social artwork, token JSON and brand standards
  scripts/                 site.js (page lifecycle) + router.js (native SPA)
assets/images/             13 optimized, self-hosted WebP photographs
scripts/
  build-static.cjs         Dependency-free static page generator
  validate-site.cjs        All-route build validation
  dev-server.cjs           Dependency-free local preview server
tests/                     Playwright browser smoke tests
wrangler.jsonc             Cloudflare Workers Static Assets configuration
dist/                      Generated output, not committed
```

The original homepage's visual identity was preserved and extended across every destination. Shared header, footer, CTA, metadata, and page layouts are generated at build time. The native SPA router progressively enhances those pages with fast, history-aware navigation, while **every route still works as plain HTML when JavaScript is unavailable**.

## Native SPA navigation (no React or Next.js)

The site behaves like a single-page application for internal links while remaining a fully static, independently accessible multi-page website.

- `src/scripts/router.js` intercepts eligible, same-origin internal links. It fetches the destination HTML, replaces the shared page regions and updates the document title, canonical URL, description and Open Graph metadata **without a full browser reload**.
- HTML is still pre-rendered in `dist/`: a first-time direct visit, refresh, search crawler, browser without JavaScript, or a failed client-side fetch receives the normal full page.
- Browser Back and Forward use the History API. The router retains in-memory scroll positions and supports deep-link anchors and query parameters.
- A small bounded prefetch cache warms pages on hover/focus when data-saver settings permit. No SPA framework or frontend CDN is loaded.
- `src/scripts/site.js` re-initializes interactive controls whenever a new page is displayed. Global handlers are automatically cleaned up between routes.
- Keyboard users receive a focused main landmark after navigation, and assistive technology receives a nonvisual route announcement.

**Scope:** The website is an SEO-friendly static site with native SPA transitions. It does not claim Next.js server rendering, React Server Components, account authentication, databases, or dynamic backend functionality.

## Run locally

Requires Node.js 20+; **no `npm install`** is needed for building or serving the site.

```bash
node scripts/build-static.cjs
node scripts/validate-site.cjs
node scripts/dev-server.cjs
```

Then open http://127.0.0.1:4173/.

## Functionality

- Responsive navigation with an accessible mobile menu and current-page indicator
- Concept category filters and article search with accessible result counts
- Working article and concept detail navigation
- FAQ accordion, back-to-top, keyboard focus, and reduced-motion support
- Contact inquiry form with native validation and clipboard option; **prepares a message in your email client**, rather than claiming to send/store it through an unconfigured backend
- Interactive design-token palette for inspecting/copying colors
- Fully local CSS, JS, and image delivery with no frontend CDN requirements
- Per-page metadata, canonical URLs, robots.txt, sitemap.xml, and 404

**Content integrity:** All concepts are explicitly labeled illustrative. The site does not claim fabricated client projects, metrics, testimonials, or case-study results. Softly Solutions is a visual design-showcase identity and may be adapted for an approved client brief.

## Quality and deployments

Cloudflare Workers Builds is connected to the repository's `main` branch, with automatic GitHub push deployment. The build command is:

```bash
node scripts/build-static.cjs && node scripts/validate-site.cjs
```

Deploy command: `npx --yes wrangler@4.148.0 deploy`.

The GitHub Actions workflow executes Playwright responsive checks across **320, 375, 430, 768, 1024, and 1440px** on all primary pages, plus detail pages and main interactions. A separate SPA smoke suite verifies navigation without reloads, Back/Forward history, direct/reloaded URLs, query-specific contact forms, and the continued function of page controls. Before merging significant changes, confirm the pull request's checks pass.

No credentials or API secrets belong in the repository. The root `index.html` is a compatibility redirect for former GitHub Pages visitors; generated HTML in `dist/` is the only production output.

## Softly brand identity

Softly is a **standalone design-showcase identity**. Its wordmark, two-spark icon, palette, voice, and social artwork are original to this repository; they do not import or imitate assets from another project.

**Public brand guide:** [agency.pincodeit.com/brand/](https://agency.pincodeit.com/brand/)

The complete first-party brand kit is generated during the static build at `/assets/brand/softly-brand-kit.zip`. It includes SVG logos for dark/light backgrounds, the spark mark, raster social and app icons, tokens JSON and written usage guidance. The original warm-espresso and orange design of the homepage is preserved.

PNG exports are generated from the SVG masters with the repo's explicit `generate-brand-assets.yml` workflow and committed to `assets/brand/`. They are static assets, not a runtime CDN dependency. Do not remove the verified generated PNG exports before a production deployment.
