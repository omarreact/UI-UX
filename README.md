# Softly Solutions — Agency Landing Page

A responsive, static agency website using **HTML5, advanced native CSS, and vanilla JavaScript**, deployed through **Cloudflare Workers Static Assets**.

- Website: https://agency.pincodeit.com/
- Source: https://github.com/omarreact/UI-UX
- Cloudflare Worker: `pincode-agency`
- Production branch: `main`
- Content: `index.html`
- Photography: `assets/images/*.webp` (13 first-party WebP images)

## Local build

Requires Node.js 20+; no npm install or framework dependencies.

```sh
node scripts/build-static.cjs
node scripts/validate-site.cjs
```

This creates `dist/` with `index.html`, all optimized images, and static response headers.

## Responsive browser QA

The `Responsive UI smoke checks` GitHub Actions workflow checks the build and runs Chromium interaction tests at **320, 375, 430, 768, 1024, and 1440px**. Checks cover overflow, accessible navigation, FAQ state, Insights dialogs, and JavaScript runtime errors.

Source: `tests/responsive-ui.smoke.cjs`. The Playwright dependency is only used for CI testing; it is never delivered to visitors.

## Cloudflare Workers Builds

Cloudflare Builds is connected to `omarreact/UI-UX`, branch `main`.

| Setting | Value |
|---|---|
| Build command | `node scripts/build-static.cjs && node scripts/validate-site.cjs` |
| Deploy command | `npx --yes wrangler@4.148.0 deploy` |
| Wrangler config | `wrangler.jsonc` |
| Output directory | `dist/` |
| Production Worker | `pincode-agency` |

If an update is not triggering Cloudflare Builds automatically, confirm the **Cloudflare Workers & Pages GitHub App** has access to the `omarreact/UI-UX` repository at https://github.com/settings/installations. Automatic builds require GitHub event access, not merely a saved repository connection. A manual build can also be started from **Cloudflare → Workers & Pages → pincode-agency → Deployments / Builds**.

The older GitHub Pages `CNAME` file is legacy metadata; **Cloudflare Workers** serves the custom production domain.

## Content verification

Portfolio examples are labeled **illustrative concepts** rather than completed client engagements. Testimonials and numerical marketing claims were removed because independently verifiable business evidence was not supplied.

Contact requests point to `admin@pincodeit.com`. Before representing the site as a separate real agency, confirm the **Softly Solutions** name and replace illustrative concepts with real, authorized work.

## Deployment safety

The build script fails if any of the 13 optimized images is missing or a prohibited CDN dependency is introduced. The validation script checks internal anchors, duplicate IDs, JavaScript syntax, and disclosures. Cloudflare version history provides rollback.

Do not commit tokens, secret keys, credentials, or deployment-hook URLs.

## GitHub push delivery check

Changes pushed to `main` are intended to start the Cloudflare Workers Builds production trigger. This repository includes automated responsive and static validation checks; before announcing a new production release, confirm both GitHub checks and the matching Cloudflare build/deployment status. See Cloudflare Workers Builds for the source commit and deployment version.
