---
name: Meteor HUD
description: Tactical surf telemetry dashboard for Ilha Comprida and Vale do Ribeira
themes:
  dark:
    bg: "#0A0A0A"
    graphite: "#141414"
    surface: "#1C1C1C"
    line: "#2A2A2A"
    ink: "#E8E4DC"
    muted: "#8A8478"
    orange: "#FF6A1A"
    gold: "#E0B429"
    hazard: "#FF3B1A"
    ok: "#C4A35A"
  light:
    bg: "#F1F5F9"
    graphite: "#FFFFFF"
    surface: "#E2E8F0"
    line: "#CBD5E1"
    ink: "#0F172A"
    muted: "#64748B"
    orange: "#C2410C"
    gold: "#C49A1A"
    hazard: "#DC2626"
    ok: "#8A6D2B"
    card: "#FFFFFF"
    card-2: "#F8FAFC"
    card-border: "#E2E8F0"
    card-text: "#0F172A"
    card-muted: "#475569"
    card-subtle: "#334155"
    card-dim: "#64748B"
    card-faint: "#6B7280"
    ring-offset: "#F1F5F9"
    amber-on: "#0F172A"
colors:
  bg: "#0A0A0A"
  graphite: "#141414"
  surface: "#1C1C1C"
  line: "#2A2A2A"
  ink: "#E8E4DC"
  muted: "#8A8478"
  orange: "#FF6A1A"
  gold: "#E0B429"
  hazard: "#FF3B1A"
  ok: "#C4A35A"
typography:
  display:
    fontFamily: Archivo Black
    fontSize: 42px
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: -0.04em
  mono:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0.08em
rounded:
  none: 0px
  hair: 2px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
components:
  hud-frame:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.none}"
    padding: 12px
  surf-score:
    backgroundColor: "{colors.graphite}"
    color: "{colors.gold}"
    rounded: "{rounded.hair}"
---

# Meteor HUD

## Overview
Instrument panel for weather, sea and swell. Dark graphite substrate, orange for wind/alerts, gold for Surf Score and swell. Built for sunlit beach reading and night ops.

## Colors
Graphite/black field. Accent orange `#FF6A1A` and gold `#E0B429` only. Purple/violet is forbidden. Do not use generic blue ramps for charts or links.
Light theme text accents (-300/-400 shades) darken to their -700 equivalents so contrast stays >= 4.5:1 on white cards.

## Typography
Archivo Black for structural labels (uppercase). JetBrains Mono for metrics, units, IDs, timestamps.

## Layout
Dense cockpit grid. Visible 1px rules. No cards-with-shadow. No glassmorphism.
Cards and grids use relative widths (`w-full`, `max-w-full`) with `sm:` / `md:` / `lg:` breakpoints; nothing may overflow the viewport horizontally at 360px.

## Elevation & Depth
Flat planes, hairline borders. No drop shadows. Glow only as 1px gold/orange edge on live metrics.
Light theme exception: white cards over slate-100 get a 1px/3px near-black 4-6% shadow for depth.

## Shapes
Border-radius 0px default, 2px maximum.

## Components
HUD frame, metric tiles, day/city selectors, wave sparkline, Surf Score numeral.

## Internationalization
Dictionaries are flat `pt` / `es` maps with identical key sets (`src/i18n/dictionaries/<route>.ts`). Every visible string and every `aria-label` / `title` resolves through a dictionary key — no hardcoded Portuguese in components. Dates format with a locale derived from the active language (`pt-BR` / `es-ES`).

## Theme Toggle

Light `bg #F1F5F9` + Dark `bg #0A0A0A` via `data-theme` on `html`. Toggle `ThemeToggle.tsx` in `atoms/` with `localStorage` + `prefers-color-scheme`, `next-themes` compatible. `globals.css` `@theme` dark default, `[data-theme="light"]` override. `viewport` `colorScheme: "light dark"`. No purple, no blue trap in either theme.
Light theme reads `data-theme="light"` (attribute present) — dark is its absence. `useThemeMode()` observes that attribute so charts can re-render with the active palette.

## Semantic Tokens

Never hardcode slate utilities on cards or page surfaces — use the semantic tokens so both themes stay in sync:

| Purpose | Token | Utility |
| --- | --- | --- |
| Card surface | `--color-card` | `bg-card` |
| Raised surface | `--color-card-2` | `bg-card-2` |
| Card border | `--color-card-border` | `border-card-border` |
| Inner rule | `--color-card-line` | `border-card-line` |
| Primary text | `--color-card-text` | `text-card-text` |
| Secondary text | `--color-card-subtle` | `text-card-subtle` |
| Muted text | `--color-card-muted` | `text-card-muted` |
| Faint text | `--color-card-dim` / `--color-card-faint` | `text-card-dim` / `text-card-faint` |
| Focus ring offset | `--color-ring-offset` | `ring-offset-[var(--color-ring-offset)]` |
| Text over amber | `--color-amber-on` | `text-[var(--color-amber-on)]` |
| Amber button surface | `--color-amber-btn` / `--color-amber-btn-hover` | `bg-[var(--color-amber-btn)]` |

Exceptions (stay dark by design): `HeroCarousel`, `PageBanner`, image overlays (`from-slate-950/*`), colored badges (`bg-*-700 text-white`), Leaflet inline popup HTML.
Elements with a dark gradient panel (daily tip, AI briefing, satellite viewer) carry the `panel-tinted` class: in the light theme the gradient is dropped and the panel becomes a white card, so `card-*` text tokens stay readable.

## Do's and Don'ts
- Do: sharp corners, mono telemetry, orange/gold accents, `CapaMeteor.jpg` hero in portal.
- Don't: purple, sky-blue SaaS palettes, 8px+ radius, Inter-on-slate.
- Don't: `text-white` on card or page surfaces — use `text-card-text` so the light theme stays readable.
- Don't: hardcode `bg-slate-*` / `text-slate-*` on cards — use the semantic tokens above.
- Do: route every visible string and every `aria-label` / `title` through the route dictionary (`pt` + `es` with identical keys).

