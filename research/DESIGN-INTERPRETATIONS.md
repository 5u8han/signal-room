# Three complete reference interpretations / November 6, 2026

Sub requested functioning test sites for Delta Cafés, Roveia and Atmos About, each with the actual existing homelab animation and precisely labeled elements. This is an authorized comparison pass. It does not select a final navigation or roll a new design across the portfolio.

## Review entry points

- All studies and searchable address book: http://127.0.0.1:4320/design-studies.html
- Field Notes / Delta: http://127.0.0.1:4320/study-delta.html
- Connected / Roveia: http://127.0.0.1:4320/study-roveia.html
- Signal Atlas / Atmos: http://127.0.0.1:4320/study-atmos.html
- Actual reference recordings remain at http://127.0.0.1:4321/ .

These are full single-page compositions with distinct navigation, hierarchy, sectional rhythm, interactions, motion and footers. They interpret the observed design language of the three supplied pages. They do not claim to reproduce every interaction, exact easing curve, proprietary component or linked route from those sites. Original source observations are in `REFERENCE-SITES-NOTES.md`.

## Precise feedback workflow

Each study has a fixed review bar. **Section map** opens a searchable address list with a description of each design idea, a jump link and a Copy ID button. **Labels** cycles through sections, all details, and off. Clicking a visible badge copies the element's actual CSS ID. Navigation, major sections and nested visual details use stable names. URLs can deep-link directly to these IDs.

`dist/design-studies.json` is the generated address book: 127 labeled elements in total, across 31 major regions (including navigation/footer). Delta has 38 elements; Roveia 48; Atmos 41. The comparison hub searches this same catalog and links to the exact page/anchor.

Useful feedback could be: “Use `#delta-nav`, keep `#roveia-case-stack`, and take `#atmos-palette-columns`. Make `#delta-identity` smaller.” No developer tools are needed.

## Field Notes / Delta

Source: https://deltacafes.com/en . The translation centers on photographic atmosphere, smoked split navigation, a centered identity, low-left serif typography, cream editorial grounds, fine rules, alternating image scale, and forest-green monumental closing type.

| Element | What it tests |
| --- | --- |
| `#delta-nav` | Persistent split navigation around the centered mark; phone disclosure. |
| `#delta-hero`, `#delta-identity` | Full-bleed live room, serif identity and existing typewriter. |
| `#delta-editorial`, `#delta-editorial-image` | Asymmetric editorial split and a tall equipment portrait with parallax. |
| `#delta-signal-path`, `#delta-flow-illustration` | Original line art, restrained moving data and equal-weight capability columns. |
| `#delta-field-notes`, `#delta-portrait-strip` | Staggered photographic strip; horizontal swipe on phones. |
| `#delta-infrastructure`, `#delta-infrastructure-note` | Large image alongside narrow field-note text. |
| `#delta-method`, `#delta-method-rows` | Sticky editorial title and native ruled disclosure rows. |
| `#delta-type-field`, `#delta-moving-type` | Pinned dark-green type interlude with opposing scroll movement. |
| `#delta-journal`, `#delta-journal-grid` | Three-column journal with picture fragments and fine separators. |
| `#delta-footer`, `#delta-footer-landscape` | Condensed monumental words and photographic utility band. |

## Connected / Roveia

Source: https://www.roveia.com/ . The translation centers on white capsule navigation, centered black/blue hierarchy, a rounded pale-blue media field, overlapping case cards, quiet service cards/chips, a charcoal process panel, a pinned tilted-card sequence and a blue wave footer.

| Element | What it tests |
| --- | --- |
| `#roveia-nav`, `#roveia-opening-type` | Capsule navigation and oversized centered black/blue opening. |
| `#roveia-hero`, `#roveia-hero-caption` | Actual room in a pale-blue frame with companion information. |
| `#roveia-toolbelt`, `#roveia-toolbelt-type` | A quiet typographic pause between media and cases. |
| `#roveia-cases`, `#roveia-case-stack` | Three large CSS-sticky cases with separate offsets and split media. |
| `#roveia-capabilities`, `#roveia-capability-grid` | Neutral rounded service cards, blue line symbols, chips and hover lift. |
| `#roveia-process`, `#roveia-process-steps` | Dark rounded process panel, numbered steps and blue orbital specimen. |
| `#roveia-orbit-cards`, `#roveia-orbit-heading` | Stable centered type with tilted cards moving at the edges. |
| `#roveia-faq`, `#roveia-faq-rows` | Split FAQ and native disclosure with circular indicators. |
| `#roveia-closing`, `#roveia-closing-type` | A quiet centered closing statement. |
| `#roveia-footer`, `#roveia-footer-wave` | Original SVG wave and restrained footer columns. |

No Roveia business metrics or testimonials were imported. Factual capability cards replace quoted testimonials; case content uses Sub's supplied experience without invented outcomes.

## Signal Atlas / Atmos

Source: https://atmos.gallery/about . The translation centers on thin outlined navigation, monumental tight typography, black negative space, olive word-emphasis interludes, numbered editorial grids, fine ruled comparisons, three-column color specimens, overlapping rotating panels and a near full-width footer wordmark.

| Element | What it tests |
| --- | --- |
| `#atmos-nav`, `#atmos-opening-title` | Thin centered navigation and enormous close-set opening type. |
| `#atmos-hero`, `#atmos-identity` | The real room as a large framed gallery specimen. |
| `#atmos-interlude`, `#atmos-emphasis-text` | Olive pinned interlude and word-by-word scroll emphasis. |
| `#atmos-index`, `#atmos-comparison-rows` | Numbered editorial columns and fine-rule technical comparisons. |
| `#atmos-palette`, `#atmos-palette-controls` | Working Chlorophyll / Voltage / Afterglow palette switches. |
| `#atmos-palette-columns` | Three large Surface / Ink / Signal specimens with live hex values. |
| `#atmos-panels`, `#atmos-panel-floating` | Large overlapping panels with restrained scroll rotation and travel. |
| `#atmos-specimen`, `#atmos-terminal-specimen` | Split physical-room / authored-shell composition; output is illustrative. |
| `#atmos-principles`, `#atmos-principle-grid` | Sparse equal-weight numbered principles. |
| `#atmos-footer`, `#atmos-footer-wordmark` | Large edge-to-edge closing identity with restrained utility links. |

The authored reference palettes remain fixed so the visual comparison is consistent. The theme button previews the retained room lighting, indicator accents and dialogs; it does not recolor every editorial specimen. Atmos's palette buttons separately change the color specimens and large panels. No registered trademark claim is made for Sub's identity.

## Shared live room and maintenance

`node scripts/create-reference-studies.mjs` rebuilds all three routes and the address book. It reads the current room and its three dialogs from `dist/index.html`, inserts exactly one scene into each template, annotates identity/status/controls, and rejects duplicate IDs. The three templates are in `scripts/reference-studies/`; each has its own stylesheet. The existing incident model, actor, screen mapping, physics interactions and console are reused, not replaced by screenshots, videos or iframes.

`study-common.js` owns labels, clipboard fallback, searchable modal, phone menus, motion preferences, reveal/scroll observers and cover geometry. `study-common.css` owns shared review UI and scene geometry. The source image and emission canvas keep the same aspect ratio; an explicit cover width prevents the previous blank strip. Phone rooms default to a swipeable panorama with actor following; Whole room / Immersive view switches the overview. The retained scene controls and simulated management dialogs work on each route.

Motion follows the system reduced-motion preference and the review bar's saved motion setting. Quiet mode exposes the room's Next step control, removes continuous movement, and leaves page copy readable. Responsive layouts simplify stacking/orbit sequences on phones. No third-party runtime was activated, no original portraits or external reference media were copied into public assets, and no final factual copy rewrite was attempted.
