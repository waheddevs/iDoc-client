---
name: Obsidian Horizon
colors:
  surface: '#111317'
  surface-dim: '#111317'
  surface-bright: '#37393e'
  surface-container-lowest: '#0c0e12'
  surface-container-low: '#1a1c20'
  surface-container: '#1e2024'
  surface-container-high: '#282a2e'
  surface-container-highest: '#333539'
  on-surface: '#e2e2e8'
  on-surface-variant: '#e2bfb3'
  inverse-surface: '#e2e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#a98a7f'
  outline-variant: '#594138'
  surface-tint: '#ffb59a'
  primary: '#ffb59a'
  on-primary: '#5b1b00'
  primary-container: '#ff6b2b'
  on-primary-container: '#5c1c00'
  inverse-primary: '#a83900'
  secondary: '#ffb59d'
  on-secondary: '#5d1800'
  secondary-container: '#b43700'
  on-secondary-container: '#ffd8cc'
  tertiary: '#ffb59f'
  on-tertiary: '#5f1600'
  tertiary-container: '#f2744d'
  on-tertiary-container: '#601700'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdbce'
  primary-fixed-dim: '#ffb59a'
  on-primary-fixed: '#380d00'
  on-primary-fixed-variant: '#802a00'
  secondary-fixed: '#ffdbd0'
  secondary-fixed-dim: '#ffb59d'
  on-secondary-fixed: '#390c00'
  on-secondary-fixed-variant: '#832600'
  tertiary-fixed: '#ffdbd1'
  tertiary-fixed-dim: '#ffb59f'
  on-tertiary-fixed: '#3a0a00'
  on-tertiary-fixed-variant: '#842503'
  background: '#111317'
  on-background: '#e2e2e8'
  surface-variant: '#333539'
typography:
  display-hero:
    fontFamily: Manrope
    fontSize: 3rem
    fontWeight: '700'
    lineHeight: 3.5rem
    letterSpacing: -0.03em
  display-hero-mobile:
    fontFamily: Manrope
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Manrope
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: 2.5rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Manrope
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Manrope
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Manrope
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.625rem
    letterSpacing: -0.01em
  title-md:
    fontFamily: Manrope
    fontSize: 1rem
    fontWeight: '500'
    lineHeight: 1.5rem
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.875rem
    letterSpacing: -0.011em
  body-md:
    fontFamily: Inter
    fontSize: 0.9375rem
    fontWeight: '400'
    lineHeight: 1.625rem
    letterSpacing: -0.008em
  body-sm:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.375rem
    letterSpacing: 0em
  label-md:
    fontFamily: Inter
    fontSize: 0.8125rem
    fontWeight: '500'
    lineHeight: 1rem
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 0.875rem
    letterSpacing: 0.04em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 0.8125rem
    fontWeight: '400'
    lineHeight: 1.375rem
    letterSpacing: -0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system delivers a focused, high-precision environment for cognitive analysis, document intelligence, and automated research synthesis. Designed for knowledge engineers, legal investigators, financial analysts, and AI researchers, the aesthetic projects rigorous clarity, architectural depth, and zero cognitive interference.

The design philosophy fuses **Precision Technical Minimalism** with **Atmospheric Volumetric Illumination**:
- **Layered Depth:** Near-black foundation tones with deliberate tonal steps separate structural navigational chrome from fluid analysis workspaces.
- **Controlled Kinetic Energy:** Radiant, burnt-orange chromatic focal points guide the user's attention toward active reasoning nodes, cited passages, and key actions without creating visual noise.
- **Authoritative Typography:** Systematic, clinical typography ensures uncompromised legibility across complex multi-column layouts, dense token-level telemetry, and full-length source previews.
- **Subtle Horizon Lighting:** Soft, low-frequency atmospheric radial glows sit behind key visual anchors (such as empty-state synthesis panels and research welcome consoles) to suggest an engine room humming with intelligence.

## Colors

The palette operates in strict dark-mode-first hierarchy, leveraging fine tonal gradations rather than hard contrasts to establish structure.

### Surface System
- **Void Canvas (`#08090B`):** Base system backdrop, reserved for viewport borders, outer margins, and deep background layers.
- **Sidebar Surface (`#0D0F12`):** Primary navigational anchor and structural utility rails.
- **Main Canvas Surface (`#121418`):** The primary cognitive arena, chat canvas, document viewport, and prompt input environment.
- **Elevated / Drawer Surface (`#191C21`):** Floating source verification panels, inspection cards, inspector drawers, and contextual flyouts.
- **Interactive Hover Surface (`#21252C`):** Micro-interaction response tier for surface tiles, list rows, and elevated pills.

### Boundaries & Ghost Strokes
- **Structural Border (`#292D34`):** Defines distinct panes, divider lines, and card containers.
- **Subtle Stroke (`rgba(255, 255, 255, 0.05)`): Applied to elevated edges to produce structural rim lighting.
- **Active Focus Border (`#FF6B2B`):** Indicates targeted references, active text inputs, and selected source anchors.

### Typography & Content
- **Text Primary (`#F5F5F5`):** Raw document transcripts, assistant generation output, and prominent header levels.
- **Text Secondary (`#A1A1AA`):** Metadata timestamps, source document labels, retrieval confidence metrics, and peripheral controls.
- **Text Muted (`#52525B`):** Inactive indicators, structural token markers, and disabled glyphs.

### Accent & Radiant System
- **Signal Orange (`#FF6B2B`):** Vector highlights, highlighted citation tokens (`[1]`, `[2]`), active tabs, and inline research tags.
- **Interactive Action (`#C2410C`):** Primary generation buttons, active query submissions, and critical conversion points.
- **Action Hover (`#9A3412`):** Pressed and hovered state for accent action targets.
- **Atmospheric Horizon Glow (`radial-gradient(50% 50% at 50% 0%, rgba(255, 107, 43, 0.08) 0%, rgba(194, 65, 12, 0.02) 60%, transparent 100%)`): Soft overhead luminescence behind new query consoles and welcome states.

## Typography

The typography pairs **Manrope** for authoritative, geometric framing with **Inter** for dense, fatigue-free analytical reading.

### Rules of Usage
- **Headers (Manrope):** Set titles with tight tracking (`-0.015em` to `-0.03em`) to deliver modern structural density. Headlines maintain strict medium-to-bold weights to cut through low-luminance dark backgrounds.
- **Narrative & Chat Stream (Inter):** Research responses and synthesized documents use `body-md` and `body-lg` paired with a tall 1.6x–1.7x line-height ratio to prevent scanning fatigue over dense academic or legal outputs.
- **Citations & Metadata:** Inline references and chunk indexes use uppercase or tabular figures formatted via `label-sm` and `code-md` to remain distinct from editorial narrative content.

## Layout & Spacing

The layout is built upon an uncompromising **8px base grid** (`space-sm` = 8px, `space-md` = 16px, `space-xl` = 32px), prioritizing clear boundaries and operational visibility.

### Layout Architectures
- **Tri-Pane Shell:** Desktop layouts employ a persistent fixed-width left navigation rail (`280px` on `#0D0F12`), a fluid dynamic synthesis canvas (`#121418`), and an expandable right verification drawer (`420px` to `540px` on `#191C21`).
- **Responsive Adaptations:**
  - **Desktop (>= 1280px):** 3 panes concurrently visible. Full inline citations open alongside the main transcript without obscuring the reading canvas.
  - **Tablet (768px - 1279px):** Left navigation collapses to an icon bar (`64px`); source drawer overlays content with a soft dimmed backdrop.
  - **Mobile (< 768px):** Single-pane linear stack. Source inspector converts to a bottom-anchored swipeable sheet with snap points at 45% and 90% viewport height.
- **Alignment Discipline:** Text columns inside synthesized documents enforce a max-width reading track of `720px` to optimize scannability, centered within the fluid canvas.

## Elevation & Depth

Visual hierarchy is maintained through precise tonal elevation and crisp structural boundaries rather than diffuse shadows.

### The Five Elevation Tiers
1. **Recessed / Void (`#08090B`):** System floor and canvas perimeter gutters.
2. **Structural Rail (`#0D0F12`):** Ground-level panels bounded by a `1px` border of `#292D34`.
3. **Workspace Canvas (`#121418`):** Focus zone. No ambient drop shadow; structural demarcation only.
4. **Elevated Panels & Drawers (`#191C21`):** Raised source drawers and contextual dialogs. Elevated using `box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.6), 0 0 0 1px #292D34`.
5. **Popovers, Tooltips & Citations (`#21252C`):** Highest local priority. Rimmed with `rgba(255, 255, 255, 0.08)` outline and supported by `0 8px 24px -2px rgba(0, 0, 0, 0.8)`.

### Ambient Horizon Glow
Welcome spaces, reasoning terminals, and active inference clusters feature an engineered top-centered radial aura:
- `background: radial-gradient(circle 600px at 50% -10%, rgba(255, 107, 43, 0.07) 0%, rgba(194, 65, 12, 0.02) 50%, transparent 80%);`
This anchors empty-state screens and central prompt bars without washing out contrast.

## Shapes

The design uses a **Soft (Level 1)** geometric language:
- **Micro Elements (Tokens, Citation Badges, Switches):** `4px` (`0.25rem`).
- **Standard Controls (Inputs, Buttons, Dropdowns):** `6px` (`0.375rem`).
- **Cards, Panels & Modal Containers:** `8px` (`0.5rem`).
- **Drawer Panels & Major Canvas Frames:** `12px` (`0.75rem`) on detached corners, `0px` on docked viewport edges.

This restrained radius reinforces an instrument-grade, high-performance workspace while eliminating the harshness of raw 90-degree corners.

## Components

### Buttons
- **Primary Action (Query Submit, Vector Index):** Solid background of `#C2410C`, text `#F5F5F5`, subtle top border highlight of `rgba(255, 255, 255, 0.15)`. On hover, transitions to `#9A3412` with an ambient glow (`box-shadow: 0 0 16px -2px rgba(255, 107, 43, 0.35)`). Active state scales to `0.98`.
- **Secondary (Export, Filter, View):** Background `#191C21`, border `1px solid #292D34`, text `#F5F5F5`. On hover, background shifts to `#21252C` with border `#FF6B2B` at 50% opacity.
- **Ghost / Minimal:** Transparent background, text `#A1A1AA`. Hover shifts to `#F5F5F5` with background `rgba(255, 255, 255, 0.04)`.

### Citations & Source Badges
- **Inline Citation Marker (`[1]`, `[Source]`):** Compact pill (`height: 18px`, `padding: 0 6px`, `border-radius: 4px`), background `rgba(255, 107, 43, 0.12)`, text `#FF6B2B`, font `JetBrains Mono` at `11px`. Hover triggers solid `#FF6B2B` text on `#21252C` with border `1px solid #FF6B2B`.
- **Source Verification Chip:** Displayed at the foot of answers. Shows document icon, file name, and retrieval relevance percentage (`98% match`). Background `#191C21`, border `1px solid #292D34`.

### Input Fields & Reasoning Console
- **Search & Query Box:** Multi-line responsive bar set on `#191C21` with border `1px solid #292D34`. Focused state introduces a glowing perimeter: `border-color: #FF6B2B; box-shadow: 0 0 0 1px #FF6B2B, 0 0 20px -4px rgba(255, 107, 43, 0.25)`.
- **Placeholder:** Styled in `#52525B` with clean monospace shortcuts (`⌘K` or `Enter to run`).

### Source Verification Drawer
- **Drawer Exterior:** Grounded in `#191C21` with a continuous `1px` left border of `#292D34`.
- **Document Chunk Highlight:** Original text passages extracted by the vector model appear in a card with a subtle left accent edge (`3px solid #FF6B2B`), background `#121418`, and text `#F5F5F5`.
- **Relevance Heatmap Strip:** Top edge of verified snippets displays an illuminated micro-indicator showing match weight (e.g., `#FF6B2B` for high, `#A1A1AA` for contextual).

### Cards & Result Blocks
- **Document Card:** Built on `#121418` with border `1px solid #292D34`. Hover increases border brightness to `#3F444E` and elevates the surface to `#191C21`.
- **Metadata Lists:** Key-value telemetry pairs with keys in `#A1A1AA` (`label-sm`) and numerical values in `#F5F5F5` (`code-md`). Dividers between items utilize `rgba(255, 255, 255, 0.04)`.

### Checkboxes, Radios & Toggles
- **Checkbox/Radio:** Base border `1px solid #292D34`, fill `#0D0F12`. Selected state fills with `#FF6B2B` with a crisp `#08090B` internal mark.
- **Switches:** Track is `#191C21` with a `1px solid #292D34` rim; active state animates track to `#C2410C` and knob to `#F5F5F5`.