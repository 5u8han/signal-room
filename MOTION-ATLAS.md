# Motion Atlas — 20 studies at every scale

Open the [local index](http://127.0.0.1:4320/atlas.html). The project now has **33 pages**: the new portfolio, landing concepts and operator workspace; the retained experiments; and 20 standalone art studies. These are original art and interaction experiments for Sub's later portfolio, with deliberately different compositions and palettes. The existing #003 sculpture and source inventory remain intact.

The index offers text search, six family filters, a random-study link and browser-local saved keepers. Its previews are static SVG compositions; opening the index does not run 20 animation engines. Each study has its own page, previous/next links and a route back to the index.

| # / study | Illustration and scale | Controls to try |
| --- | --- | --- |
| [01 / Event Horizon](http://127.0.0.1:4320/atlas/01-event-horizon.html) | Gold accretion field; distant point becomes an encompassing ring | Scroll into the field; pointer perspective; field-strength slider |
| [02 / Signal Garden](http://127.0.0.1:4320/atlas/02-signal-garden.html) | Botanical signal diagram; layered growth and fine structure | Unfurl again; petal count; pointer and scroll |
| [03 / Depth Charge](http://127.0.0.1:4320/atlas/03-depth-charge.html) | Cobalt/lime portals exchange foreground and background | Scroll through depth; twist slider; pointer perspective |
| [04 / Infinite Architecture](http://127.0.0.1:4320/atlas/04-infinite-architecture.html) | Actual Three.js corridor through a vermilion world | Scroll camera travel; pointer look; architectural drift |
| [05 / Chromatic Current](http://127.0.0.1:4320/atlas/05-chromatic-current.html) | Colored procedural currents with persistent trails | Pointer disturbance; density; reverse current; new seed |
| [06 / Type Force](http://127.0.0.1:4320/atlas/06-type-force.html) | Editable letters react as a weighted spring composition | Change the word; force slider; apply impulse; pointer |
| [07 / Liquid Letter](http://127.0.0.1:4320/atlas/07-liquid-letter.html) | Distorted type seen through a rippling mask | Edit text; viscosity control; make a ripple; pointer |
| [08 / Word Weather](http://127.0.0.1:4320/atlas/08-word-weather.html) | Your words drift and gather through an illustrated atmosphere | Edit the word list; wind; hold to gather; generate another forecast |
| [09 / Elastic Editorial](http://127.0.0.1:4320/atlas/09-elastic-editorial.html) | Oversized typography stretches across four scroll chapters | Scroll; chapter jump buttons; read it again |
| [10 / Palimpsest](http://127.0.0.1:4320/atlas/10-palimpsest.html) | Letter traces accumulate, fade and become a new surface | Edit text; pointer drawing; memory; keep traces; clear |
| [11 / Gravity Room](http://127.0.0.1:4320/atlas/11-gravity-room.html) | 28 warm-colored bodies collide in a cream room | Drag a sphere; gravity; fling the room |
| [12 / Spring Choir](http://127.0.0.1:4320/atlas/12-spring-choir.html) | Pink/coral connected lattice carries local gestures across its surface | Pointer deformation; tension; damping; pluck all strings |
| [13 / Soft Machinery](http://127.0.0.1:4320/atlas/13-soft-machinery.html) | Ochre shaded cloth hangs in a burgundy space | Drag the fabric; wind; release or repin the right tether |
| [14 / Magnetic Field](http://127.0.0.1:4320/atlas/14-magnetic-field.html) | Pearlescent trails reveal an invisible two-pole field | Drag the bright pole; field strength; reverse polarity |
| [15 / Orbital Assembly](http://127.0.0.1:4320/atlas/15-orbital-assembly.html) | An indigo/lime toy universe across three scale chapters | Follow a body; scale; time; impulse; pointer selection; scroll |
| [16 / Small Giants](http://127.0.0.1:4320/atlas/16-small-giants.html) | A cabinet of amplified micro-interactions and a reactive field | Spring press; color switch; magnetic button; angle dial; pointer |
| [17 / Continuum](http://127.0.0.1:4320/atlas/17-continuum.html) | One sculpture transforms across five page locations | Scroll; native chapter links; begin again |
| [18 / Ghost in the Grid](http://127.0.0.1:4320/atlas/18-ghost-in-the-grid.html) | Actual card geometry and enter/exit transitions respond to content | Filter; reverse; add forms; inspect; rename to change layout |
| [19 / Light Matter](http://127.0.0.1:4320/atlas/19-light-matter.html) | Cut-paper layers, shadows and a moving sun | Pointer perspective; scroll closer; depth; warmth; change the light |
| [20 / Quiet Storm](http://127.0.0.1:4320/atlas/20-quiet-storm.html) | A particle cloud gathers into your text, dissolves and changes scale | Edit your signal; distance; hold/release the word; pointer; scroll |

## Theme and film additions

All 20 studies now share the Dark, Light and Evening picker, plus Follow desktop. Each also has two looping original tech-film sections after its art. The four portfolio pages and index distribute those films around their content. [THEMES-AND-REELS.md](THEMES-AND-REELS.md) explains the theme reveal, media controls and original test footage.

The artwork clock now suspends while the added film sections are being viewed. Long-form scene progress measures its own art section, keeping the previous scroll choreography independent of the extra page length.

## Motion and interaction

The shared header supplies Pause/Play, and the footer supplies Reset and navigation. Export appears only when that study implements it; outputs are browser-downloaded PNG or SVG stills, not recordings of the whole interactive page. Study-specific buttons, text fields, ranges and chapter links use native controls. Those controls provide meaningful keyboard actions; freeform drawing and dragging remain pointer gestures.

Motion begins automatically when allowed, with an immediate drawn state rather than an enable gate. The browser-local atlas motion preference falls back to the portfolio's existing preference on first use. The operating system's reduced-motion preference takes priority: the header reads “Still” and Play cannot override it. Pausing stops the shared animation clock while controls can still request a static redraw. Reduced-motion behavior is intended to retain an understandable composition rather than an empty canvas.

The shared loop suspends when the browser tab is hidden, clamps frame steps to 33 ms and disposes registered resources on page exit. Canvas resolution is capped at 1.5 device pixels per CSS pixel by default. Individual studies add bounded particle/body counts and scene-specific visibility handling. These are implementation measures, not a measured performance guarantee; see [QA.md](QA.md) for the checks actually completed.

## What these studies implement

Most scenes use local Canvas, SVG, CSS and Web Animations; Infinite Architecture uses the retained local Three.js module with a fallback illustration. No new cloud service or provider account is needed. The source collection remains a research library with explicit runtime/adapted/reference statuses; this expansion does not claim that every collected framework has been installed.

Collision, springs, Verlet cloth and softened orbital forces are interactive **toy physics**. Magnetic fields, gravity/lensing labels and distances are visual metaphors rather than calibrated measurements or scientific predictions. Fluid-like currents and rippling letters are procedural flow/displacement effects; there is no fluid solver. “Content-aware” means the supplied text, text length, selected forms and measured layout change the result. “User-aware” means direct pointer, scroll and control input; there is no AI inference, camera/microphone use, behavioral profiling or user surveillance.

The scenes are a comparison library for choosing a later portfolio's visual language. They are not 20 polished case studies or evidence of employer projects. Keep the résumé and grounded professional history in [PORTFOLIO-HANDOFF.md](PORTFOLIO-HANDOFF.md) separate from the fictional art captions.

## Continue development

- Index: `dist/atlas.html`, `dist/atlas-index.js`, `dist/atlas-index.css`.
- Catalog and shared lifecycle: `dist/atlas/catalog.js`, `dist/atlas/core.js`, `dist/atlas/core.css`.
- Each standalone study: its numbered `.html`, `.css` and `.js` files under `dist/atlas/`.
- Validation: [QA.md](QA.md); captured views: `screenshots/atlas/`.

Use the explained start/check commands in [README.md](README.md). Preserve pause, reduced motion, hidden-tab suspension, reset and cleanup when reusing a treatment. If adding a 21st study, also review the current 20-item navigation assumptions and checker expectations.
