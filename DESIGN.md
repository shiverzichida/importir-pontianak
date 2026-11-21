# DESIGN.md — Importir Pontianak

## Design Read
Reading this as: B2B cross-border freight and sourcing platform for Pontianak and Kalimantan Barat business owners, in a structured maritime manifest and trade ledger style, dial ENERGY 2 / RHYTHM 3 / MOTION 1.

## Three Dials
- **ENERGY: 2 (Balanced commercial authority)** — Direct, confident freight headlines paired with real tariff tables and live calculator breakdowns rather than hype.
- **RHYTHM: 3 (Asymmetric, varied composition)** — Alternates editorial 7/5 hero split with a live tariff manifest ledger, asymmetric flagship-plus-stacked service layout, structured comparison ledger, two-column interactive calculator, hairline 5-step process bar, warehouse directory, RFQ workbench, live Kalbar cost scenarios, and split FAQ.
- **MOTION: 1 (Calm)** — Hover, active, and focus state transitions only. Zero infinite pulse animations, zero scroll-reveal theater, and full support for `prefers-reduced-motion: reduce`.

## Color Palette (2 Core + 1 Accent + Warm Neutrals)
- **Core 1 — Deep Kapuas Navy:** `#0B1F3A` (secondary dark surface `#122B4D`, deep footer `#071426`) — anchors trust, dark manifest tables, and high-contrast header/hero surfaces.
- **Core 2 — Maritime Teal:** `#0F766E` (`teal`, 5.47:1 contrast with white text) and `#115E59` (`teal-dark`, 7.64:1) — primary interactive action color and selected-state border/highlight.
- **Deliberate Accent — Cargo Ochre:** `#F59E0B` paired with `#0B1F3A` dark navy text (8.20:1 contrast) for primary quick-track submission, and `#B45309` with white text (5.02:1 contrast) for secondary urgency accents.
- **Neutrals:** Warm Paper Canvas `#F6F5F1`, White `#FFFFFF`, Ink `#0F172A`, Secondary Ink `#334155`, Muted Ink `#475569` on light backgrounds (6.9:1+ contrast) and `#CBD5E1` on dark navy (11.2:1+ contrast).

## Typography
- **UI & Headings:** `Plus Jakarta Sans` — geometric warmth and clear Indonesian/Latin legibility across dense rate tables and forms.
- **Tabular Data & Codes:** `IBM Plex Mono` — selected for customs manifests, AWB tracking numbers (`IMP-PNK-...`), marking codes (`PNK-CN-...`), FX rates, and coordinates (`0°00'N 109°20'E`).

## Identity Motif
- Hairline-bordered maritime manifest strips (`0°00'N 109°20'E · HUB PONTIANAK`) and structured tabular tariff ledgers that clearly belong to a West Kalimantan cross-border forwarder.

## Decision Log (R-31)
- **Colors:** Kapuas Navy, Maritime Teal, and Cargo Ochre evoke river/sea port freight markings while maintaining WCAG AA contrast across light paper and dark surfaces.
- **Layout:** Asymmetric 7/5 splits and varied section structures highlight real tariff data and live calculation tools instead of repetitive AI card grids.
- **Typography:** Plus Jakarta Sans keeps Indonesian business copy scannable, while IBM Plex Mono aligns currency figures, weights, and tracking numbers cleanly.
- **Spacing & Radii:** Sharp `rounded-md` / `rounded-lg` corners on inputs and ledger tables contrast with `rounded-xl` primary action containers to establish functional hierarchy without pill-overload.
- **Motion:** Restricted to crisp focus/hover states so operational tools (calculator, tracking, admin) remain responsive and predictable on both desktop and mobile.
