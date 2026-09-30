---
version: "alpha"
name: "Steampunk Vitoriano"
description: "Victorian steampunk landing page. Ideal for landing pages, saas. AI-ready template."
colors:
  primary: "#B5A642"
  secondary: "#5C0000"
  tertiary: "#704214"
  neutral: "#F5DEB3"
  surface: "#B87333"
  accent: "#008080"
typography:
  h1:
    fontFamily: IM Fell English
    fontSize: 2.5rem
    fontWeight: 700
  body-md:
    fontFamily: IM Fell English
    fontSize: 1rem
    fontWeight: 400
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    padding: 12px
---

## Overview

Victorian steampunk landing page. Ideal for landing pages, saas. AI-ready template. Victorian Steampunk isn't just cogs glued onto top hats. It's a specific design lineage rooted in the speculative machinery of Jules Verne and H.G. Wells — writers who imagined futures built from brass, steam, and obsessive ornamentation. Their worlds weren't minimalist. They were layered, riveted, overwrought in the best possible way. Every surface carried information.

The Victorian era itself was drunk on mechanical complexity. Exposed clockwork, filigree ventilation grilles, engraved nameplates on industrial equipment — these weren't decorative afterthoughts, they were the interface. The machine communicated its function through its form. That's the translation opportunity for UI: borders that feel forged rather than drawn, typography with the weight of letterpress, navigation that suggests physical mechanisms rather than flat abstractions.

What separates Victorian Steampunk from generic steampunk is restraint within excess. Real Victorian engineering had rules — symmetry, proportion, hierarchical ornamentation that guided the eye. The best steampunk interfaces honor that structure instead of just piling on texture. Gears should turn with purpose. Brass should patina where hands would touch.

- Density: 5/10 — Balanced
- Variance: 8/10 — Expressive
- Motion: 6/10 — Expressive

- **Style:** Ornate, Mechanical, Adventurous
- **Keywords:** steampunk, victorian, ornate, mechanical, adventurous, brass, gears, leather, intricate, imaginative
- **Era:** 19th Century, Industrial Revolution Fantasy
- **Light/Dark:** light theme (parchment canvas)

## Colors

- **Brass** (#B5A642) — Primary: CTAs, key accents, borders that feel forged
- **Rich Mahogany** (#5C0000) — Secondary: deep surfaces, headers
- **Sepia** (#704214) — Supporting palette color
- **Parchment** (#F5DEB3) — Primary canvas / background
- **Copper** (#B87333) — Metallic accent, decorative detail
- **Deep Teal** (#008080) — Secondary accent
- **Clockwork Orange** (#D46A00) — Warm accent, secondary CTAs, urgent deadlines
- **Ivory** (#FFFFF0) — Secondary surface (cards)

## Typography

- **Display / Hero:** IM Fell English (Google Fonts) — Weight 700, tight tracking
- **Body:** IM Fell English — Weight 400, 16px/1.6, max 72ch per line
- **UI Labels / Captions:** IM Fell English — 0.875rem, weight 500, slight letter-spacing
- **Monospace:** JetBrains Mono — countdowns, dates, metadata, technical values

Scale:
- Hero: clamp(2.5rem, 5vw, 4rem)
- H1: 2.25rem
- H2: 1.5rem
- Body: 1rem / 1.6
- Small: 0.875rem

## Layout

- **Grid:** CSS Grid primary. Max-width 1280px centered, 1.5rem side padding.
- **Base unit:** 0.5rem (8px).
- **Section vertical gaps:** clamp(4rem, 8vw, 8rem).
- **Hero:** asymmetric composition.
- **Feature sections:** asymmetric grid, varied card sizes — NO 3-equal-columns.
- **Mobile:** all multi-column collapses below 768px. No horizontal overflow.

## Elevation & Depth

- Brass borders, subtle gear/schematic decorative details, gas-lamp glow accents.
- Entry: fade + translate-Y (16px → 0), 480ms ease-out, 100ms stagger on lists.
- Hover: scale(1.03) + shadow lift, 200ms.
- Animate only transform and opacity.

## Shapes

- Base corner radius: 8px (subtly rounded, forged — not pill-soft).

## Components

- **Primary Button:** brass fill, parchment text, 0.5rem radius, weight 600. Hover: 8% darken + lift. Active: -1px press.
- **Secondary / Ghost Button:** 1.5px muted outline, brass text. Hover: subtle fill.
- **Cards:** ivory surface, 0.5rem radius, 1px border stroke, subtle shadow. Brass border on featured.
- **Inputs:** label above, 1px border, 2px accent focus ring. No floating labels.
- **Navigation:** parchment/mahogany, active item gets brass indicator.
- **Empty States:** icon + descriptive text + action button. Honest copy.
- **Countdowns:** JetBrains Mono, clockwork-orange when urgent (<30 days), brass otherwise, muted when passed.

## Do's and Don'ts

- No emojis in UI — Lucide icons only (replaces the old ⚔️ emoji header).
- No pure black — off-black/charcoal only.
- No 3-column equal-width layouts — asymmetric/zig-zag grids.
- No `h-screen` — use `min-h-[100dvh]`.
- No AI clichés ("Elevate", "Seamless", "Unleash", "Next-Gen").
- No lorem ipsum, no broken image links (inline SVG or picsum.photos).

## GrantQuest mapping notes (qwerty-added)

- Quest = expedition/voyage. Board = the map room / notice board.
- Copy voice: Victorian adventure — "Begin expedition", "Chart this quest",
  "Expedition complete" on success. Keep it readable, not costume-y.
- Deadline badge = chronometer: brass normally, clockwork-orange <30 days.
- Featured quests: brass border + "Featured" engraved plate.
- Gates checklist = expedition checklist; documents = inventory manifest.
- Data honesty stands: no invented gates/documents/deadlines — honest empty states.
