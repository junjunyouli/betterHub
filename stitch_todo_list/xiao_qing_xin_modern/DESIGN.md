---
name: Xiao Qing Xin Modern
colors:
  surface: '#f8fafb'
  surface-dim: '#d8dadb'
  surface-bright: '#f8fafb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f5'
  surface-container: '#eceeef'
  surface-container-high: '#e6e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#3d4943'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#eff1f2'
  outline: '#6d7a72'
  outline-variant: '#bccac1'
  surface-tint: '#006c4d'
  primary: '#006c4d'
  on-primary: '#ffffff'
  primary-container: '#3eb489'
  on-primary-container: '#00402d'
  inverse-primary: '#69dbad'
  secondary: '#0d6683'
  on-secondary: '#ffffff'
  secondary-container: '#98deff'
  on-secondary-container: '#056380'
  tertiary: '#50625e'
  on-tertiary: '#ffffff'
  tertiary-container: '#92a5a1'
  on-tertiary-container: '#2a3b38'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#86f8c8'
  primary-fixed-dim: '#69dbad'
  on-primary-fixed: '#002115'
  on-primary-fixed-variant: '#005139'
  secondary-fixed: '#bee9ff'
  secondary-fixed-dim: '#8ad0f1'
  on-secondary-fixed: '#001f2a'
  on-secondary-fixed-variant: '#004d65'
  tertiary-fixed: '#d3e7e2'
  tertiary-fixed-dim: '#b7cbc6'
  on-tertiary-fixed: '#0d1f1c'
  on-tertiary-fixed-variant: '#394a47'
  background: '#f8fafb'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '500'
    lineHeight: 14px
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
  gutter: 16px
  margin-mobile: 20px
---

## Brand & Style

The design system is built on the "Xiao Qing Xin" (small and fresh) aesthetic, prioritizing clarity, breathability, and emotional calm. It targets a youthful, mindful audience that values organized simplicity and a connection to soft, nature-inspired tones.

The visual style is a blend of **Minimalism** and **Soft-Modernism**. It utilizes a "high-air" layout philosophy, where whitespace is treated as a functional element to reduce cognitive load. The emotional response should be one of "lightness"—as if the interface is weightless and refreshing to use. Avoid any heavy borders or aggressive transitions; instead, focus on soft entrances and subtle depth.

## Colors

This color palette is inspired by natural gradients of spring and sky. 
- **Mint Green (Primary):** Used for primary actions and brand emphasis. It should be vibrant enough to be legible but soft enough to remain calming.
- **Pale Sky Blue (Secondary):** Used for supportive elements, informational accents, and secondary status indicators.
- **Light Gray & Mint Tint (Neutrals):** The background should rarely be pure white; instead, use the light gray or the tertiary mint tint to create a "paper-like" softness.

Avoid high-contrast blacks. Use deep grays for text to maintain the gentle visual rhythm.

## Typography

The design system uses **Plus Jakarta Sans** for its approachable, modern, and slightly rounded letterforms, which perfectly complement the "fresh" aesthetic. 

- **Headlines:** Use semi-bold or bold weights with slight negative letter-spacing to create a clean, grounded anchor for content sections.
- **Body Text:** Keep line heights generous (1.5x minimum) to ensure a breezy, readable feel.
- **Labels:** Use uppercase sparingly and only for small metadata to maintain the soft tone.

For mobile layouts, avoid overly large display type; cap the primary screen headers at 22px-24px to ensure the layout feels balanced on small devices.

## Layout & Spacing

This design system follows a **8px soft grid** system. Because the aesthetic is "fresh and clean," spacing should err on the side of being generous. 

- **Margins:** On mobile, use a 20px side margin to give content breathing room from the edge of the glass.
- **Vertical Spacing:** Group related elements with 8px or 12px, but separate distinct sections with at least 32px to create a clear visual hierarchy through "islands" of content.
- **Fluidity:** Elements like cards and buttons should use fluid widths with fixed margins, ensuring they adapt gracefully to various mobile screen widths.

## Elevation & Depth

Depth is conveyed through **Tonal Layers** and **Ambient Shadows** rather than harsh structural lines. 

- **Surface Levels:** The base background is the neutral gray. Interactive cards sit on a "level 1" elevation using white backgrounds and a very soft, diffused shadow (Blur: 16px, Opacity: 4%, Color: Primary-Tint).
- **Glassmorphism:** Use subtle backdrop blurs (10px-15px) for top navigation bars or floating action buttons to maintain a sense of translucency and light.
- **Outlines:** Use thin (1px), low-opacity mint or gray borders only when necessary for accessibility on forms, otherwise let the color change or shadow define the boundary.

## Shapes

The shape language is consistently **Rounded**. 
- Standard components like cards and input fields use a **0.5rem (8px)** corner radius.
- Larger containers or prominent call-to-action sections use **1rem (16px)** to emphasize softness.
- Iconic elements, such as buttons or category chips, should often utilize a full pill-shape (circular ends) to maximize the friendly, approachable aesthetic.

## Components

- **Buttons:** Primary buttons use a solid Mint Green background with white text and a pill-shaped radius. Secondary buttons should be Sky Blue tints with primary color text.
- **Chips:** Used for filtering or tags. These should be pill-shaped with a light tertiary background and primary-colored text.
- **Cards:** Cards should have no border, a subtle ambient shadow, and a white background. Padding inside cards should be generous (16px-20px).
- **Input Fields:** Use a light-gray filled style with a subtle mint-colored bottom border or focus ring. Placeholder text should be a light, muted gray.
- **Icons:** Use simple, thin-line (2px stroke) icons with rounded caps. Avoid filled icons unless indicating an "active" state in a bottom nav bar.
- **Lists:** Use "In-set" lists where items are separated by whitespace rather than dividers. If dividers are necessary, they should be 1px thick and use the lightest gray available.
- **Progress Indicators:** Use soft, rounded bars. Avoid sharp corners on loading states to maintain the "soft" brand personality.