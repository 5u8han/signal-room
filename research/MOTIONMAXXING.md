# Motionmaxxing / staged source reference

Imported November 6, 2026 at Sub's request. This is a separate local toolkit checkout for review, following the agreed toolkit-first workflow. No Motionmaxxing runtime, vendor bundle, example film, or new animation has been added to the portfolio's public assets.

## Source and pin

- Upstream: [Tejashmakwana/motionmaxxing](https://github.com/Tejashmakwana/motionmaxxing), by Tejas Makwana.
- Exact revision: [`8c8ec0f2a6f6c9a0da15cd24f7b1298ab298368c`](https://github.com/Tejashmakwana/motionmaxxing/tree/8c8ec0f2a6f6c9a0da15cd24f7b1298ab298368c).
- Local checkout: `/Users/sub/.codex/.chatgpt-projects/g-p-6ac3af2be0548191b705572fdd51fbd9/work/design-toolkit/motionmaxxing`.
- Full Git clone, not shallow; both upstream commits are present. The local checkout is detached at the revision above to keep this reviewed snapshot fixed. Its tracked files remain unchanged and its working tree is clean.
- Toolkit catalog: `work/design-toolkit/README.md`, beside the upstream checkout and outside the portfolio deployment tree.

## What it contains

Motionmaxxing primarily directs and builds authored motion-graphics films: promotional pieces, feature demonstrations, brand moments, and kinetic typography. It combines a planning/review skill with a plain-HTML animation runtime and local export tools. It is not a website framework or a replacement for the current interactive homelab controller.

The useful areas are:

| Area | Retained material |
| --- | --- |
| Direction | `SKILL.md`; references for judgment, idea development, staging, layout, motion, typography, transitions, sound and review. |
| Runtime | `runtime/motion.js`: frame-authored GSAP timelines, named easing functions, keyframes, text/cursor/press/camera helpers, and seek-determinism checks. |
| Optional 3D | `runtime/hero3d/`: Three.js objects, materials, lights and camera state tied to the same film clock. |
| UI demonstrations | `runtime/native-ui/`: proportioned phone/notification builders for illustrative film scenes. |
| Production tools | Brand/reference capture, asset lookup, optional generated surfaces and ElevenLabs audio, deterministic Chrome/FFmpeg export, render inspection, linting, and comparison pages. |
| Calibration | Examples, original study images, upstream taste records, and `library/moments.jsonl` with 716 precedent entries plus one metadata row. These are retained references, not independent benchmarks. |

The runtime exposes a film timeline and seek function, so a chosen frame should be reproducible independently of playback history. That differs from this portfolio's live incident simulation, pointer interaction, random story selection and visitor-controlled state. Any later integration should be isolated and deliberate: a separate film/loop project, or selected motion principles adapted to the current controller after Sub chooses a direction.

## Website boundary

Upstream's restrictions on navigation-like chrome, fixed labels, progress bars, repeated layouts and typed headlines are **film-review heuristics**. They do not authorize removing this website's navigation, logo, footer, accessible controls, repair progress, terminal behavior, or requested typing capabilities panel. Likewise, keeping every film frame active is not a reason to defeat reduced motion, offscreen suspension, pause controls, or quiet periods on the website.

The upstream files refer to “this user” and include taste/verdict records. Those are the upstream author's project history, not Sub's preferences. Sub's instructions, existing content boundaries, and pending selections from the three recorded reference sites remain controlling. Importing this source does not select or apply a new visual direction.

## License and attribution retained

The complete upstream [LICENSE](https://github.com/Tejashmakwana/motionmaxxing/blob/8c8ec0f2a6f6c9a0da15cd24f7b1298ab298368c/LICENSE) and [NOTICE](https://github.com/Tejashmakwana/motionmaxxing/blob/8c8ec0f2a6f6c9a0da15cd24f7b1298ab298368c/NOTICE) remain unchanged in the clone. NOTICE identifies the original project work as Apache-2.0 and lists separate bundled component terms:

- GSAP 3.12.5 retains its embedded GreenSock Standard License notice in `runtime/vendor/gsap.min.js`; the checkout does not present that component as Apache-2.0.
- Three.js and its addons retain MIT and additional ported-code notices; `runtime/hero3d/vendor/three.LICENSE` is preserved.
- opentype.js and bundled contributions retain their MIT notices, including `runtime/hero3d/vendor/opentype.LICENSE`.
- Inter fonts retain SIL OFL 1.1 text at `runtime/fonts/OFL.txt` and `runtime/hero3d/fonts/OFL.txt`.
- Showcase brands remain their owners' property. None of the upstream demonstrations has been represented as Sub's work or deployed as portfolio content.

Any future reuse should carry the applicable notices with the copied component; this reference import preserves the entire upstream licensing context.

## Verification and limits

Reviewed README, SKILL, LICENSE, NOTICE, runtime API documentation, tool documentation, known limits, world/staging guidance, motion defaults, transition catalog headings, and conditional judgment guidance. Verified the pinned commit, non-shallow status, two-commit history, clean working tree, and presence of the named vendor/font notices. Source inspection is the verification performed here.

No installer, provider probe, rendering tool, browser script, API call to an audio/image provider, global skill link, dependency installation, or application integration was executed. The repository's examples and self-test have not been run locally.

Upstream documents an early release with incomplete visual lint coverage: text in images/canvas is invisible to the DOM lint, some gates require human visual judgment, and grain/blur can affect motion metrics. It also notes audio-provider timing problems, short-SFX normalization problems, capture limitations, and GPU/software-render differences. Its reported WebGL export throughput is not a measured live frame rate for this portfolio. These limitations should remain visible when a later film task uses the toolkit.
