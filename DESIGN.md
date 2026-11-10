---
name: "御神籤 — 오늘의 오미쿠지"
description: "A single warm paper fortune on a muted green ground."
colors:
  ground: "oklch(27% .014 132)"
  ground-light: "oklch(32% .014 132)"
  paper: "oklch(94% .025 85)"
  paper-fold: "oklch(90% .028 85)"
  ink: "oklch(28% .018 70)"
  muted: "oklch(47% .025 70)"
  light: "oklch(87% .025 85)"
  dim: "oklch(73% .025 85)"
  accent: "oklch(48% .15 29)"
  accent-hover: "oklch(42% .15 29)"
  rule: "oklch(76% .045 80)"
  rule-soft: "oklch(84% .033 80)"
  focus: "oklch(70% .13 65)"
  shadow: "oklch(10% .014 132 / .3)"
typography:
  display:
    fontFamily: "'Yu Mincho', 'Hiragino Mincho ProN', 'AppleMyungjo', 'Batang', 'Noto Serif CJK KR', serif"
    fontSize: "104px"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: ".04em"
  headline:
    fontFamily: "'Yu Mincho', 'Hiragino Mincho ProN', 'AppleMyungjo', 'Batang', 'Noto Serif CJK KR', serif"
    fontSize: "34px"
    letterSpacing: ".18em"
  title:
    fontFamily: "'Yu Mincho', 'Hiragino Mincho ProN', 'AppleMyungjo', 'Batang', 'Noto Serif CJK KR', serif"
    fontSize: "23px"
    fontWeight: 500
    letterSpacing: ".1em"
  body:
    fontFamily: "'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans CJK KR', sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "'Malgun Gothic', 'Apple SD Gothic Neo', 'Noto Sans CJK KR', sans-serif"
    fontSize: "12px"
    fontWeight: 400
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
  3xl: "64px"
components:
  folded-paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "44px 24px 26px"
    width: "min(100%, 232px)"
  paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "12px"
  retry-button:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    padding: "12px 28px"
  retry-button-hover:
    backgroundColor: "{colors.paper-fold}"
---
# Design System: 御神籤 — 오늘의 오미쿠지

## Overview

**Creative North Star: "A single folded paper"**

Warm paper, ink, vermilion seals and fine gold rules carry the user-pinned ritual of opening one folded sheet. Large Mincho kanji establish the hierarchy; horizontal Korean copy keeps the reading approachable.

This document records the shipped static implementation. CSS remains the implementation source; the frontmatter records its normative palette, typography and spacing.

**Key Characteristics:**

- One central paper sheet
- Dark muted green surround
- Mincho kanji paired with horizontal Korean sans
- Restrained vermilion seals and fine rules

## Colors

The canonical palette uses OKLCH values from `tokens.css`; preserve that color space.

- **Primary:** vermilion `accent` highlights the fortune grade, seals and paper disclosure hover. `focus` supplies the distinct keyboard outline.
- **Neutral:** muted green `ground` and `ground-light` frame the sheet and error state. Warm `paper` and `paper-fold` distinguish the open sheet and folds. `ink` and `muted` support reading on paper; `light` and `dim` support reading on green. Gold `rule` and `rule-soft` separate content. `shadow` grounds the paper.

`accent-hover` is declared but currently unused; do not infer a new state from it.

## Typography

Display and Japanese ornament use the local Mincho stack; body and controls use the local Korean sans stack recorded above. No remote font is required.

The fortune grade is the largest mark (104px, 92px on mobile). The page heading is 26px Mincho, the paper title 34px, the fortune title 23px, and topic kanji 21px. Main guidance is 15px at 1.9 line-height; topic reading is 14px at 1.85. The centered poem uses 17px Mincho at 2 line-height and a 30ch maximum width. Labels are typically 11–13px. Vertical writing is confined to the folded sheet's Japanese title and seal.

## Layout

The header is centered within 1184px with 28px × 40px padding. The main column is capped at 560px with 24px horizontal padding. A folded slip is at most 232px wide and at least 408px tall, with a second sheet tilted 1.6 degrees beneath it; the open sheet occupies the main column. Its 12px outer padding frames a double inset rule and 28px 32px 32px inner padding.

At widths up to 540px, the header uses 22px 24px padding and hides its note. Main horizontal padding becomes 16px; paper outer padding becomes 8px and inner padding becomes 22px 20px 26px. Topic rows change from a 76px label column and 16px gap to a 64px column and 12px gap. The body minimum width is 280px.

Four topic rows remain visible; a native disclosure reveals four more. The declared spacing scale is 4–64px; existing composition also uses measured intermediate values.

## Elevation & Depth

Depth comes from two shaded crease lines on the folded slip, a local paper texture on both sheets, double inset rules, and a tight contact shadow paired with a wide soft one. The ground has one soft glow at the top. Other regions rely on color and rules.

## Shapes

Paper and controls retain square silhouettes without an authored radius scale. Thin rules outline the paper and divide topics; vermilion seals are solid stamps with paper-colored characters, worn by the inline `#ink` SVG filter. The fold seal rotates −3 degrees and the result seal 6 degrees. A simple plus becomes a minus when additional topics open.

## Components

- **Folded paper:** the whole sheet is one accessible button. Its double inset rule and two creases establish the physical object. Pointer hover lifts it 5px with a slight tilt over 280ms.
- **Result paper:** one textured article with an inset border, centered grade, poem, guidance and definition-list topic rows. Reveal animates perspective rotation and vertical scale over 700ms. OS reduced motion and the local checkbox both disable animations and transitions.
- **Topic disclosure:** a native `details`/`summary` with a 60px minimum summary height, changing Korean label and plus/minus indicator; paper hover uses vermilion.
- **Retry button:** paper-colored rectangular control on the lighter green error panel; hover uses the fold color. Global disabled buttons use .6 opacity and a wait cursor.
- **Motion checkbox:** native 16px checkbox using the accent color within a 44px minimum label target.
- **Brand navigation:** a local home link with a fine outlined Mincho seal and tracked wordmark. Footer disclosure remains secondary, with a 44px minimum summary height.

All interactive elements retain the global 3px focus outline with 6px offset. Buttons have a 2px active translation; the folded-paper hover transform takes precedence on hover-capable devices.

## Do's and Don'ts

- Do preserve the single-sheet reveal and four visible plus four expandable topics.
- Do use the existing local font stacks and horizontal Korean reading.
- Do preserve visible keyboard focus and both reduced-motion mechanisms.
- Don't replace the pinned paper, ink and vermilion direction.
- Don't turn the eight topic readings into a competing card grid.
- Don't force vertical Korean text or add remote fonts.
