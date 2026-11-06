# Portfolio Studio handoff — November 6, 2026

## Latest correction and pending reference choices

Sub rejected the four glass menu designs. Canopy was the closest, but **no final navigation direction is approved**. The next design pass must wait for Sub's cherry-picks from Delta Cafés, Roveia and Atmos Gallery / About. Do not restore the earlier Split Signal recommendation as a user choice.

The existing studies now use a genuinely covering live room plane with the source aspect ratio preserved and the camera biased to keep the gaming desk visible. The header is part of the scene markup and floats over real room pixels; the fitted-plane gap, blurred clone backdrop, broad pale/pink logo/floor veils and large glass highlights were removed. Both live displays use measured perspective mapping, retained bezels and foreground occlusion. Phones default to a full-height swipeable panorama with actor following; Whole room switches to a short full-room overview. The portrait character and incident model remain intact. `QA.md` and `screenshots/corrected-canopy-*.jpg` record proof.

Three actual, silent browser recordings of the provided pages are available at http://127.0.0.1:4321/ with chapter controls and source links. Final durations are about 23s / 46s / 44s. They stay local under ignored `research/recordings/`, with raw frames/manifests in `.local/reference-capture/`; neither is part of public deployment. Server: `node scripts/serve-reference-recordings.mjs`. Research: `research/REFERENCE-SITES-NOTES.md`. The recording viewer was checked for playback/seek and only one active recording at a time.

Motionmaxxing was fully cloned, pinned clean at `8c8ec0f2a6f6c9a0da15cd24f7b1298ab298368c`, and reviewed in sibling `work/design-toolkit/motionmaxxing`. See `research/MOTIONMAXXING.md` and `work/design-toolkit/README.md`. Its Apache-2.0 project and bundled component notices are preserved. The toolkit remains staged; no installer, renderer, provider or global registration ran. The source inventory adds its source and skill as references. Film heuristics never override this interactive site's controls or Sub's preferences.

## Current review: four liquid-glass landings

The latest request is a design comparison, awaiting Sub's choice. Open `http://127.0.0.1:4320/glass-studies.html` for screenshots and links. Four full working room pages put the navigation inside the animation and the main identity below it: Canopy (`glass-01.html`, broad top ribbon, 82svh), Split Signal (`glass-02.html`, separated islands, 84svh), Glass Spine (`glass-03.html`, left rail, 83svh), and Command Dock (`glass-04.html`, upper-right two-row navigator, 80svh). Phone framing uses about 84svh with an 85svh cap on short displays. The existing generated room/character media is reused, with ambient extension and a fitted room plane. This was an initial comparison. Sub later rejected all four menus and named Canopy as the closest; no final selection is approved.

The user-supplied liquid-glass reference and primary design/implementation sources are retained in `research/LIQUID-GLASS.md`. `glass-studies.js` moves the existing header nodes and preserves their listeners; `glass-studies.css` owns the four compositions, glass material, identity contrast, theme/blackout states and responsive layouts. `scripts/create-glass-studies.mjs` regenerates scene HTML from the baseline. `common.js` now honors `data-tech-reels="off"` for the comparison hub only. The baseline homepage adds a link to the studies; the new design has not been rolled out across the site. No factual content rewrite was attempted.

Live browser review covered all four desktop/phone routes, theme/menu/search controls, equipment inspection, aligned greeting pop-out and rear PSU service/theme restoration. `QA.md` records exact measurements and limitations. Forty pages/467 local links, all 20 tests and the 183-asset Cloudflare dry-run pass. Local development remains on `testing`; no public Cloudflare deployment occurred.

## Latest polish and repository

User authorized a new homepage repository: private `5u8han/signal-room`. Local changes now target smooth display-paced (~60 fps) rendering rather than the old 30 fps cap. The exaggerated walk frames were replaced by an eased continuous glide retaining the generated likeness. The generated white chair has visible foreground armrest layering and cached theme-colored piping. Theme selection is click-only. The entire room gets accent lighting while hardware warning/health semantics remain distinct. The center screen uses btop-inspired resource panes and realistic diagnostic commands, while the gaming display combines a moving driving scene and build/service panes. The floor bleeds into the page and desktop **Say hello** can cross the room boundary.

The separate `music.html` page self-hosts Webamp 2.3.1 and an original 48-second synth track, with an explicit Play button and optional remembered automatic-play request. No commercial songs or streaming account are used. See `MUSIC.md`.

GitHub rejected the initial push because the connected OAuth credential lacks workflow scope. The check workflow was retained as an inactive example under `.github/workflow-examples/`; it is not an active CI run. No account permissions were expanded.

The subsequent application push succeeded and was verified through the GitHub API. Both `main` and `testing` exist in the private repository; local development remains on `testing`. The working tree was clean after the push. Local preview process was relaunched with MP3 MIME/range support, verified by actual HTTP requests.

Code checks, all 20 tests, Cloudflare dry-run and native canvas renders are passing. Browser control is now restored. Current live review verified white chair layering, palette changes, diagnostic/game panes, the floor blend and character pop-out, phone overview/detail layouts, simulated console output, actual Webamp playback/pause/close/reopen, and blocked-autoplay feedback/retry. A theme focus race and misleading optimistic playback status were fixed during this review. The browser reported about 50 fps in desktop samples; do not claim measured 60 fps or a broad performance benchmark. See `QA.md` and `screenshots/browser-*.jpg` for exact coverage. Current review fixes are on `testing`; `main` retains the initial application baseline until promoted.

## Current build — supersedes the still-study handoff

Sub selected room study 01, the illustrated home office. The homepage at `http://127.0.0.1:4320/` is now a working full-width interactive scene: parts and repair accessories on the left, four rack banks with less uniform home wiring, a central management/KVM table and printer, and a gaming desk with a 49-inch super-ultrawide and Legion laptop on the right. Logo, draft mission statement and a typing capabilities panel overlay the upper wall. The scene is the current review priority; substantive portfolio content rewriting follows the story intake.

Personal references have now been supplied and used to generate a stylized twelve-pose character atlas. Four generated public derivatives live under `dist/assets/homelab/`: the front room, rear room, character atlas and chair. Original portrait files are excluded from public assets and deployment. Generation prompts/provenance are in `research/HOMELAB-ARTWORK-V3.md`. The scene uses image planes, transparent sprites, live canvas activity and a CSS 3D front/rear turn; it is not a fully modeled 3D room or live infrastructure telemetry. See `HOMELAB.md` for the complete implementation, controls and limitations.

Ten state-driven incidents cover redundant PSU failure, drive failure, fiber failover, cellular reserve, cooling, mains/UPS, memory upgrade, storage expansion, application recovery and a workstation spill. The character diagnoses and services the relevant target, verifies recovery and returns to the gaming desk. Inspection, scenario selection/queue, traffic, pause/quiet stepping, opt-in sound, detail/pan view, console, reset, physical interactions and small Easter eggs are available. Light, Dark and Dusk affect the room and chrome; a fourth theme is undecided. A rare rear PSU service temporarily changes the site lighting and restores the visitor's current saved/desktop choice afterward without overwriting it.

The three earlier animated concepts remain at `/concepts.html` and their individual routes. The four still environments and pixel-art test remain at `/room-studies.html` for comparison. The rest of the site has not been switched to pixel art.

Sub wants all abilities represented and explicitly rejects ranking one category of work above another. Do not resume a narrowed target-role questionnaire. New factual/story intake is in `research/CONTENT-INTAKE-V2.md`; official hardware panels and maintenance staging are in `research/HARDWARE-REFERENCE-V2.md`. The earlier still-study prompts are in `research/ROOM-STUDY-PROMPTS.md`; current animation assets are documented separately in `research/HOMELAB-ARTWORK-V3.md`.

`npm run check` and all twenty automated tests have passed. Earlier browser review exercised desktop and 390-pixel phone overview/detail layouts, HPE shutdown during upgrade, and rare PSU service lighting while preserving/changing/restoring the selected theme. Use the latest QA section for the exact verification limit of the newer polish. The loopback preview remains available. No Cloudflare public deployment or domain change occurred; source is now pushed to Signal Room.

Current root is this `portfolio-studio` checkout, on `testing` with origin `https://github.com/5u8han/signal-room.git`. It is separate from `../5u8han`, which is the supplied GitHub profile repository and has not been changed. The old VidStream design lab is preserved separately. Synced project `sources/` remain read-only.

## Agreed direction

- Rebuild completely; preserve none of Nightfall's design.
- Identity: Sub / 5u8han.dev. Goal: get noticed through work, history and capability, creating hiring interest without hire/contact solicitation prompts.
- Equally experimental throughout, with professional clarity and factual content. Retain all 20 art studies, #003, typography/palette/physics experiments, three themes and films.
- Opening: the selected full-width home office, with Sub's stylized character working/gaming on the right and responding to state-driven console/equipment incidents. The original three concepts are retained references, not pending primary-hero candidates.
- All employment after Endeavour Health/Northshore is Contract. Chicago Lab started full-time, then became on-call/project work for troubleshooting, patches, upgrades and changes. Preserve the supplied overlapping dates.
- Remove phone/ZIP. Use info@5u8han.dev; other supplied domain aliases forward to the same inbox. Keep verified GitHub/LinkedIn/Twitter links. Steam URL is still unknown.
- Generate original datacenter footage. New 12-second movies replace the copied unrelated test adverts.
- Add actual analytics, database and operator dashboard; host on the owner's Cloudflare Workers/Pages. No live account resources changed yet. CLI session is expired, so actual connection/deployment is pending.
- No deadline supplied. Budget wording was ambiguous; use free-tier-first assumptions until clarified.

## Implementation and review

`dist/` contains 34 pages, including the new interactive home-office homepage, three earlier hero variants, comparison and still-study pages, all original motion studies, nine work entries, a career page, résumé text export and operator dashboard. `content/` supplies Markdown editorial records; `dist/profile-data.json` supplies structured facts. Credential/degree claims are withheld pending confirmation.

Node preview / selected home office: `http://127.0.0.1:4320/`. Earlier comparison: `/concepts.html`; room/pixel studies: `/room-studies.html`. Dashboard recorded local data: `/dashboard.html`; labeled synthetic data: `/dashboard.html?demo=1`. A background Node process serves this and persists `.local/portfolio.sqlite`. The original design lab remains at 4318.

`worker/` is the real Cloudflare API implementation; `worker/local-db.js` is a Node-only D1-shaped SQLite adapter. Production Worker auth requires verified Access JWTs and fails closed. Public analytics/correspondence use strict validation, prepared SQL, same-origin writes and rate limits. Production correspondence requires Turnstile. No email is sent from form/dashboard actions. The user can write/read/archive notes locally through a real database, not browser-only mock state.

Earlier browser checks exercised the original three worlds, desktop and phone layouts, all nine cases and career content, the theme reveal, form persistence to Inbox and message status updates. New home-office coverage is summarized above and recorded precisely in `QA.md`. The earlier Worker dry-run compiled; a local workerd run verified public homepage 200 and unauthenticated dashboard/API 401. No production D1/Access success-path test has occurred because the account isn't connected.

## Next decisions

1. Review the working home-office animation and refine its art, character positioning, incident behavior and interaction detail. Gather actual equipment/service specifics and choose the fourth theme when ready; the primary setting is already selected.
2. Renew Cloudflare sign-in and identify the actual account/project, D1 target and Access audience. Do not invent identifiers or request tokens in chat.
3. Complete the project-story intake and rewrite the current provisional content. Confirm credentials/education wording and any missing Steam profile link; do not manufacture outcomes, a graduation or current certification status.
4. Confirm free-tier-first versus paid hosting limits, and the GitHub destination for this new app (the supplied 5u8han/5u8han repository is a profile README repo).

Commands and their effects are explained in README.md. Platform setup is in CLOUDFLARE-SETUP.md. Keep the dashboard private; preserve quiet/reduced motion and stop scene/video work when hidden. Production figures must never be replaced with unlabeled demo metrics.
