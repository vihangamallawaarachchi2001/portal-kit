---
name: PortalKit Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#0051d5'
  on-secondary: '#ffffff'
  secondary-container: '#316bf3'
  on-secondary-container: '#fefcff'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#002109'
  on-tertiary-container: '#009842'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#dbe1ff'
  secondary-fixed-dim: '#b4c5ff'
  on-secondary-fixed: '#00174b'
  on-secondary-fixed-variant: '#003ea8'
  tertiary-fixed: '#7ffc97'
  tertiary-fixed-dim: '#62df7d'
  on-tertiary-fixed: '#002109'
  on-tertiary-fixed-variant: '#005320'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  h1:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  h1-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  h2:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  h3:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The design system is engineered for a high-utility client portal SaaS, prioritizing clarity, efficiency, and a sense of established trust. The brand personality is **Professional, Systematic, and Precise**, drawing inspiration from modern productivity tools like Linear and Notion. 

The visual style is **Corporate Modern with a Minimalist execution**. It focuses on a rigorous grid, high-quality typography, and purposeful whitespace to ensure freelance professionals and their clients can navigate complex project data without cognitive overload. The interface stays out of the way of the content, acting as a sophisticated frame for the work being showcased.

## Colors
The palette is rooted in deep slates and crisp whites to establish a "pro-tool" aesthetic. 

- **Primary & Neutral:** Used for structural elements, text, and heavy-duty UI components to provide a grounded, authoritative feel.
- **Accent:** A vibrant blue used sparingly for primary actions, progress indicators, and active states to guide user attention.
- **Surface Hierarchy:** Three distinct surface levels are used to create depth without relying on heavy shadows. `Surface` is for the main canvas, `Surface-2` for sidebars and secondary navigation, and `Surface-3` for subtle wells or inset UI elements.
- **Semantic Colors:** Success, Warning, and Destructive colors are utilized for status communication, maintaining high legibility against the light background.

## Typography
This design system utilizes **Inter** exclusively to take advantage of its neutral, highly legible glyphs and extensive variable weights. 

The typographic scale is designed for information density. Large displays and H1s use tighter letter-spacing and heavy weights to command attention, while body text levels are optimized for long-form reading in project briefs. The `Label` style is intended for small metadata, often paired with an uppercase transformation to distinguish it from body content.

## Layout & Spacing
The system follows a strict **4px base unit** to ensure mathematical harmony across all components.

- **Layout Model:** A 12-column fluid grid for desktop with 24px gutters. For the dashboard view, a fixed-width left sidebar (240px) is recommended, with the remaining content area behaving as a fluid container.
- **Breakpoints:** 
    - **Mobile (<640px):** 4 columns, 16px margins.
    - **Tablet (640px - 1024px):** 8 columns, 24px margins.
    - **Desktop (>1024px):** 12 columns, 32px margins.
- **Spacing Philosophy:** Use larger increments (`xl`, `2xl`) for section vertical spacing to maintain the "Linear" feel of openness, while using `xs` and `sm` for internal component padding to maintain density.

## Elevation & Depth
Depth is primarily communicated through **Tonal Layering** supplemented by **Ambient Shadows**. Instead of heavy drop shadows, this design system uses color shifts between `Surface` tokens to denote hierarchy.

- **Level 0 (Base):** `Surface-2` is used for the application background.
- **Level 1 (Card/Sheet):** `Surface` (White) is used for cards and main content containers, utilizing a `sm` shadow to lift it slightly from the base.
- **Level 2 (Popovers/Modals):** Elements that float above the UI use the `md` or `lg` shadow styles. These shadows are extra-diffused with low opacity (between 4% and 12%) and a slight Slate-tinted hue to avoid a "dirty" look.
- **Outlines:** All containers and interactive elements should feature a 1px solid border using the `Border` token to maintain definition on high-resolution displays.

## Shapes
The shape language is **Rounded**, reflecting a modern and approachable tool while maintaining professional rigor. 

- **Standard Elements:** Buttons, inputs, and small components use `md` (8px).
- **Containers:** Cards, modals, and main content wrappers use `lg` (12px) or `xl` (16px) depending on their size and prominence.
- **Small Details:** Checkboxes and tags use `sm` (4px).
- **Interactive Pills:** Search bars and specific status chips may use `full` to distinguish them from structural blocks.

## Components
Consistent application of components ensures the portal feels like a unified platform.

- **Buttons:** Primary buttons use `Primary` color with `Primary-foreground` text. Secondary buttons use `Surface` with a `Border` stroke and `Primary` text. Ghost buttons use no background until hover.
- **Input Fields:** 1px `Border` with `Surface` background. On focus, the border shifts to `Accent` with a subtle `Accent-light` outer glow.
- **Chips/Badges:** Small, `sm` rounded shapes. Use `Surface-3` for neutral metadata and light semantic tints (e.g., `Accent-light` with `Accent` text) for status.
- **Cards:** White background, `lg` radius, 1px `Border`, and `sm` shadow. Headers within cards should be separated by a subtle 1px divider.
- **Lists:** Use `Surface` for items with a 1px border-bottom. Active list items should use a vertical 2px `Accent` bar on the far left or a subtle `Surface-2` background.
- **Checkboxes & Radios:** Use `Accent` for the checked state. Checkboxes have a 4px radius; Radios are circular.
- **File Uploaders:** Large dashed-border containers using `Surface-2` with a centered icon and `Body-sm` instruction text.