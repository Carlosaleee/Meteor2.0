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
    bg: "#F8F6F0"
    graphite: "#FFFFFF"
    surface: "#EDEBE6"
    line: "#D6D0C8"
    ink: "#141414"
    muted: "#6B6560"
    orange: "#FF6A1A"
    gold: "#C49A1A"
    hazard: "#FF3B1A"
    ok: "#8A6D2B"
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

## Typography
Archivo Black for structural labels (uppercase). JetBrains Mono for metrics, units, IDs, timestamps.

## Layout
Dense cockpit grid. Visible 1px rules. No cards-with-shadow. No glassmorphism.

## Elevation & Depth
Flat planes, hairline borders. No drop shadows. Glow only as 1px gold/orange edge on live metrics.

## Shapes
Border-radius 0px default, 2px maximum.

## Components
HUD frame, metric tiles, day/city selectors, wave sparkline, Surf Score numeral.

## Theme Toggle

Light `bg #F8F6F0` + Dark `bg #0A0A0A` via `data-theme` on `html`. Toggle `ThemeToggle.tsx` in `atoms/` with `localStorage` + `prefers-color-scheme`, `next-themes` compatible. `globals.css` `@theme` dark default, `[data-theme="light"]` override. `viewport` `colorScheme: "light dark"`. No purple, no blue trap in either theme.

## Do's and Don'ts
- Do: sharp corners, mono telemetry, orange/gold accents, `CapaMeteor.jpg` hero in portal.
- Don't: purple, sky-blue SaaS palettes, 8px+ radius, Inter-on-slate.
