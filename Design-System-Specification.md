# Design System Architecture Specification

> **FIELD SPEC / MB-39** — Implicit Design System · Reconstruction
> Reconstructed from a curated corpus of 39 moodboard references.
> **Rules only — no interfaces reproduced, no components, no tokens.**
> Single source of truth for future mockup and design decisions.

| | |
|---|---|
| **Corpus** | 39 static images |
| **Method** | Observe → Synthesize → Rule |
| **Scope** | Architecture only |
| **Date** | 2026-07-29 |

---

## 00 · Corpus & Reading Note — `CONF 95% · VERY HIGH`

This note frames everything below. It is an observation, not a rule.

The corpus is a curated reference set drawn from many unrelated brands and projects — technical-outdoor apparel campaigns, telecom and terminal interfaces, editorial sites, research-lab identities, print posters, and mobile UI concepts. It is not a single product's screen flow. No two images belong to the same shipping interface.

Consequently, the "design system" reconstructed here is the common visual denominator the curator repeatedly selected for — the shared DNA that recurs across otherwise unrelated sources. Every rule below is justified by recurrence across multiple images. Where a trait appears in only one or two images, it is marked as an exception or a hypothesis, never promoted to a rule.

> **GOVERNING CONSTRAINT**
> The corpus shows finished artefacts, not process. Interaction, motion, state, and exact measurements are therefore inferred, never observed. All such content is flagged and scored below 80%.

---

## 01 · Executive Summary — `CONF 88% · HIGH`

**GRAPHIC DNA**
An analog–digital hybrid built on a "research instrument" metaphor. Three lineages recur and fuse: (1) Swiss / International editorial rationalism — visible grids, hairline rules, disciplined typographic hierarchy; (2) 1980s computer terminals and CRT instrumentation — monospace readouts, system logs, phosphor colour, dot-matrix and scanline texture; (3) technical-outdoor and field-manual culture — badge IDs, registration marks, "field testing / experimental lab" framing, exploded technical diagrams.

**PERSONALITY**
Technical, rigorous, and deliberately unpolished. The work reads as engineered rather than decorated — it presents itself as documentation, telemetry, or apparatus rather than marketing. Confident, utilitarian, and slightly clandestine (labels such as "confidential", "classified frequency", "reindustrialize").

**TONE**
Declarative and procedural. Copy and labelling behave like instrument panels and manuals: terse, uppercase, coded (IDs, coordinates, frequencies, versions).

**SOPHISTICATION**
High, but anti-glossy. Sophistication is expressed through restraint, grid discipline, and craft in typography — not through gradients, ornament, or effects.

**MINIMALISM**
Structural, not empty. Few colours and few element types, yet high information density is welcomed when it is organised on a grid. It is minimalism of vocabulary, not of quantity.

**OBSERVED INSPIRATIONS**
Vintage computer terminals and mainframe UIs; Swiss typographic tradition; military / scientific field manuals and HUDs; technical outdoor apparel branding; riso and photocopy print culture (halftone, dither, grain).

*EVIDENCE: terminal/CRT [img 04, 09, 10, 30, 31, 33, 36, 37]; Swiss-editorial [img 01, 02, 05, 07, 08]; field-lab framing [img 08, 09, 16, 20]; halftone/dither/grain [img 16, 22, 26, 28, 31, 34, 35, 38].*

---

## 02 · Visual DNA — `CONF 90% · VERY HIGH`

| Axis | Rule |
|---|---|
| **GEOMETRY** | Orthogonal and grid-locked. Rectangles, hairlines, and right angles dominate. Isometric/axonometric projection is the sanctioned way to show depth in diagrams. Circles appear only as seals, accent dots, or crosshairs. |
| **DENSITY** | Bimodal. Airy, high-margin hero zones coexist with dense, tabular data blocks. Density is never chaotic — it is always resolved onto a visible grid or a monospace column. |
| **RHYTHM** | Modular and repetitive. Monospace character cells and column grids create a mechanical, even cadence. Repeated marks (+, ticks, dots) reinforce metre. |
| **CONTRAST** | Extreme tonal contrast — near-black ink on warm paper, or light ink on near-black. A single saturated accent carries all chromatic contrast. |
| **BALANCE** | Asymmetric and editorial. Weight is balanced across a grid rather than mirrored. Large display type is counter-weighted by small monospace clusters. |
| **SPACE** | Negative space is structural. Generous margins isolate a single focal element; interior space separates content in place of borders wherever possible. |
| **HIERARCHY** | Driven by type scale and weight, not colour. The largest element is almost always typographic; colour marks a single focal point, not a ranking. |
| **FORMS** | Rectangular panels, hairline frames, corner brackets, crosshairs, registration marks, circular seals. Organic "blob" letterforms occur only as an expressive exception. |
| **DEPTH** | Predominantly flat. Layering is achieved by overlap, inset panels, and bordered blocks — not by shadow. Isometric line work simulates depth graphically, not with light. |
| **TEXTURE** | Deliberate analog artefacts: halftone, ordered dither, dot-matrix, scanlines, print grain, ASCII fields. Texture signals "captured/printed by a machine", reinforcing the instrument metaphor. |
| **ICONOGRAPHY** | Thin, uniform monoline and technical/isometric icons. One icon family per composition. Icons read as schematic engineering marks, not friendly pictograms. |
| **VISUAL LANGUAGE** | Instrumentation / HUD. The interface poses as a readout: logs, coordinates, frequencies, IDs, gauges, and crosshair framing. |

*EVIDENCE: isometric diagrams [img 06, 08]; crosshairs/brackets [img 01, 07, 08, 33]; seals/badges [img 09, 22]; bimodal density [airy 01/07/08 vs dense 05/13/36/37]; blob-letter exception [img 22, 24, 34].*

---

## 03 · Visual Heuristics — `CONF 82% · HIGH`

| Heuristic | Rule |
|---|---|
| **GESTALT** | The whole reads as a single instrument surface; disparate data is unified by a shared grid and one type/colour vocabulary. |
| **PROXIMITY** | Grouping is done by spacing, not by boxes or dividers. Related data sits in tight monospace clusters separated by wide gaps. |
| **SIMILARITY** | Uniform stroke weight, single icon family, and repeated marks make heterogeneous elements read as one set. |
| **CONTINUITY** | Grid lines, baselines, and connector paths lead the eye along orthogonal or isometric tracks; node/route diagrams make continuity literal. |
| **FIGURE / GROUND** | Strong and often reversible — the same system runs as dark-figure-on-light and light-figure-on-dark. Ground is never neutral white; it is warm paper or dense black. |
| **FOCAL POINT** | Exactly one per composition, created by the accent colour or by extreme scale — never by both competing. |
| **SCAN PATTERN** | Z / editorial: a large top-left or centred display statement, then a descent into small structured data. Peripheral corners carry metadata (IDs, dates, coordinates). |
| **ALIGNMENT** | Rigorous. Every element snaps to a grid line or a monospace column; ragged alignment is essentially absent. |
| **REPETITION** | A core motif engine: repeated ticks, dots, crosshairs, and character cells build texture and rhythm from a tiny vocabulary. |
| **BALANCE & SYMMETRY** | Asymmetric balance is the norm; true symmetry is reserved for seals and centred manifesto statements. |

---

## 04 · Design Principles — `CONF 86% · HIGH`

Each principle is a rule that governs future decisions. Each carries a justification traced to the corpus.

**Always express hierarchy through typographic scale and weight before colour.**
*WHY* — across the corpus the largest, most important element is typographic; colour marks a single focal point rather than a level. Colour-led hierarchy would break the near-monochrome discipline.

**Treat the interface as an instrument, not a brochure.**
*WHY* — recurring logs, IDs, coordinates, gauges, and crosshair framing establish a readout metaphor. Decorative or "friendly" framing contradicts the observed voice.

**Reserve saturated colour for exactly one signal per view.**
*WHY* — every composition pairs a near-monochrome field with a single accent used as a focal or alert. Multiple saturated colours never co-star.

**Separate content with space and alignment first; add rules or borders only when space fails.**
*WHY* — grouping is overwhelmingly done by proximity on a grid; hairlines appear only where dense data cannot be spaced apart.

**Keep surfaces flat; imply depth by overlap, inset, and isometric line work, never by soft shadow.**
*WHY* — the corpus contains almost no drop shadows; depth is graphic (projection, overlap, bordered panels), consistent with the print/terminal lineage.

**Let texture read as a machine artefact, and apply it deliberately.**
*WHY* — halftone, dither, dot-matrix, and grain recur as intentional marks of capture/printing; smooth gradients are absent. Random or soft texture would read as off-system.

**Build density on a visible module; never let dense data become free-form.**
*WHY* — the densest references (data tables, calendars, telemetry) remain legible because they sit on an exposed grid or monospace column.

**Restrict each composition to one icon family and one uniform stroke weight.**
*WHY* — icon sets within any single reference are internally consistent; mixing families would violate the "similarity" cohesion the system relies on.

**Confine expressive, bespoke letterforms to display moments; keep working text neutral.**
*WHY* — blob/pebble/experimental letters appear only at poster-headline scale, always over neutral grotesque or monospace body text.

---

## 05 · Colour System — Philosophy — `CONF 84% · HIGH`

Philosophy only. No definitive palette is fixed here.

| Axis | Rule |
|---|---|
| **ROLE OF COLOUR** | Colour is a signalling tool, not a decorative layer. The base is achromatic; a single accent denotes focus, action, or alert. |
| **BASE LOGIC** | Two interchangeable near-monochrome grounds: a warm paper mode (sand / bone / off-white) and a terminal mode (near-black / deep brown). White-white is avoided; grounds are always warmed or darkened. |
| **ACCENT LOGIC** | One saturated accent per surface. Warm orange / red-orange is the most frequent accent; electric cyan and phosphor green appear as mode-specific alternates (typically terminal mode). Accents are never mixed within one view. |
| **SECONDARIES** | Earth-tone neutrals (warm greys, tans, mid-browns) support the base. One reference presented a named neutral swatch card, evidencing this earthy direction — but a single card is not the system palette and must be validated. |
| **FUNCTIONAL COLOUR** | Minimal and mostly limited to a red/red-orange "alert" state. A dedicated success/warning/info spectrum is not observable and must not be assumed. |
| **SATURATION** | Bimodal: near-zero across the base, very high on the single accent. Mid-saturation is rare and should be treated as off-system. |
| **LUMINOSITY / CONTRAST** | High contrast is mandatory in both modes. The system lives at the extremes of the tonal range, not in the middle. |

> **VALIDATE BEFORE USE**
> The accent hue is not fixed by the corpus — orange dominates but cyan and green are both present. The choice of a single canonical accent (or a mode-dependent pair) is a decision that must be made with the brand owner, not inferred.

*EVIDENCE: warm-paper ground [img 01,02,05,07,08,14,35]; terminal ground [img 04,09,10,30,33,36,37]; orange accent [img 08,13,20,23,27,28,30]; cyan/green accent [img 03,07,31,33]; neutral swatch card [img 12]; red alert tile [img 16,36].*

---

## 06 · Typography — Philosophy — `CONF 85% · HIGH`

Philosophy and hierarchy only. No type tokens are specified.

**THREE-VOICE SYSTEM** — the corpus consistently deploys three typographic voices with distinct jobs:

- **Editorial serif** — reserved for large display headlines and manifesto statements; provides authority and a human, print counterpoint to the machine voice.
- **Grotesque / geometric sans** — the neutral workhorse for structural headings and body; plain, objective, Swiss in temperament.
- **Monospace** — the signature voice for metadata, data tables, labels, coordinates, and terminal UI; carries the instrument identity.

| Axis | Rule |
|---|---|
| **HIERARCHY** | Established by dramatic jumps in scale and weight, not by colour or many intermediate sizes. Large display vs small monospace, with little in between. |
| **WEIGHT** | Polarised — heavy display and regular/light functional text. Mid-weights are used sparingly. |
| **VERTICAL RHYTHM** | Tight and mechanical, especially in monospace blocks where the character grid enforces an even baseline cadence. |
| **DENSITY** | Display text is airy and generously spaced; functional monospace text is dense and tightly set. The two densities are intentionally juxtaposed. |
| **CASE & TRACKING** | Uppercase with wide tracking marks labels and system copy; sentence case is used for reading text. Uppercase signals "machine/label", case signals "human/read". |
| **EXPRESSIVE EXCEPTION** | Bespoke, distorted, or "blob" letterforms are permitted only at display scale as a deliberate art moment, never for functional text. |

*EVIDENCE: serif display [img 01,02,07,08,14]; grotesque sans [img 16,27,34]; monospace UI/labels [img 04,08,09,10,30,33,36,37]; expressive display [img 22,24,34,35].*

---

## 07 · Spatial System — `CONF 83% · HIGH`

| Axis | Rule |
|---|---|
| **SPACING LOGIC** | Space is the primary separator. Wide, consistent gaps group and divide content before any rule or border is introduced. |
| **GRID** | A modular, often literally visible grid underlies layouts — exposed as graph paper, calendar cells, or map graticule. Content aligns to it even when dense. |
| **COLUMNS** | Editorial multi-column structure for text; monospace data aligns to character columns. Both express the same underlying discipline. |
| **MARGINS** | Generous outer margins frame the composition; peripheral edges and corners carry small metadata rather than sitting empty. |
| **BREATHING ROOM** | Concentrated around the single focal element. Density is spent on data zones and reclaimed at the hero. |
| **RHYTHM** | Even and modular — repeated spacing intervals and character cells produce a metronomic cadence. |

> **NOT OBSERVABLE**
> Exact spacing values, base unit, and column counts cannot be measured from static, unrelated references. The logic (modular, grid-locked, space-first) is high-confidence; any specific scale must be defined and validated separately.

---

## 08 · Shape Language — `CONF 84% · HIGH`

| Axis | Rule |
|---|---|
| **RADII** | Predominantly sharp. Rectangles, panels, and frames are square-cornered or only slightly softened. Heavy rounding is off-system except on hardware chrome (device bezels) which is not part of the system itself. |
| **GEOMETRY** | Orthogonal first; isometric/axonometric for anything dimensional. Diagonals are purposeful (routes, connectors, projection), not decorative. |
| **STROKES** | Hairline, uniform-weight lines are a core primitive — frames, dividers, connectors, and icons all share one thin weight. |
| **CIRCLES** | Restricted roles: seals/stamps, accent dots, gauge rings, and crosshair centres. Circles are never a general container. |
| **SILHOUETTES / PROPORTIONS** | Rectangular panels tend toward wide, document-like proportions; framing marks (corner brackets, ticks) imply a larger registration field around content. |
| **ORGANIC EXCEPTION** | Rounded, pebble-like, or distorted forms are confined to expressive display typography — a controlled release valve, not a system trait. |

*EVIDENCE: hairline frames/brackets [img 07,08,33]; isometric geometry [img 06,08]; seals/gauge rings [img 08,09]; pebble letters [img 22].*

---

## 09 · Elevation — `CONF 80% · HIGH`

| Axis | Rule |
|---|---|
| **DEPTH MODEL** | Near-flat. The system reads as printed or as a single-plane screen; it does not simulate stacked physical cards with light. |
| **SHADOW** | Essentially absent. Soft drop shadows would contradict the print/terminal lineage and must be treated as off-system. |
| **LAYERING** | Achieved graphically — by overlap, inset/bordered panels, and background tint blocks that sit behind content. |
| **OVERLAYS** | Modelled as full-bleed tint panels (e.g. a solid accent block occupying a region) rather than translucent floating sheets with blur. |

> **VALIDATE BEFORE USE**
> Because the corpus is largely print and single-plane UI, a layered elevation ladder (for menus, modals, sheets) is not observable. The safe, in-DNA default is a very shallow ladder expressed by borders and tint, not shadow — but the number of levels must be defined deliberately.

*EVIDENCE: tint-block overlay [img 13]; bordered/inset panels [img 08,09,36]; no soft shadow across corpus.*

---

## 10 · Motion Philosophy — `CONF 45% · LOW — HYPOTHESIS`

> **NOT OBSERVABLE — INFERENCE ONLY**
> The corpus is entirely static. Nothing about motion is observed. The following is deduced solely as what would be coherent with the visual language, and must be validated before use.

| Axis | Inference |
|---|---|
| **CHARACTER** | Mechanical and instrument-like rather than fluid or playful — coherent with the terminal/telemetry metaphor. |
| **SPEED** | Fast and decisive; state changes that snap or step rather than glide. |
| **INERTIA / EASING** | Minimal easing and little bounce; linear or sharp curves suit the rectilinear, gridded language. |
| **IMPLIED TRANSITIONS** | Terminal-style reveals (type-on, cell-by-cell, cut transitions) are more consistent with the DNA than fades or parallax. |

---

## 11 · Accessibility Constraints — `CONF 78% · MEDIUM — VALIDATE`

Constraints the system must respect. Where the corpus is at risk of failing a criterion, it is flagged.

| Axis | Constraint |
|---|---|
| **CONTRAST — STRENGTH** | *Asset.* The extreme-contrast base (near-black on paper / light on black) supports WCAG 2.2 AA and often AAA for primary text. This is a core, defensible strength. |
| **CONTRAST — RISKS** | *RISK.* Tan-on-tan and warm-grey-on-warm-grey pairings, hairline strokes, and accent-on-accent labels can fall below 4.5:1. Halftone/dithered text is especially fragile. All must be contrast-checked, not assumed. |
| **LEGIBILITY** | *RISK.* Monospace and dense data tables reduce reading speed at small sizes; a minimum functional size floor must be set. Expressive/blob display letterforms must never carry essential information alone. |
| **COLOUR INDEPENDENCE** | The single-accent model helps: because meaning is carried by scale/type, a colour-blind user is rarely dependent on hue. Alert states must still pair colour with text or an icon. |
| **TOUCH TARGETS** | *Not observable.* No interactive target sizing can be read from static references. A minimum target size (per WCAG 2.2 target-size guidance) must be defined at design time. |
| **HIERARCHY FOR AT** | Type-led hierarchy maps cleanly to a semantic heading order; the visual system should be mirrored by a genuine structural hierarchy for assistive technology. |

---

## 12 · System Constraints — `CONF 87% · HIGH`

Binding rules for every future mockup. Each is derived from a recurring corpus pattern.

- **Never** use more than one saturated accent colour in a single view.
- **Never** mix more than one icon family, or more than one icon stroke weight, in a single composition.
- **Never** introduce a soft drop shadow; imply depth with overlap, inset, border, or tint only.
- **Never** place essential information in an expressive/distorted display letterform; keep it in the neutral sans or monospace voice.
- **Never** use pure white (`#FFFFFF`) as a ground; warm or darken every base.
- **Never** let hierarchy be carried by colour where scale and weight can carry it.
- **Always** resolve dense data onto a visible grid or a monospace column — no free-floating data.
- **Always** prefer space and alignment over rules and boxes for grouping; add a hairline only when spacing cannot separate.
- **Always** keep the three typographic voices in their assigned roles (serif = display, sans = structure/body, mono = data/labels).
- **Always** maintain extreme figure/ground contrast; never operate in the mid-tonal range.
- **Always** reserve circles for seals, accent dots, gauge rings, or crosshairs — never as a general container.
- **Always** treat texture (halftone, dither, grain, scanline) as an intentional, machine-like mark — never as incidental noise or a soft gradient.

---

## 13 · Hypotheses — `CONF — DECLARED INFERENCE`

Deduced but not directly observable. Each requires validation before being treated as a rule.

- A dual light/dark ("paper" and "terminal") mode is a deliberate system feature, not two unrelated looks. *[inferred from recurrence of both]*
- Orange / red-orange is the intended primary accent, with cyan and green as terminal-mode alternates. *[inferred from frequency]*
- Motion is mechanical, fast, and stepped rather than fluid. *[inferred from static DNA only]*
- The elevation ladder is intentionally shallow (1–2 levels) expressed by border/tint. *[inferred; not directly shown]*
- A single base spacing unit governs the modular grid. *[inferred from grid discipline; value unknown]*
- Uppercase-tracked labelling is a systemic convention for "machine" copy vs sentence case for "human" copy. *[inferred from consistent usage]*

---

## 14 · Open Questions — `CONF — UNDETERMINABLE`

Information that cannot be resolved from the corpus and must come from the brand owner.

- Which single accent hue is canonical, and is it fixed or mode-dependent?
- What are the exact typefaces for each of the three voices?
- What is the base spacing unit, and how many grid columns govern each breakpoint?
- What is the full type scale (sizes, line-heights) between display and functional extremes?
- How many elevation levels exist, and what visual device expresses each?
- What is the complete functional-colour set (success / warning / info), if any beyond "alert"?
- What are the interaction states (hover, focus, active, disabled, error) for interactive elements?
- What are minimum touch-target and minimum functional type sizes?
- What is the motion specification (durations, easing, transition patterns)?
- Which traits are brand-level identity vs reusable system — e.g. is heavy texture a system default or a campaign device?

---

## 15 · Confidence Report — `SUMMARY`

Any section below 80% must be validated with the brand owner before being used as a reference.

| Section | Score | Level | Justification |
|---|---|---|---|
| 00 · Corpus & Reading Note | 95% | Very High | Directly evident: the images are visibly from many unrelated brands/projects. |
| 01 · Executive Summary | 88% | High | Three lineages recur across a large majority of images; synthesis is well-supported. |
| 02 · Visual DNA | 90% | Very High | Geometry, texture, contrast, and framing are directly observable and highly repetitive. |
| 03 · Visual Heuristics | 82% | High | Gestalt patterns strongly suggested; some (scan path) are reasoned from layout not measured. |
| 04 · Design Principles | 86% | High | Each principle maps to a repeated pattern; framing as a rule is interpretive. |
| 05 · Colour System | 84% | High | Base/accent logic clearly recurs; the canonical accent hue is genuinely ambiguous. |
| 06 · Typography | 85% | High | Three-voice division is consistent; exact faces and scale are not determinable. |
| 07 · Spatial System | 83% | High | Grid logic is often literally visible; numeric values are not measurable. |
| 08 · Shape Language | 84% | High | Sharp geometry, hairlines, and circle roles recur clearly across references. |
| 09 · Elevation | 80% | High | Flatness is observable; a full elevation ladder is inferred, not shown. |
| 10 · Motion | 45% | Low ◂ **VALIDATE** | Corpus is static; all motion content is inference from coherence only. |
| 11 · Accessibility | 78% | Medium ◂ **VALIDATE** | Contrast strengths observable; targets, sizes, and some pairings need testing. |
| 12 · System Constraints | 87% | High | Each constraint restates a repeatedly observed pattern. |
| 13 · Hypotheses | 60% | Medium ◂ **VALIDATE** | Declared inferences by design; recurrence supports but does not confirm them. |
| 14 · Open Questions | — | N/A | Enumerates the undeterminable; no confidence applies. |

> **SECTIONS REQUIRING VALIDATION BEFORE REFERENCE USE**
> 10 · Motion (45%) · 11 · Accessibility (78%) · 13 · Hypotheses (60%). Do not treat these as fixed rules until confirmed with the brand owner.
