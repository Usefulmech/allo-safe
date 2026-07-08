---
name: Neutral Sophistication
colors:
  surface: '#fdf8f8'
  surface-dim: '#ddd9d8'
  surface-bright: '#fdf8f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f7f3f2'
  surface-container: '#f1edec'
  surface-container-high: '#ebe7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1c1b1b'
  on-surface-variant: '#444748'
  inverse-surface: '#313030'
  inverse-on-surface: '#f4f0ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#272727'
  on-primary: '#ffffff'
  primary-container: '#3d3d3d'
  on-primary-container: '#a9a8a7'
  inverse-primary: '#c8c6c6'
  secondary: '#5f5e5e'
  on-secondary: '#ffffff'
  secondary-container: '#e5e2e1'
  on-secondary-container: '#656464'
  tertiary: '#292626'
  on-tertiary: '#ffffff'
  tertiary-container: '#3f3c3c'
  on-tertiary-container: '#aba6a6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e4e2e1'
  primary-fixed-dim: '#c8c6c6'
  on-primary-fixed: '#1b1c1c'
  on-primary-fixed-variant: '#474747'
  secondary-fixed: '#e5e2e1'
  secondary-fixed-dim: '#c9c6c5'
  on-secondary-fixed: '#1c1b1b'
  on-secondary-fixed-variant: '#474646'
  tertiary-fixed: '#e7e1e1'
  tertiary-fixed-dim: '#cbc5c5'
  on-tertiary-fixed: '#1d1b1b'
  on-tertiary-fixed-variant: '#494646'
  background: '#fdf8f8'
  on-background: '#1c1b1b'
  surface-variant: '#e5e2e1'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  title-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
  numeral-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '300'
    lineHeight: 48px
    letterSpacing: -0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  container-margin: 24px
  gutter: 16px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  section-padding: 64px
---

## Brand & Style

This design system embodies a "Warm Minimalist" aesthetic, blending the precision of fintech with a grounded, organic palette. The target audience includes professionals and high-net-worth individuals who value clarity, stability, and understated luxury. 

The design style leverages **Minimalism** with subtle **Tonal Layering**. By using a warm off-white background contrasted against deep charcoal interactive elements, the UI evokes a sense of "digital stationery"—reliable, tactile, and highly legible. The emotional response is one of calm control and intellectual rigor, avoiding the frantic energy of traditional trading apps in favor of a curated, editorial experience.

## Colors

The palette is anchored by a high-contrast neutral core. **#3D3D3D (Charcoal)** serves as the primary driver for action, used for navigation anchors and primary buttons to provide a heavy "ink" feel on the screen. **#F7F7F5 (Off-white)** provides a soft, non-clinical canvas that reduces eye strain compared to pure white.

**#D4880F (Ochre)** is used sparingly for positive financial indicators, success states, and key highlights, providing a sophisticated alternative to standard green. **#DC2626** is reserved strictly for debt, critical alerts, and negative balances, ensuring immediate visual recognition of risk.

## Typography

The design system utilizes **Inter** exclusively to maintain a systematic, utilitarian appearance that prioritizes data density and legibility. 

- **Headlines:** Use a tighter letter-spacing and heavier weights to create authority.
- **Body:** Set with generous line-heights for comfortable reading of financial reports.
- **Labels:** Small caps and increased tracking are used for metadata to differentiate it from actionable text.
- **Numerals:** Financial data should prioritize tabular lining figures where possible to ensure columns of numbers align perfectly in lists and tables.

## Layout & Spacing

The design system employs a **Fluid Grid** model with a maximum content width of 1280px. 

- **Desktop:** 12-column grid, 24px gutters, 40px side margins.
- **Tablet:** 8-column grid, 16px gutters, 24px side margins.
- **Mobile:** 4-column grid, 16px gutters, 16px side margins.

Horizontal spacing follows a 4px baseline, while vertical "stacking" uses a 16px rhythm to maintain clear separation between data clusters. Use `section-padding` to create clear breaks between distinct financial modules (e.g., separating Net Worth overview from Transaction History).

## Elevation & Depth

Hierarchy is established through **Tonal Layers** rather than heavy shadows. 

1. **Background (#F7F7F5):** The lowest layer, representing the page itself.
2. **Surface (#FFFFFF):** Used for cards and primary content containers. These should have a 1px solid border of `#EBEBE8` instead of a shadow to maintain a crisp, flat aesthetic.
3. **Floating/Active:** For menus and modals, use a very soft, highly diffused shadow: `0 12px 32px rgba(26, 26, 26, 0.08)`.

Interactive elements like buttons do not use shadows but instead rely on a color shift (Charcoal to Pure Black) to indicate "press" states.

## Shapes

The design system utilizes a **Rounded** (8px / 0.5rem) shape language. This provides a soft, approachable feel that counterbalances the strictness of the charcoal and off-white color palette. 

- **Small Components (Buttons, Inputs):** 8px (0.5rem).
- **Medium Components (Cards, Modals):** 16px (1rem).
- **Large Components (Hero Areas):** 24px (1.5rem).

Interactive states (like checkboxes) follow the same 8px corner radius, ensuring consistency across all points of contact.

## Components

### Buttons
- **Primary:** Background `#3D3D3D`, Text `#FFFFFF`. Hover transitions to `#1A1A1A`. 8px corner radius.
- **Secondary:** Transparent background, 1.5px border of `#3D3D3D`, Text `#3D3D3D`.
- **Tertiary/Ghost:** Text `#737373`, no border. Hover shows a light gray wash `#F2F2F0`.

### Input Fields
- **Default:** White background, 1px border `#EBEBE8`. 
- **Focus:** Border changes to `#3D3D3D` with a subtle 2px outer glow of `#3D3D3D` at 5% opacity.
- **Label:** `label-md` style positioned above the field.

### Cards
- **Container:** White background, 1px border `#EBEBE8`, 16px padding.
- **Header:** Bottom-bordered with 1px `#F2F2F0` to separate title from content.

### Chips/Badges
- **Income/Success:** Background `#D4880F` at 10% opacity, Text `#D4880F`, 500 weight.
- **Debt/Danger:** Background `#DC2626` at 10% opacity, Text `#DC2626`, 500 weight.

### Lists
- **Financial Row:** 16px vertical padding, 1px border-bottom `#F2F2F0`. Hover state uses background `#F7F7F5`. Large numbers (amounts) use `title-md` or `numeral-xl` for emphasis.