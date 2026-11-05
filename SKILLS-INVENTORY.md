# Complete design and tool inventory

Reviewed November 4, 2026. This lists every named source and every retained SKILL.md file. The word “skill” is not used to pretend that a design reference, framework, runtime, external service and assistant instruction bundle are interchangeable.

## Counts

- 146 retained SKILL.md files, including mirror copies, host wrappers, internal maintenance and an empty template.
- 126 deduplicated guide/template entries; source paths are preserved in `dist/inventory.json`.
- 35 named source families and newly reviewed references.
- 67 TypeUI design/token samples, all selectable on About. They are token previews, not 67 completely implemented websites.

Status labels: **runtime** = actual browser engine or executed local media tool (FFmpeg is offline); **adapted** = original implementation applying design concepts; **sample** = interactive TypeUI token excerpt; **reference** = retained specialist/workflow material; **input** = requires missing source/access/runtime. Native guidance is not globally installed.

## Named sources

| Source | Status | Where / use |
| --- | --- | --- |
| [Flowframes](https://github.com/n00mkrad/flowframes) | adapted | Lab — Frame-by-frame inspection and explicit media states inform the Lab timeline; no interpolation or enhancement engine is run. |
| [UI/UX Pro Max](https://uupm.cc/) | adapted | Home, Work, Lab, About — Typography, palette, state and layout catalogs inform the shared visual system. Its seven public skill guides are listed below. |
| [Higgsfield](https://higgsfield.ai/) | adapted | Work — Image-led browsing, case inspection and a before/after composition comparison inform Work. No external generation endpoint is called. |
| [TypeUI](https://www.typeui.sh/) | adapted | Home, Work, About — Shared design specification and all 67 token samples in the live atlas. Samples show palettes/radii, not complete style implementations. |
| [Microsoft Fluent 2](https://fluent2.microsoft.design/) | adapted | Home, Work, Lab, About — Semantic roles, selection, focus, disabled and empty/error states are applied to navigation, controls and dialogs. |
| [Astro](https://astro.build/) | adapted | Home, Work, Lab, About — Static content first, with isolated browser interaction. Astro framework runtime is not installed. |
| [Skiper UI](https://skiper-ui.com/) | adapted | Home, Work — Expressive hover/entry and expanded visual-study patterns; original markup adds keyboard and preference handling. No paid components copied. |
| [beUI](https://beui.dev/) | adapted | Work, Lab — Expanded viewer, focus return and composable control patterns. Original native implementation; no React package installed. |
| [Svelte](https://svelte.dev/) | adapted | Work, Lab, About — Derived/filter state and explicit lifecycle cleanup. Implementation is native browser JavaScript, not Svelte compilation. |
| [Motion](https://motion.dev/) | runtime | Home, Work, Lab — The local Motion browser bundle runs on Home. Its lifecycle and reduced-motion concepts also inform Work and Lab; those pages are not claimed to run the Motion engine. |
| [Three.js](https://threejs.org/) | runtime | Lab — Local Three.js drives the isolated 3D experiment with explicit resource ownership. |
| [Anime.js](https://animejs.com/) | runtime | Lab — The expanded Experiment 003 uses the local Anime.js runtime and a single finite/seekable animation owner. |
| [GSAP](https://gsap.com/) | runtime | Home — Local GSAP drives a bounded Home title timeline and menu entrance. It does not drive the Lab kinetic study. Custom engine license is separate from MIT skill guidance. |
| [FFmpeg](https://ffmpeg.org/) | runtime | Lab — The installed FFmpeg binary creates an actual offline MP4 study for local playback. The binary is not bundled into this website. |
| [Remotion](https://www.remotion.dev/) | adapted | Lab — Frame-indexed, seekable composition and explicit asset readiness guide the motion studies. The React video renderer is not installed. Gap: Runtime/license eligibility and React render setup remain separate work. |
| [HyperFrames (HeyGen)](https://hyperframes.heygen.com/introduction) | adapted | Lab — HTML composition and deterministic seeking inform the Lab; the official local renderer is not provisioned. |
| [Manim Community](https://www.manim.community/) | adapted | Lab — Parametric mathematical form studies inform the sculpture experiment; Python Manim itself is not installed. |
| [shadcn/ui](https://ui.shadcn.com/) | adapted | Home, Work, Lab, About — Composable command/menu/dialog anatomy, native labels and consistent control states. Original HTML/CSS, no copied React registry. |
| [React Bits](https://reactbits.dev/) | adapted | Home, Lab — Kinetic type, pointer response and layered expressive composition are translated as original effects. No restricted collection code redistributed. |
| [Magic UI](https://magicui.design/) | adapted | Home, Work, Lab — Bento framing, small status indicators and bounded text/visual emphasis. No perpetual per-card particle engine. |
| [Whisper](https://github.com/openai/whisper) | input | Lab — Caption/transcript-first presentation is the design requirement for future narrated work; no transcription is simulated. Gap: Model weights and Python runtime are not provisioned; supply real audio for an actual transcription test. |
| [Tone.js](https://tonejs.github.io/) | runtime | Lab — A local Tone.js sound study starts only after the visitor explicitly asks to hear it; no autoplay audio. |
| [ElevenLabs](https://elevenlabs.io/) | input | Lab — Future optional narration lane with explicit voice/account permission and transcript display. No service request is simulated. Gap: Requires an account/API key and voice permissions. No key or paid request is used here. |
| [Anthropic skills](https://github.com/anthropics/skills) | adapted | Home, Work, Lab, About — Original expressive frontend, generative forms, theme choices, testing and portable handoff. All retained guides are listed below. |
| [Blender skill](https://www.blender.org/) | input | Lab — Future 3D scene asset preparation, outside the browser and outside VidStream. Gap: The user’s intended Blender skill repository was never identified. No substitute is presented as imported. |
| [Official GSAP skills](https://github.com/greensock/gsap-skills) | adapted | Home, Lab — Scoped timelines, property ownership and cancellation policies inform animation implementation; eight guides remain individually listed. |
| [Official Remotion skills](https://github.com/remotion-dev/skills) | adapted | Lab — Deterministic time, compositions, caption/media readiness and render boundaries inform Lab design. Individual guides are inventoried. Gap: Standalone skill repository grant remains unestablished; no raw guidance is redistributed. |
| [Elaya AI Design Skills](https://github.com/elayadesign/ai-design-skills) | adapted | Home, Work, Lab, About — Real content, typography, reusable foundations and complete states; Figma workflow is documented without pretending a connected design file exists. |
| [BentoGrids](https://bentogrids.com/) | adapted | Home, Work — Asymmetric modular compositions on Home and Work; original layout, not a copied gallery design. |
| [Codrops kinetic typography](https://github.com/codrops/OnScrollTypographyAnimations) | adapted | Home, Lab — Type as composition, staged reveal and bounded hover/scroll response. Original effects; the reference demo is not installed. |
| [Open Props](https://open-props.style/) | adapted | Home, Work, Lab, About — Consistent size/easing/color roles and selectively adopted CSS custom-property principles. No full stylesheet is imported. |
| [MDN modern CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Grid_layout/Subgrid) | adapted | Home, Work, Lab, About — Responsive grid, subgrid alignment and feature-detected view-transition vocabulary with ordinary navigation fallback. |
| [W3C WAI motion guidance](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html) | adapted | Home, Work, Lab, About — User control of nonessential movement, reduced motion, visible focus and reading-order preservation. |
| [CUBE CSS](https://cube.fyi/) | adapted | Home, Work, Lab, About — Shared composition foundations, small reusable roles, page-owned blocks and explicit responsive exceptions. |
| [The A11Y Project](https://www.a11yproject.com/checklist/) | adapted | Home, Work, Lab, About — Practical control, focus, reading-order and media checks inform prototype review; a checklist is not certification. |

## Elaya · design guides

| Guide | Status | Application / boundary |
| --- | --- | --- |
| figma-designer | input | Token/foundation concepts inform About; actual Figma operations require an intended file and the official connection. |
| landing-page-design | adapted | Guidance informs composition, foundations and interaction states; no installer/provider tool is run. |

## beUI · usage guides

| Guide | Status | Application / boundary |
| --- | --- | --- |
| beui | adapted | Guidance informs composition, foundations and interaction states; no installer/provider tool is run. |
| beui-pro | input | Public guide is retained; paid Pro component source is not acquired. |

## Motion · internal maintenance

| Guide | Status | Application / boundary |
| --- | --- | --- |
| fix | reference | Retained workflow reference; not an active runtime or blanket instruction. |
| improve | reference | Retained workflow reference; not an active runtime or blanket instruction. |

## TypeUI · foundations and adapters

| Guide | Status | Application / boundary |
| --- | --- | --- |
| typeui | reference | Host-specific context-distribution wrapper; not installed into an assistant. |
| typeui-fundamentals | adapted | Shared semantic foundations and a portable design specification. |

## TypeUI · 67 style guides

| Guide | Status | Application / boundary |
| --- | --- | --- |
| agentic | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| ant | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| artistic | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| basic | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| bento | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| bold | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| brutalism | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| cafe | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| claude | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| claymorphism | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| clean | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| codex | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| colorful | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| contemporary | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| corporate | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| cosmic | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| creative | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| dithered | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| doodle | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| dramatic | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| editorial | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| enterprise | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| expressive | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| fantasy | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| fiction | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| flat | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| friendly | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| futuristic | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| geometric | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| glassmorphism | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| gradient | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| immersive | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| impeccable | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| levels | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| lingo | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| material | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| matrix | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| minimal | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| modern | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| mono | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| neobrutalism | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| neon | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| neumorphism | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| pacman | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| paper | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| perspective | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| power | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| premium | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| professional | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| pulse | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| refined | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| retro | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| riso | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| roku | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| sega | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| shadcn | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| sketch | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| skeumorphism | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| sleek | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| spacious | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| square | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| stitch | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| storytelling | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| terracotta | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| tetris | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| vibrant | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |
| vintage | sample | Interactive palette/radius sample in the About token atlas; the entire style guideline is not claimed implemented. |

## UI/UX Pro Max · companion guides

| Guide | Status | Application / boundary |
| --- | --- | --- |
| banner-design | adapted | Cover/story hierarchy informs portfolio study cards; a separate presentation/banner exporter is not run. |
| brand | adapted | Guidance informs composition, foundations and interaction states; no installer/provider tool is run. |
| design | adapted | Guidance informs composition, foundations and interaction states; no installer/provider tool is run. |
| design-system | adapted | Guidance informs composition, foundations and interaction states; no installer/provider tool is run. |
| slides | adapted | Cover/story hierarchy informs portfolio study cards; a separate presentation/banner exporter is not run. |
| ui-styling | adapted | Guidance informs composition, foundations and interaction states; no installer/provider tool is run. |
| ui-ux-pro-max | adapted | Guidance informs composition, foundations and interaction states; no installer/provider tool is run. |

## Anthropic · public guides

| Guide | Status | Application / boundary |
| --- | --- | --- |
| academy-guide | reference | Retained specialist workflow, not a website effect. No API, Slack, MCP or internal communication is executed. |
| algorithmic-art | adapted | Original art, aesthetic choices, scoped interactions, testing discipline and portable documentation adapt the relevant guidance. |
| brand-guidelines | reference | Brand-system structure is a reference; Anthropic’s own colors/logo are not applied to the user’s portfolio. |
| canvas-design | adapted | Original art, aesthetic choices, scoped interactions, testing discipline and portable documentation adapt the relevant guidance. |
| claude-api | reference | Retained specialist workflow, not a website effect. No API, Slack, MCP or internal communication is executed. |
| discernment-nudge | reference | Retained assistant-response guidance, not a frontend effect or an invoked workflow in this web app. |
| frontend-design | adapted | Original art, aesthetic choices, scoped interactions, testing discipline and portable documentation adapt the relevant guidance. |
| internal-comms | reference | Retained specialist workflow, not a website effect. No API, Slack, MCP or internal communication is executed. |
| mcp-builder | reference | Retained specialist workflow, not a website effect. No API, Slack, MCP or internal communication is executed. |
| skill-creator | reference | Retained skill-authoring workflow. This web app does not create or activate an assistant skill. |
| slack-gif-creator | reference | Retained specialist workflow, not a website effect. No API, Slack, MCP or internal communication is executed. |
| theme-factory | adapted | Original art, aesthetic choices, scoped interactions, testing discipline and portable documentation adapt the relevant guidance. |
| web-artifacts-builder | adapted | Original art, aesthetic choices, scoped interactions, testing discipline and portable documentation adapt the relevant guidance. |
| webapp-testing | adapted | Original art, aesthetic choices, scoped interactions, testing discipline and portable documentation adapt the relevant guidance. |
| template-skill | reference | Empty upstream template, inventoried for completeness; not a finished skill. |

## GSAP · official guides

| Guide | Status | Application / boundary |
| --- | --- | --- |
| gsap-core | adapted | Relevant core, timing, lifecycle and performance concepts guide the bounded Home hero/menu animation. Actual engine use is recorded in the GSAP source entry. |
| gsap-frameworks | reference | Retained specialist guidance. React/framework adapters, plugins, ScrollTrigger and utilities are not invoked or installed by this prototype. |
| gsap-performance | adapted | Relevant core, timing, lifecycle and performance concepts guide the bounded Home hero/menu animation. Actual engine use is recorded in the GSAP source entry. |
| gsap-plugins | reference | Retained specialist guidance. React/framework adapters, plugins, ScrollTrigger and utilities are not invoked or installed by this prototype. |
| gsap-react | reference | Retained specialist guidance. React/framework adapters, plugins, ScrollTrigger and utilities are not invoked or installed by this prototype. |
| gsap-scrolltrigger | reference | Retained specialist guidance. React/framework adapters, plugins, ScrollTrigger and utilities are not invoked or installed by this prototype. |
| gsap-timeline | adapted | Relevant core, timing, lifecycle and performance concepts guide the bounded Home hero/menu animation. Actual engine use is recorded in the GSAP source entry. |
| gsap-utils | reference | Retained specialist guidance. React/framework adapters, plugins, ScrollTrigger and utilities are not invoked or installed by this prototype. |

## HyperFrames · public guides

| Guide | Status | Application / boundary |
| --- | --- | --- |
| figma | reference | Specialist rendering/integration guidance retained. No cloud/maps/provider, upgrade command or Figma workflow is activated. |
| hyperframes | reference | Seekable composition, asset-readiness and render boundaries inform the frame/timeline studies; this vendor’s renderer is not executed. |
| hyperframes-cli | reference | Specialist rendering/integration guidance retained. No cloud/maps/provider, upgrade command or Figma workflow is activated. |
| hyperframes-registry | reference | Specialist rendering/integration guidance retained. No cloud/maps/provider, upgrade command or Figma workflow is activated. |
| media-use | reference | Seekable composition, asset-readiness and render boundaries inform the frame/timeline studies; this vendor’s renderer is not executed. |
| remotion-to-hyperframes | reference | Seekable composition, asset-readiness and render boundaries inform the frame/timeline studies; this vendor’s renderer is not executed. |
| reverse-any-video | reference | Specialist rendering/integration guidance retained. No cloud/maps/provider, upgrade command or Figma workflow is activated. |
| slideshow | reference | Seekable composition, asset-readiness and render boundaries inform the frame/timeline studies; this vendor’s renderer is not executed. |

## Remotion · source guides

| Guide | Status | Application / boundary |
| --- | --- | --- |
| remotion-best-practices | reference | Seekable composition, asset-readiness and render boundaries inform the frame/timeline studies; this vendor’s renderer is not executed. |
| remotion-captions | reference | Seekable composition, asset-readiness and render boundaries inform the frame/timeline studies; this vendor’s renderer is not executed. |
| remotion-create | reference | Seekable composition, asset-readiness and render boundaries inform the frame/timeline studies; this vendor’s renderer is not executed. |
| remotion-docs | reference | Seekable composition, asset-readiness and render boundaries inform the frame/timeline studies; this vendor’s renderer is not executed. |
| remotion-interactivity | reference | Seekable composition, asset-readiness and render boundaries inform the frame/timeline studies; this vendor’s renderer is not executed. |
| remotion-license | reference | Specialist rendering/integration guidance retained. No cloud/maps/provider, upgrade command or Figma workflow is activated. |
| remotion-maps | reference | Specialist rendering/integration guidance retained. No cloud/maps/provider, upgrade command or Figma workflow is activated. |
| remotion-markup | reference | Seekable composition, asset-readiness and render boundaries inform the frame/timeline studies; this vendor’s renderer is not executed. |
| remotion-multimedia | reference | Seekable composition, asset-readiness and render boundaries inform the frame/timeline studies; this vendor’s renderer is not executed. |
| remotion-render | reference | Seekable composition, asset-readiness and render boundaries inform the frame/timeline studies; this vendor’s renderer is not executed. |
| remotion-saas | reference | Specialist rendering/integration guidance retained. No cloud/maps/provider, upgrade command or Figma workflow is activated. |
| remotion-studio | reference | Seekable composition, asset-readiness and render boundaries inform the frame/timeline studies; this vendor’s renderer is not executed. |
| remotion-upgrade | reference | Specialist rendering/integration guidance retained. No cloud/maps/provider, upgrade command or Figma workflow is activated. |

## What is still missing

- The exact intended Blender skill repository. Blender app documentation is not a substitute for that identity.
- Real personal biography, work, client permissions and contact details. The profile editor makes the demo placeholders explicit.
- A connected Figma file, ElevenLabs credentials/voice permissions, Whisper model/audio runtime and provisioned native/video render toolchains. These are not simulated.
- Paid Skiper/beUI/TypeUI/Motion components and unacquired/custom document skills. Public guides are not proof that premium code is present.
- Real cross-browser, screen-reader and performance measurements before a final portfolio is released.

## Expansion map

The four-page lab covers a typographic hero, desktop/mobile navigation, a project/bento collection, asides, dialogs, filtering, a motion sandbox, an editable profile, full inventory and footers. Additional test pages should add a distinct capability, not repeat existing effects: 3D scenes, a real showreel-render workflow, a narrated/captioned case study, Figma token synchronization, long-form case studies, a dedicated typography atlas, and a contact/availability flow once real details are supplied.

New references and their acquisition limits are in `research/new-design-references.md`. The earlier library remains at `/Users/sub/Documents/ChatGPT/Design-Training`.
