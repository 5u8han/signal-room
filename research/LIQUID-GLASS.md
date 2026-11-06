# Liquid-glass landing studies

Retained reference and implementation map · November 6, 2026

## Design intent

Sub requested four examples before choosing a direction: place navigation inside the animated home office, move the logo/name/mission lower, and make the room occupy roughly 75–85% of the viewport. These studies reuse the existing room media, sprite, equipment activity and incident model. Ambient edge extension expands the composition above and below the artwork; no new room artwork was generated for this pass.

The existing homepage links to these studies. It remains the baseline until Sub selects an arrangement. Portfolio copy and résumé content are outside this comparison pass.

## What the references teach

The supplied [Liquid Glass Design guide](https://liquidglassdesign.com/what-is-liquid-glass) distinguishes a static frosted panel from an optical material: blur softens the background, while refraction distorts it; moving highlights and responsive shapes contribute to the liquid impression. Blur, a border and a shadow alone should be described as a glass-inspired treatment, rather than a complete optical simulation.

[Apple’s Materials guidance](https://developer.apple.com/design/human-interface-guidelines/materials) places glass in the functional layer above content. Our application of that principle is one coherent navigation system over the room, with readable text and restrained tint, rather than glass applied to every piece of content.

[Meet Liquid Glass](https://developer.apple.com/videos/play/wwdc2025/219/) explains how highlights, elevation, adaptable contrast and local expansion reinforce the relationship between a control and its response. The useful lesson here is functional continuity: the menu belongs to the room without competing with its machines or obscuring the identity.

## Four live review routes

The comparison hub is [`/glass-studies.html`](../dist/glass-studies.html).

| Route | Study | Arrangement | Desktop hero |
| --- | --- | --- | --- |
| [`/glass-01.html`](../dist/glass-01.html) | Canopy | A broad glass ribbon inside the upper room | `82svh` |
| [`/glass-02.html`](../dist/glass-02.html) | Split Signal | Separate floating navigation and utility islands | `84svh` |
| [`/glass-03.html`](../dist/glass-03.html) | Glass Spine | A slim side rail, with identity moved inward and lower | `83svh` |
| [`/glass-04.html`](../dist/glass-04.html) | Command Dock | A compact two-row navigator at the upper right | `80svh` |

Mobile studies use an `84svh` landing section. Command Dock is an upper-right arrangement, not a bottom dock. Every route retains the working room rather than substituting a still mockup.

## Implementation map

- A dedicated study module moves the existing header into the scene, preserving its attached listeners and shared theme/motion/search behavior. This avoids recreating parallel controls with inconsistent state.
- CSS provides translucent surfaces, edge highlights, soft elevation, pointer glow, press feedback and open-state treatment. Variant 3 optionally uses the SVG displacement filter `#glass-lens`, with a CSS fallback. This is a web interpretation, not Apple’s native material or shader pipeline.
- Room imagery and activity remain in their existing rendering layers. The navigation sits above them. Avoid placing the glass inside an ancestor whose filter, opacity, mask or blending isolates its backdrop: [MDN explains backdrop roots](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/backdrop-filter).
- Reduced motion removes or quiets decorative elastic/glow motion. Reduced transparency and higher-contrast treatments increase surface opacity, strengthen borders and keep labels readable. The [reduced-transparency query has limited availability](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-reduced-transparency), so readable defaults and CSS fallbacks remain necessary. [Contrast preferences](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/%40media/prefers-contrast) provide another adaptation signal.
- Keep independently blurred areas small and avoid adding a continuous full-screen optical renderer to the already animated room. This is an implementation choice to contain rendering work, not a measured performance claim.

## Verification boundary

This document records references, intent and the implementation map. Browser appearance, interaction results, measured dimensions and performance belong in the root agent’s QA record; no browser-test result is asserted here.
