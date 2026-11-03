# Softly Solutions — Brand Standards

**Type:** independent design-showcase concept. Softly Solutions is not presented as a verified registered agency or a collection of commissioned client work.

## 01 · Brand idea

**Tagline:** *Ideas with intention.*

**Promise:** Design should be memorable because it makes something clearer and more useful.

**Supporting statement:** Smarter digital. Stronger brands.

**Audience:** business owners, creative teams, and prospective clients choosing a design direction.

**Personality:** thoughtful, warm, quietly confident, human, a little playful.

## 02 · Typography-only logo

The primary Softly Solutions signature is a **text-only wordmark**: "Softly." set in a high-contrast editorial serif with a warm orange final period, and a small spaced-out "SOLUTIONS" descriptor. It does **not** use a pictorial icon in the navigation, footer or horizontal logo exports.

- Use `logo-on-dark.svg` on espresso or other dark surfaces.
- Use `logo-on-light.svg` on cream and white surfaces.
- Use selectable HTML text in the website navigation and footer (not a rasterized logo).
- At small square sizes only, use `mark.svg`: a typographic **S.** lettermark on an orange field, for browser tabs, app icons and avatars.
- Maintain at least the cap height of the descriptor as clear space around the full wordmark.
- Never distort, stretch, rotate, outline, or recolor the signature. Keep the orange period and the original text relationship.
- Minimum digital full wordmark width: 140 CSS px. Square lettermark minimum: 28 CSS px.

## 03 · Color

| Token | HEX | Use |
|---|---|---|
| Night | #120807 | Primary dark surfaces |
| Ink | #211915 | Body text and dark-on-light icons |
| Canvas | #F4F1EC | Section base |
| Paper | #FFFAF4 | Light cards and content |
| Signal | #FF6B35 | Distinctive accent and active controls |
| Muted | #8D8178 | Secondary text; check accessible contrast |
| Apricot | #FF954A | Gradient and decorative highlight |

Use pale text on Night, Ink on Paper, and white on orange when sufficient contrast exists; button sizes and contrast should always be validated. Avoid using the muted color for very small, essential text on light backgrounds.

## 04 · Typography

- **Display:** Georgia / Times New Roman (or a licensed similar expressive serif). Tight, readable headline spacing.
- **Body and UI:** Inter when installed; system-ui and Segoe UI / Arial fallbacks. No font CDN.
- **Hierarchy:** one strong editorial headline; restrained eyebrows; concise supporting text.
- **Scale:** fluid headings with `clamp()`, body normally 15–18px, controls minimum 44px tall.

## 05 · Shape and motion

Large soft-corner sections contrast with compact expressive pills. The enlarged typographic S. motif may appear sparingly as a focal visual, never as a distracting pattern. Use warm shadowing, slow dimensional hover movement and reduced-motion fallbacks.

## 06 · Voice and editorial rules

- **Say:** "Let's make your idea matter." / "Thoughtful by design." / "Clear ideas, useful experiences."
- **Avoid:** "Guaranteed 300% growth", fabricated client quotes, aggressive urgency, or claims of real partnerships that aren't verified.
- Content for example portfolios must say "illustrative concept" or equivalent.

## 07 · Social and digital

Social sharing preview: `social-card.png`, 1200 × 630. Avatar and application icon use the typographic S. lettermark. `manifest.webmanifest` and touch icons should resolve to first-party assets.

## 08 · Implementation

All assets originate in `src/brand/`; the site generator copies them to `dist/assets/brand/`. The `/brand/` website page is the public, interactive brand reference. The package contains vector text logos, the typographic lettermark, a social card, icons, token JSON, and this guide.

© 2026 Softly Solutions design showcase. Creative direction only; no trademark or domain registration is represented or implied.
