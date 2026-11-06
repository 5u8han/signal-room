# Recorded design references / November 6, 2026

Sub supplied these three pages to inspect before choosing inspiration. All three were opened and captured in the actual browser: Delta/Roveia exports are 1750 × 1314 and Atmos is 1766 × 1314. The recordings cover the provided pages from opening to footer; they do not crawl every linked page. No reference direction has been selected or applied.

Review player: http://127.0.0.1:4321/ . It provides source links, MP4 downloads and clickable section timestamps. Captures and exports remain in the ignored local research folders, outside the public portfolio assets.

## Delta Cafés

Source: https://deltacafes.com/en . Recording: `research/recordings/delta-full-layout.mp4`, approximately 23 seconds.

- **0–2 s:** Full-bleed photographic/video opening with a large, light serif headline low on the left. Smoked navigation divides around the central triangular mark; sound and language controls occupy separate edge islands. Actions pair a pill with a circular arrow.
- **Around 7–10 s:** Photography and line-art treatments give way to portrait strips and editorial imagery. The header stays in the same screen position across recorded scroll states.
- **Around 16 s:** Cream/grain grounds, thin rules and an asymmetric image/text arrangement contrast with the opening.
- **Around 20–22 s:** Dark-green fields, oversized condensed type and a landscape-backed translucent footer change the scale and atmosphere.

## Roveia Health

Source: https://www.roveia.com/ . Recording: `research/recordings/roveia-full-layout.mp4`, approximately 46 seconds.

- **0–2 s:** A persistent white capsule nav sits above large centered black/blue typography. A pale-blue rounded hero field balances central media with a metric and short supporting copy.
- **Around 18 s:** Large overlapping rounded case cards fill most of the viewport.
- **Around 27 s:** Quiet gray service cards with small chips lead into a charcoal process panel: large left heading, three right-side steps and blue objects.
- **Around 29–41 s:** Tilted quote cards occupy changing edge positions around a stable centered heading.
- **Around 45 s:** A large FAQ heading opposes simple question rows, followed by a blue-wave closing/footer.

Business claims and testimonials belong to Roveia. They are not facts or content for Sub's portfolio.

## Atmos Gallery / About

Source: https://atmos.gallery/about . Recording: `research/recordings/atmos-full-layout.mp4`, approximately 44 seconds. Browser access succeeded; the earlier web-text extraction failure is not a current viewing blocker.

- **0–2 s:** Thin, nearly full-width rounded nav; centered wordmark, small edge controls, tightly spaced large typography and generous black negative space.
- **Around 9 s:** An olive full-screen interlude emphasizes words progressively.
- **Around 13–14 s:** Numbered editorial headings align left; explanation and three-column color ramps align beside fine ruled comparisons.
- **Around 19–26 s:** Large palette panels, slight rotations and split portrait/interface specimens change scale.
- **Around 42 s:** An oversized, nearly edge-to-edge wordmark closes the page.

The final recording was recaptured after declining optional analytics, clearing the consent panel without modifying the page's design.

## Capture and evidence

Raw JPEG frames plus timestamp/chapter manifests are in `.local/reference-capture/{delta,roveia,atmos}/`. They were recorded with the supported browser screencast capability, not assembled from website source assets. `scripts/assemble-reference-recordings.mjs` exports silent H.264 MP4s at 30 fps while retaining capture timing. The encoding rate is not a claim that every source frame was captured at 30 fps. `scripts/serve-reference-recordings.mjs` serves the local player only on 127.0.0.1, including byte ranges for seeking.

The descriptions above combine direct browser inspection and representative recorded frames. Exact eases, implementation libraries and interaction triggers are not inferred from screenshots. The main recordings show scrolling; dropdown/hover variants and every linked route were not exhaustively captured. Section timestamps are approximate review aids. Use the recordings and original pages when Sub identifies a specific detail to inspect further.
