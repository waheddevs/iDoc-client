---
name: Document Research Precision
colors:
  surface: '#fbf8fc'
  surface-dim: '#dcd9dd'
  surface-bright: '#fbf8fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f2f7'
  surface-container: '#f0edf1'
  surface-container-high: '#eae7eb'
  surface-container-highest: '#e4e1e6'
  on-surface: '#1b1b1e'
  on-surface-variant: '#59413a'
  inverse-surface: '#303033'
  inverse-on-surface: '#f3f0f4'
  outline: '#8d7168'
  outline-variant: '#e1bfb5'
  surface-tint: '#ac3400'
  primary: '#9b2f00'
  on-primary: '#ffffff'
  primary-container: '#c2410c'
  on-primary-container: '#ffece7'
  inverse-primary: '#ffb59d'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#6b502d'
  on-tertiary: '#ffffff'
  tertiary-container: '#866843'
  on-tertiary-container: '#ffeede'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd0'
  primary-fixed-dim: '#ffb59d'
  on-primary-fixed: '#390c00'
  on-primary-fixed-variant: '#832600'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#ffddb7'
  tertiary-fixed-dim: '#e6c095'
  on-tertiary-fixed: '#2a1800'
  on-tertiary-fixed-variant: '#5b4220'
  background: '#fbf8fc'
  on-background: '#1b1b1e'
  surface-variant: '#e4e1e6'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 30px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: 0em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.03em
  code-inline:
    fontFamily: JetBrains Mono
    fontSize: 12.5px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
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

This design system is tailored for technical document research, retrieval-augmented question answering, and intellectual synthesis. It prioritizes clarity, cognitive calm, and structural efficiency over decorative elements.

### Brand Personality & Philosophy
- **Rigorous & Scholarly:** Treats user source materials with integrity, providing transparent citations, explicit source provenance, and verifiable outputs.
- **Utilitarian Elegance:** Eliminates extraneous visual noise and artificial effects (no decorative sparkles, AI flares, or floating cards). Visual weight directly maps to semantic hierarchy.
- **Focused & Warm:** Avoids sterile laboratory blues in favor of grounded stone neutrals paired with an active terracotta-orange accent that signals warmth, precision, and human-in-the-loop validation.

### Design Language
- **Grounded Modernist:** Blends a clean reading canvas (#FAFAF9) with crisp white cards, hairline slate borders, and purposeful amber/terracotta highlights.
- **Identity & Wordmark:** Typography-only typographic mark: lowercase light-to-regular `i` followed immediately by semibold/bold `Doc` colored in deep warm orange (`#C2410C`). Free of iconography, mascots, or generic conversational AI symbols.

## Colors

The palette balances warm neutral backgrounds, high-contrast typography, and purposeful terracotta accents that elevate citations, active query states, and user actions.

### Canvas & Surface Structure
- **Canvas Base (`#FAFAF9`):** Soft warm stone, minimizing eye fatigue during long reading and research sessions.
- **Surface Elevation 0 (`#FFFFFF`):** Base container for document viewports, main query panels, and contextual cards.
- **Warm Highlight Surface (`#FFF7ED`):** Reserved for cited text chunks, active retrieval blocks, and synthetic answers currently being generated.

### Action & Accents
- **Primary Action (`#C2410C`):** Terracotta deep-rust used for high-intent actions, primary submit controls, and selected document pills.
- **Primary Action Hover (`#9A3412`):** Grounded deep burnt ember for deliberate interactive feedback.
- **Brand Accent & Focus Ring (`#F97316`):** Vibrant amber-orange for focus states, unread query tags, and highlight markers.
- **Subtle Accent Border (`#FED7AA`):** Used to isolate retrieval results, quote cards, and citation tags.

### Typography & Border Tokens
- **Text Primary (`#18181B`):** Near-black slate for maximum legibility on both canvas and card surfaces.
- **Text Secondary (`#52525B`):** Medium neutral for metadata, author lists, and source panel indices.
- **Text Muted (`#71717A`):** For timestamps, citation numbers, and character counts.
- **Border Default (`#E4E4E7`):** Hairline structure defining grid splits, sidebar dividers, and unselected inputs.

### Semantic Tints
- **Success / Indexed:** Surface `#ECFDF5`, Content `#059669` (Vectorized, Ready).
- **Warning / Partial:** Surface `#FFFBEB`, Content `#D97706` (Ingesting, OCR degraded).
- **Error / Unreachable:** Surface `#FEF2F2`, Content `#DC2626` (Failed parse, Token limit).
- **Citation Badge:** Surface `#FFEDD5`, Content `#C2410C`.

## Typography

The typography is built entirely on `Inter` to enforce maximum readability across varying optical densities (scanned OCR text, synthesized answer summaries, side-by-side split screens). `JetBrains Mono` is reserved exclusively for tabular data columns, token counters, chunk hashes, and code extracts.

### Hierarchy & Usage
- **Display & Section Titles (`headline-xl`, `headline-lg`):** High-density tracking (`-0.02em`) gives headlines a crisp, modern editorial tone without sacrificing structure.
- **Synthesized RAG Responses (`body-lg`):** Relaxed line height (`26px` on `16px` type) ensures continuous reading without vertical visual crowding.
- **Metadata & Inspector Lists (`body-sm`, `label-sm`):** Slightly elevated letter spacing for `label-sm` enhances rapid scanning in document file trees and chunk attribution cards.

## Layout & Spacing

A strict 8px layout rhythm governs every vertical and horizontal spacer. Layouts support complex analytical tasks through a dynamic two-or-three-pane system: document browser, primary reading/QA viewport, and context/citation inspector.

### Grid Architecture
- **Desktop (1280px+):** Three-column functional split:
  - Left: 280px fixed-width document navigator.
  - Center: Fluid research and interactive QA canvas (minimum 640px, maximum 840px for ideal reading measure).
  - Right: 360px collapsible context, citation preview, and chunk metadata panel.
- **Tablet (768px - 1279px):** Two-column layout with the context panel converted into an off-canvas drawer or tabbed subview.
- **Mobile (<768px):** Single stacked view with a persistent bottom input bar and slide-up modal sheets for source inspection.

## Elevation & Depth

To avoid visual distractions common in generic web applications, depth is created primarily through tonal planar changes, crisp hairline dividers, and micro-diffused ambient shadows.

### Elevation Levels
- **Level 0 (Flat Surface):** Default `#FFFFFF` panels on `#FAFAF9` canvas, differentiated purely by a 1px solid border (`#E4E4E7`).
- **Level 1 (Interactive & Selected Cards):** Document items and active question cards use `box-shadow: 0 1px 3px 0 rgba(24, 24, 27, 0.05), 0 1px 2px -1px rgba(24, 24, 27, 0.05)`.
- **Level 2 (Popovers, Citations & Dropdowns):** Floating citation tooltips and filter menus use `box-shadow: 0 4px 12px -2px rgba(24, 24, 27, 0.08), 0 2px 6px -2px rgba(24, 24, 27, 0.04)`.
- **Focus & Selection Elevation:** Replaces shadows with a 2px offset border in `#FED7AA` combined with an inner border of `#C2410C`.

## Shapes

The geometric personality conforms to restrained 10px–14px radii (`roundedness: 2`), reflecting precision software rather than playful consumer interfaces.

### Curvature Guidelines
- **Micro Elements (Chips, Checkboxes, Citations):** `rounded` (8px). Maintains optical sharpness at small sizes.
- **Standard UI Elements (Buttons, Inputs, Cards):** `rounded-lg` (12px / 0.75rem to 1rem). Smooth, approachable corners that fit dense data panels.
- **Panels & Dialog Overlays:** `rounded-xl` (16px / 1rem to 1.5rem) used on full document viewer sheets and modal contexts.

## Components

### Buttons
- **Primary:** Background `#C2410C`, text `#FFFFFF`, font weight `500`, border radius 12px. Hover: `#9A3412`. Active: `#7C2D12`. No glow effects.
- **Secondary / Ghost:** Background transparent, border 1px solid `#E4E4E7`, text `#18181B`. Hover: `#FAFAF9` with border `#D4D4D8`.
- **Accent Context Button:** Background `#FFF7ED`, border 1px solid `#FED7AA`, text `#C2410C`. Used for actions like "Jump to Page X" or "Re-vectorize".

### Input Fields & Search Bars
- **Height & Padding:** 44px height for main inputs, 12px vertical padding on textareas.
- **Borders & State:** 1px solid `#E4E4E7`, background `#FFFFFF`. On focus: border 1px solid `#F97316` with a `0 0 0 3px rgba(249, 115, 22, 0.15)` focus ring.
- **Prompt Entry Area:** Rounded 14px container equipped with an integrated inline submit button, attachment chip preview, and model state toggle.

### Citations & Badges
- **In-Text Citation Marker:** Superscript or inline bracket badge: `#FFEDD5` background, `#C2410C` text, font weight `600`, 6px border radius, padding `2px 6px`. Hover raises card preview at Level 2 elevation.
- **Status Indicator Badges:** 
  - Ready: `#ECFDF5` background, `#059669` label, leading 6px circular dot.
  - Indexing: `#FFFBEB` background, `#D97706` label.
  - Error: `#FEF2F2` background, `#DC2626` label.

### Document Chunks & Source Cards
- **Retrieved Chunk Box:** Surface `#FFF7ED`, 1px solid border `#FED7AA`, radius 10px, padding 12px. Header holds page metadata in `label-sm` (`#71717A`), followed by verbatim quoted content in `body-sm` (`#18181B`).
- **Standard Document Card:** Background `#FFFFFF`, 1px solid `#E4E4E7`, radius 12px. On hover: border transitions to `#FED7AA` with a subtle 1px border highlight.

### Selection Controls (Checkboxes & Radios)
- **Checkboxes:** 18px square, border 1.5px solid `#D4D4D8`, radius 4px. Checked state: `#C2410C` background with white check icon. Focus ring matches brand accent.