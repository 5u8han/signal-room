# Interactive home office

The selected home-office study is now the homepage at [http://127.0.0.1:4320/](http://127.0.0.1:4320/). Source is pushed to the private [Signal Room repository](https://github.com/5u8han/signal-room) on `main` and `testing`; the local checkout uses `testing`. Nothing has been deployed to Cloudflare or the public domain. The latest polish uses a continuous glide, white theme-accented chair, richer screens and a separate Webamp Radio page; current browser verification is pending as recorded in QA.md.

## Room and character

The full-width front view contains a parts/repair bench on the left, four equipment rack banks, a central management ultrawide over a keyboard/mouse table with a printer underneath, and a gaming/workstation desk on the right. That desk depicts a Samsung-style 49-inch super-ultrawide, Lenovo Legion-style laptop, peripherals and a desktop PC. Cable loops and service slack give the room a home-lab character. The equipment artwork is informed by recognizable HPE, Dell PowerEdge, Supermicro and Cisco forms; it is not a verified inventory or exact engineering rendering of Sub's owned equipment.

Sub's character is an original stylized derivative of the supplied photo references. The transparent atlas contains twelve poses, including seated, walking, alert, console, carrying and repair states. Original portraits are not copied into the website, public asset directory or deployment package.

The public generated assets are:

| Asset | Purpose |
| --- | --- |
| `dist/assets/homelab/room-front.png` | Selected home office with the new workspaces and central table |
| `dist/assets/homelab/room-rear.png` | Matching reverse service view with rear connections and PSU bays |
| `dist/assets/homelab/sub-atlas.png` | Transparent twelve-pose stylized character sheet |
| `dist/assets/homelab/chair.png` | Separate gaming-chair prop |

Prompts, generation provenance and asset details are recorded in [research/HOMELAB-ARTWORK-V3.md](research/HOMELAB-ARTWORK-V3.md). The earlier environments and separate pixel-art test remain at [room-studies.html](http://127.0.0.1:4320/room-studies.html). Choosing this illustrated home office does not switch the rest of the site to pixel art.

## How to explore

- Touch or focus a machine to inspect its simulated status, activity and relevant repair stories.
- **Choose an incident** selects a story. During an existing story, accepted selections queue for later.
- **Auto incidents** lets the model choose from its story library. Turning it off leaves visitor-selected stories available.
- **Pause** freezes the room. Reduced-motion and the site's quiet setting are respected; **Next step** advances a repair without continuous animation.
- **Traffic** shows or hides flowing network paths. Device activity and management screens have independent state.
- **Sound** is off initially. Enabling it adds a restrained room sound and alert cues; it quiets with pause, motion settings and visibility.
- **Detail view** enlarges the room for inspection. Phones retain a whole-room overview and can pan the enlarged scene.
- **Console** opens the illustrated management feed and a small simulated command interface. It does not run system commands or connect to real machines.
- **Reset** returns the scene to healthy operation and releases temporary service lighting.

The parts bench, printer, character and console have small discoverable interactions. These include lightweight physical motion; they are separate from the main diagnosis and repair sequence.

## Ten repair stories

| Story | Behavior shown |
| --- | --- |
| Redundant PSU failure | Host remains online; rear service view exposes the failed module; redundancy is verified afterward |
| Storage drive failure | The affected member is located, replaced and rebuilt while the pool is degraded |
| Primary fiber link lost | Traffic fails over to coax and returns to fiber after verification |
| Cellular backup takes over | Both wired links are unavailable; essential traffic moves to cellular reserve |
| GPU host airflow alert | Work is reduced before cooling service; fan/temperature recovery is checked |
| Mains power interrupted | Ambient room lighting falls while UPS-backed equipment remains powered |
| Compute memory exhausted | Workloads drain, the affected HPE host stops, memory is added and the host returns |
| Storage capacity reached | Additional capacity is installed and verified without depicting a failed existing drive |
| Application stopped responding | Host hardware stays healthy while diagnosis and recovery happen through the console |
| Workstation spill | The affected desk equipment is isolated, an input device is replaced and recovery is checked |

Each story progresses through notice, travel to console, diagnosis, travel to the affected component, repair, verification and return. Story state drives device lights, service health, active WAN, console messages, character actions and room lighting. Ordinary stories cycle without immediate repetition; rear service is rarer automatically but can be selected for review.

## Lighting and themes

Dark, Light and Dusk change both site chrome and room atmosphere. The picker also follows the desktop theme; the saved Dusk value remains `evening` for compatibility. The fourth theme has not been chosen.

During a rare rear PSU service event, the entire room turns to expose the rear panels and the site applies a temporary Dark service-lighting override. `beginThemeOverride()` returns a release function. This does not overwrite the saved preference: if a visitor changes their choice during service, that current choice is restored after recovery. Reset, disposal and page exit release the override. The scene also releases it when it is no longer visible.

## Implementation and limits

| File | Responsibility |
| --- | --- |
| `dist/index.html`, `dist/homelab.css` | Homepage composition, responsive scene, controls and accessible dialogs |
| `dist/homelab.js` | Loading, interactions, animation lifecycle, sound, typing panel and theme coordination |
| `dist/homelab-model.js` | Pure time-stepped incident state, targeting, queue, service health and recovery |
| `dist/homelab-layout.js` | Authored front/rear equipment bounds and separate actor floor/reach coordinates |
| `dist/homelab-effects.js` | Drive rings, status/link lights, fans, network packets and live screen graphics |
| `dist/homelab-actor.js` | Sprite pose rendering, chair motion, service props and small physics interactions |
| `dist/theme.js` | Shared theme preference, circular reveal and temporary scene overrides |

The room uses generated image planes with CSS 3D transforms for its turn, plus transparent sprites and canvas effects. It is not fully modeled 3D geometry, a real hardware-management dashboard, or a live connection to Sub's infrastructure. The diagrams, lights and metrics are authored simulation states. The underlying portfolio analytics/dashboard are a separate application feature.

Animation stops when hidden or offscreen, and respects reduced motion. The desktop and phone inspection modes share one normalized world layout so controls and equipment stay aligned.

## Verification and remaining work

At this handoff, `npm run check` and all twenty automated tests have passed. Browser review has exercised desktop, a 390-pixel phone overview/detail view, HPE shutdown during upgrade, and rear PSU lighting with a saved-choice change and restoration. Final visual QA is still being completed; [QA.md](QA.md) is the source for precise final observations and limitations.

Content rewriting remains pending the project-story intake. Sub wants all abilities represented with equal respect; existing résumé-based page copy is provisional. See [research/CONTENT-INTAKE-V2.md](research/CONTENT-INTAKE-V2.md). Further refinement should use the owner's animation feedback, actual hardware/service details and eventual fourth-theme choice.


## November 6 correction: room coverage and display surfaces

The retained navigation-study routes now cover their actual landing field with an aspect-preserved room plane, eliminating the fitted top strip and blurred ambient duplicate. `glass-studies.js` derives `--glass-room-width` from the measured field size, aligns the pop-out canvas, and keeps the gaming desk visible. The phone field is a horizontally scrollable panorama; Whole room is an explicit overview mode. Normal pause/reduced-motion behavior and quiet repair stepping remain available.

Live monitor content is projected to the physical inner-glass quadrilaterals in `homelab-layout.js`. Cached perspective mapping in `homelab-effects.js` fits the center KVM and sloping ultrawide while retaining painted bezels and clipping behind the Legion/headphones. The neutral screen palette has restrained accent color, slight inner-edge falloff and a faint reflection. Projection updates use the existing20/30Hz screen cache cadence. Source-image replacements require remeasuring these surfaces; do not revert them to arbitrary rectangles or scale the image and emission canvas independently.
