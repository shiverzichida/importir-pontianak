# DESIGN.md — Importir Pontianak

## Design Read
Reading this as: B2B cross-border freight & sourcing platform for Pontianak and Kalimantan Barat business owners, following the user-supplied bright maritime port visual reference (sunny harbor hero, royal maritime blue `#1049B2` + deep navy `#0B2351`, bright ice surfaces `#F4F8FF`, and gold `#FACC15` action buttons), dial ENERGY 2 / RHYTHM 3 / MOTION 1.

## Three Dials
- **ENERGY: 2 (Balanced commercial authority)** — Approachable sunlit maritime imagery paired with structured calculator breakdowns and real tariff data.
- **RHYTHM: 3 (Varied composition)** — Alternates full-bleed maritime hero banner, 2×2 service grid paired beside the interactive Kalkulator Impor card, horizontal 4-step workflow strip, split dark tracking banner + route simulation carousel, warehouse directory, RFQ workbench, and FAQ.
- **MOTION: 1 (Calm)** — Hover, focus, and accordion/carousel state transitions only; honors `prefers-reduced-motion: reduce`.

## Color Palette (WCAG AA/AAA Verified)
- **Core 1 — Maritime Royal Blue & Deep Navy:** `#1049B2` (`brand`, 8.3:1 with white) and `#0B2351` (`navy`, 14.9:1 with white) for headers, active pills, icons, calculator header, and footer.
- **Core 2 — Ice Blue Surface:** `#F4F8FF` (`ice`) and `#EEF5FF` for split bands and the calculator All-In summary panel, bordered by `#DCE6F5`.
- **Deliberate Accent — Cargo Gold:** `#FACC15` (`gold`, hover `#EAB308`) paired with dark navy text `#0D224A` (10.7:1 contrast) on primary CTA buttons and destination pill badges.
- **Channel Action — WhatsApp Green:** `#15803D` (`wa`, hover `#166534`) paired with white text (5.1:1 contrast) for the header WhatsApp pill and RFQ WhatsApp handoff.

## Typography
- **UI & Headings:** `Plus Jakarta Sans` — clean, warm geometric sans for Indonesian commercial copy.
- **Tabular Numbers & Codes:** `IBM Plex Mono` — tabular currency values, FX rates, dimensions, and AWB tracking codes.

## Decision Log (R-31)
- **Colors:** Derived directly from the user-supplied reference mockup (`#1049B2`, `#0B2351`, `#FACC15`, `#F4F8FF`, `#15803D`) with darkened green/text ink where needed to pass WCAG AA contrast.
- **Layout:** Matches the reference composition (hero left + harbor banner right, 2×2 services + Kalkulator Impor side by side, 4-step workflow band, dark tracking banner + highlight carousel) while keeping real Warehouse, RFQ Form, and FAQ sections accessible below.
- **Visual Assets:** Custom-generated harbor container ship hero banner and royal-navy tracking ship map banner stored in `public/images/`, paired with inline SVG ship brand logo and calculator illustration.
