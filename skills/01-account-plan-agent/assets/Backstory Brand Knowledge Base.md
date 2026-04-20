# Backstory Brand Knowledge Base

This reference captures the core visual system for Backstory outputs used in account plans, executive briefs, and workflow-generated artifacts.

## Brand Essence

Backstory should feel modern, confident, and precise.

- Voice: direct, practical, and insight-led
- Tone: calm, clear, and analytical
- Visual posture: dark interface, high contrast, restrained motion, selective use of glow

## Logo System

Use the Backstory mark as a rounded square with a bold `B`.

- Preferred mark: white `B` on an indigo-to-purple gradient
- Wordmark: `Backstory` in DM Sans, bold weight
- Clear space: at least half the mark width on all sides
- Avoid outlines, drop shadows on the wordmark, or alternate letters

## Core Palette

Use these colors in HTML outputs and mockups:

| Token | Hex | Usage |
| --- | --- | --- |
| Backstory Indigo | `#6366f1` | Primary accents, buttons, key highlights |
| Backstory Purple | `#8b5cf6` | Gradient endpoint, secondary accent |
| Deep Navy | `#0a0e17` | App background |
| Midnight Surface | `#111827` | Cards and panels |
| Slate Border | `#253249` | Dividers, table borders, subtle outlines |
| Primary Text | `#e2e8f0` | Headings and body text |
| Secondary Text | `#94a3b8` | Labels, helper copy, metadata |
| Success | `#22c55e` | Positive status |
| Warning | `#f59e0b` | Caution states |
| Danger | `#ef4444` | Risk states |

## Gradients

Preferred gradient:

- Primary Gradient: `linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)`

Optional background treatment:

- Indigo glow: `rgba(99, 102, 241, 0.18)`
- Purple glow: `rgba(139, 92, 246, 0.12)`

## Typography

Use DM Sans throughout.

- Heading weights: 700-800
- Body weights: 400-500
- UI labels and badges: 600
- Avoid condensed or serif pairings

## Layout Principles

- Favor dark surfaces with subtle borders over flat black blocks
- Use generous spacing and short sections for readability
- Prefer clean cards, pill badges, and lightly elevated panels
- Tables should be compact, scannable, and high contrast
- Code blocks should use a darker inset surface than surrounding cards

## Content Patterns

For generated outputs:

- Lead with the most decision-relevant insight
- Quantify impact wherever possible
- Separate risks, opportunities, and next steps clearly
- Use short headings and structured sections
- Do not add decorative filler or marketing-style claims

## HTML Output Guidance

When a skill generates HTML:

- Use DM Sans as the primary font family
- Use the Backstory primary gradient for hero accents or badges
- Keep backgrounds dark: `#0a0e17` or `#111827`
- Use `#e2e8f0` for primary text and `#94a3b8` for supporting copy
- Reserve bright accent color for calls to action, charts, or high-signal labels
- Keep shadows soft and avoid glossy effects

## Example CSS Tokens

```css
:root {
  --backstory-indigo: #6366f1;
  --backstory-purple: #8b5cf6;
  --backstory-bg: #0a0e17;
  --backstory-surface: #111827;
  --backstory-border: #253249;
  --backstory-text: #e2e8f0;
  --backstory-text-muted: #94a3b8;
}
```

## Do / Don't

- Do use concise, executive-friendly layouts
- Do keep interfaces dark and high contrast
- Do use indigo and purple as the main accent system
- Don't use light-theme canvases by default
- Don't use generic system fonts when DM Sans is available
- Don't overload pages with multiple competing accent colors
