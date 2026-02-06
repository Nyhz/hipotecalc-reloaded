# Hipotecalc Visual Upgrade Plan

## Goal
Upgrade the full site into a more professional, premium finance product look while keeping performance, clarity, and conversion focus.

## Current UX/UI Audit (High Impact Findings)
- Typography looks generic (`Roboto` + default Tailwind scale), which weakens perceived trust and brand quality.
- Color system is mostly one-note blue with limited neutral hierarchy; sections blend together.
- Navbar and footer are functional but visually basic and low in brand character.
- Home page cards and calculator pages use similar white boxes everywhere, creating low visual rhythm.
- Spacing and container rhythm are inconsistent between home and calculators.
- CTA hierarchy is weak on some screens (primary action not always dominant).
- Some duplicated component paths (`src/components/*` and `src/components/layout/*`) increase risk of style drift.

## Visual Direction (Recommended)
- Brand style: clean fintech editorial.
- Tone: trustworthy, modern, precise.
- Contrast strategy:
  - Dark slate text and surfaces for structure.
  - Rich blue as primary action color.
  - Teal/emerald accents for positive results.
  - Warm amber for warnings.

## Design System Upgrades

### 1) Typography
- Replace `Roboto` with a more premium pairing:
  - Heading: `Manrope` or `Sora`.
  - Body/UI: `Inter` or `Plus Jakarta Sans`.
- Define tokenized type scale in CSS variables:
  - `--text-xs` through `--text-display`.
- Tighten heading tracking and improve line-height for financial data blocks.

### 2) Color Tokens
- Introduce semantic tokens in `:root`:
  - `--bg`, `--surface`, `--surface-elevated`, `--text-primary`, `--text-muted`
  - `--brand-500`, `--brand-600`, `--success-500`, `--warning-500`, `--danger-500`
- Replace direct hardcoded blues where possible with semantic tokens.

### 3) Spacing + Radius + Shadow
- Standardize:
  - Radius: `10/14/20`
  - Shadows: `soft`, `card`, `floating`
  - Section spacing: `py-16` desktop, `py-12` mobile
- Define reusable classes for card shells and section containers.

### 4) Motion
- Add restrained motion:
  - Staggered reveal for hero trust indicators and tool cards.
  - Subtle hover lift and border glow on cards.
  - No heavy animations on calculator results.

## Component-Level Upgrades

### Navbar
- Convert to semi-transparent glass nav with backdrop blur and stronger active link treatment.
- Add clear current-page indicator.
- Improve mobile menu panel style and tap targets.

### Hero
- Keep the right-side mortgage mockup but upgrade composition:
  - Stronger backdrop gradients + subtle grid/noise texture.
  - Sharper card hierarchy and stat chips.
  - Add proof strip (e.g. “Used by X buyers/investors”).

### Tool Cards (`Herramientas`)
- Use asymmetric icon blocks, stronger card headers, and refined hover states.
- Add short metadata row per card (time-to-use, complexity, output).

### Calculator Pages
- Introduce 2-column layout shell:
  - Sticky summary rail on desktop.
  - Form in progressive sections with visual separators.
- Improve input component polish:
  - Label contrast, helper text, focus ring consistency.
- For KPI cards and chart cards:
  - consistent headers
  - status coloring by metric polarity
  - clearer numeric hierarchy

### Footer
- Expand footer into a professional information footer:
  - short brand summary
  - product links
  - legal/privacy links
  - language toggle

## Structural / Code Hygiene Upgrades
- Remove duplicate legacy layout components under `src/components/layout/*` if unused.
- Centralize UI primitives:
  - Button
  - Card
  - SectionHeader
  - StatBadge
- Keep i18n copy aligned with new UI labels before visual release.

## Performance + Accessibility
- Keep color contrast AA minimum.
- Preserve current CLS protections but simplify repeated global CSS.
- Audit focus styles on all interactive controls.
- Avoid loading heavy decorative assets on calculator pages.

## Execution Plan

### Phase 1 (Quick Professional Lift, 1-2 days)
- Typography upgrade
- Color tokens
- Navbar + footer restyle
- Home spacing/card polish

### Phase 2 (Core Product UX, 2-4 days)
- Calculator layout shell
- Unified input/select styling
- KPI and chart card redesign

### Phase 3 (Brand Depth, 1-2 days)
- Hero visual refresh
- Section backgrounds and subtle textures
- Motion polish

### Phase 4 (Cleanup + QA, 1 day)
- Remove duplicate components
- Responsive QA (mobile/tablet/desktop)
- Accessibility pass

## Success Criteria
- Visual consistency across all pages (single system language).
- Improved “professional/trustworthy” perception in user feedback.
- No regressions in build, SEO tags, i18n, or critical performance.
- Better CTA clarity on home and calculator flows.

