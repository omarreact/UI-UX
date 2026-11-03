# Softly Solutions — Brand Standards

**Type:** independent design-showcase concept. Softly Solutions is not presented as a verified registered agency or a collection of commissioned client work.

## 01 · Brand idea

**Tagline:** *Ideas with intention.*

**Promise:** Design should be memorable because it makes something clearer and more useful.

**Supporting statement:** Smarter digital. Stronger brands.

**Audience:** business owners, creative teams, and prospective clients choosing a design direction.

**Personality:** thoughtful, warm, quietly confident, human, a little playful.

## 02 · Logo and symbol

The primary signature combines a soft-square orange signal mark and the two-spark emblem with the Softly / SOLUTIONS wordmark. The linked sparks represent an idea becoming clearer.

- Use `logo-on-dark.svg` on espresso or dark photographic backgrounds.
- Use `logo-on-light.svg` on cream and white backgrounds.
- Use `mark.svg` for favicon, compact navigation, avatars, and app icons.
- Maintain at least one-quarter of the logo mark's width as clear space on all sides.
- Keep the original proportions, colors and letter spacing. Never stretch, rotate, re-color or add outline effects.
- Minimum digital logo width: 150 CSS px; compact mark minimum: 28 CSS px.

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

Large soft-corner sections contrast with compact expressive pills. The spark motif appears sparingly as a focal visual, never as a repeated distracting pattern. Use warm shadowing, slow dimensional hover movement and reduced-motion fallbacks.

## 06 · Voice and editorial rules

- **Say:** "Let's make your idea matter." / "Thoughtful by design." / "Clear ideas, useful experiences."
- **Avoid:** "Guaranteed 300% growth", fabricated client quotes, aggressive urgency, or claims of real partnerships that aren't verified.
- Content for example portfolios must say "illustrative concept" or equivalent.

## 07 · Social and digital

Social sharing preview: `social-card.png`, 1200 × 630. Avatar and application icon use the spark. `manifest.webmanifest` and touch icons should resolve to first-party assets.

## 08 · Implementation

All assets originate in `src/brand/`; the site generator copies them to `dist/assets/brand/`. The `/brand/` website page is the public, interactive brand reference. The package contains vector logos, a social card, icons, token JSON, and this guide.

© 2026 Softly Solutions design showcase. Creative direction only; no trademark or domain registration is represented or implied.
