# Signal Room / 5u8han.dev

The source for Sub's interactive homepage and portfolio. Repository: https://github.com/5u8han/signal-room (private). Development continues on `testing`; `main` retains a verified baseline. Cloudflare deployment is configured separately and does not happen when pushing this repository.

Checks run locally with `npm run check`, `npm test` and `npm run cf:check`. An inactive Actions example lives in `.github/workflow-examples/check.yml`; the connected GitHub OAuth credential does not have the workflow scope needed to publish an active Actions workflow.

A new, experimental portfolio built around support engineering, datacenter work, networks and hands-on hardware. The former Nightfall site supplies content references only; none of its design is retained. This checkout is separate from the GitHub profile repository and the original VidStream design lab.

## Open the local preview

- [Interactive home office](http://127.0.0.1:4320/)
- [Corrected Canopy room](http://127.0.0.1:4320/glass-01.html)
- [Earlier navigation comparisons](http://127.0.0.1:4320/glass-studies.html)
- [Local reference recordings / chapters](http://127.0.0.1:4321/)
- [After Hours Radio / Webamp](http://127.0.0.1:4320/music.html)
- [Room studies / four settings and pixel-art test](http://127.0.0.1:4320/room-studies.html)
- [Earlier cinematic landing](http://127.0.0.1:4320/concept-cinematic.html)
- [Compare three landing directions](http://127.0.0.1:4320/concepts.html)
- [Pixel service room](http://127.0.0.1:4320/concept-pixel.html)
- [Diagnostic floor plan](http://127.0.0.1:4320/concept-blueprint.html)
- [Work / all nine entries](http://127.0.0.1:4320/work.html)
- [Career history](http://127.0.0.1:4320/about.html)
- [Motion Atlas / 20 studies](http://127.0.0.1:4320/atlas.html)
- [Operator dashboard / recorded local data](http://127.0.0.1:4320/dashboard.html)
- [Operator dashboard / synthetic demonstration](http://127.0.0.1:4320/dashboard.html?demo=1)

The preview runs only on 127.0.0.1:4320. It has a real local SQLite database. Local dashboard access is intentionally available to the machine's loopback visitor. This is not the production authentication configuration.

## What is built

The four navigation studies remain archived for comparison; Sub rejected all four menus and described Canopy as the closest. The current correction makes the real room cover the landing field, removes the empty strip and broad Light/Dusk glow layers, and gives both monitors measured perspective surfaces with laptop/headphone occlusion. The existing menu arrangements have only been quieted while the next direction awaits Sub's choices. The desktop fields retain 80–84svh; phones show a full-height swipeable room with a Whole room overview. Regenerate the four scene routes from the baseline with `node scripts/create-glass-studies.mjs`.

The three requested reference pages have local browser recordings with chapter controls at the review link above. Video files and raw captures stay in ignored local folders outside deployment. `node scripts/assemble-reference-recordings.mjs` assembles available local captures; `node scripts/serve-reference-recordings.mjs` serves the player on 127.0.0.1:4321. See [reference observations](research/REFERENCE-SITES-NOTES.md).

[Motionmaxxing](research/MOTIONMAXXING.md) is imported into the separate design toolkit at pinned revision `8c8ec0f`. Its source, skill, runtime, examples and license context are retained for later film work. The public source inventory marks it as a reference, rather than a running integration.

The current polish pass replaces the four-frame walk with a continuous glide, targets display-paced rendering around 60 fps, keeps the white theme-trimmed chair visible around Sub, and uses cached lights and screen graphics. Theme selection is click-only. The center display shows a btop-inspired view and meaningful incident commands; the gaming monitor combines a driving scene with build/service panes. The floor fades into the page and **Say hello** briefly moves the character beyond the room boundary on desktop. Webamp runs separately with an original local synth loop; see `MUSIC.md`. Live browser review verified the chair, room boundary effect, theme selection/restoration, phone layouts and actual Radio playback. This browser reported approximately 50 fps; 60 fps remains a target. See `QA.md` for evidence and limits.

The homepage is now the selected home-office setting: a full-width illustrated room with a parts bench, four equipment racks, a central KVM table and printer, and a gaming/workstation desk with a 49-inch super-ultrawide and Legion laptop. A stylized character based on Sub's supplied references sits at the desk, responds to alerts, diagnoses the exact fault, services the affected equipment, verifies recovery and returns. Ten incident stories cover physical failure, capacity upgrades, application recovery, WAN failover and protected power. Machines can be inspected, stories can be selected or queued, and the room includes small physics interactions and Easter eggs.

The scene combines generated image planes, transparent character sprites and live canvas activity. The rear-service turn uses CSS 3D transforms; it is not a fully modeled 3D room. Indicators, management screens and traffic are simulated illustration, not live infrastructure telemetry. The public artwork under `dist/assets/homelab/` consists of generated derivatives; original personal portraits are excluded from the public site. See [HOMELAB.md](HOMELAB.md) for controls, implementation and limits, and [the artwork record](research/HOMELAB-ARTWORK-V3.md) for prompts/provenance.

The earlier three animated concepts and five still room studies remain available for comparison. The original 20 motion studies, #003 sculpture, palette workbench and local engine experiments are retained. Animation stops when hidden/offscreen and respects reduced motion; quiet mode offers a Next step control for following a repair without continuous movement.

All routes share Dark, Light and Dusk themes, desktop-theme following, a click/keyboard picker and a click-origin circle reveal. Dusk retains the existing `evening` storage value for compatibility. The home-office lighting follows those choices. A rare rear PSU repair temporarily applies service lighting across the site, then restores the visitor's current preference without changing its saved value. A fourth theme is still undecided. Two 12-second original rack/technician films replace the earlier unrelated technology adverts. They are silent, illustrated test media—not footage of client equipment.

Public content contains eight career roles and nine work/practice entries. The five roles after Endeavour Health are labeled Contract. Chicago Lab is described as an initial full-time build followed by ongoing on-call/project support. Phone/ZIP and hire/contact-me prompts are removed. Email, GitHub, LinkedIn and Twitter remain; no Steam profile URL was invented. Credentials/education remain unpublished until current wording is confirmed.

The dashboard has Overview, Content, Campaigns and Inbox views, real date-range queries, CSV export, a local UTM-link builder and message-status updates. Demo figures are explicitly separate and are never inserted into recorded-event tables. Campaign conversions currently mean case opens and résumé download requests, not employment outcomes or sales. Nothing sends marketing mail or replies automatically.

## Content workflow

Use Git-managed Markdown for case narratives and the structured `dist/profile-data.json` for career records, links and summaries. `content/` contains editable editorial records; the rendered work/career pages currently read the JSON. Keep both in sync when editing facts. A browser CMS is not needed for the agreed workflow where the assistant maintains content.

The current copy is provisional. Sub wants the full breadth of their abilities represented with equal respect for every kind of work. The next rewrite needs concrete project and troubleshooting stories from [research/CONTENT-INTAKE-V2.md](research/CONTENT-INTAKE-V2.md), rather than more résumé-duty summaries or a narrowed job-title pitch.

## Run and verify

This command starts only the local site/API at port 4320 and creates/opens `.local/portfolio.sqlite` for preview events and correspondence. It does not change Cloudflare, the live domain, VidStream media/configuration or Docker data. Existing local records are retained. If the background preview is already running, use it instead of starting a second copy; Control+C stops a foreground preview without deleting records.

```sh
npm run dev
```

This command reads source/asset metadata and checks JavaScript syntax, HTML links, profile completeness and public-content restrictions. It does not publish or alter records.

```sh
npm run check
```

This command runs isolated, in-memory SQLite API tests for validation, deduplication, analytics queries, correspondence, auth denial, rate limits and retention, plus pure homelab-model tests for incident targeting, progression, power states, recovery, pause/queue behavior and cellular failover. It does not modify the local preview database or Cloudflare.

```sh
npm test
```

This command compiles the actual Cloudflare Worker in dry-run mode and validates its asset/configuration package. It writes only ignored local build/log files; it does not deploy or create Cloudflare resources.

```sh
npm run cf:check
```

The renderer creates/replaces only the named authored datacenter MP4/JPG/manifest assets in this project's `dist/assets/`. Existing outputs are preserved unless its explicit replacement option is supplied. It reads local fonts and uses the existing Pillow/FFmpeg; it does not download footage or modify other media.

```sh
python3 render-datacenter-films.py
```

## Database, tracking and production boundary

`worker/` uses Cloudflare Workers, prepared D1 statements and verified Cloudflare Access JWTs for both dashboard HTML and admin APIs. `migrations/0001_initial.sql` defines events, inquiries and short-lived hashed rate-limit keys. The same API runs against SQLite in the loopback preview. Optional audience analytics require the visitor's choice and respect browser privacy signals. Events store anonymous session IDs and allowlisted interaction fields, not raw IP addresses or message contents. Traffic days are UTC; operator message/time displays use Chicago. Analytics events expire after 90 days; correspondence is retained until an owner decides its disposition. Archiving a note changes its status, not its storage lifetime.

Production deployment is **not completed**. Cloudflare CLI authentication is expired. `wrangler.jsonc` deliberately contains no invented D1 database ID, Access audience or account identity. Unconfigured production dashboard routes deny access; tracking and correspondence stay disabled until bindings/secrets are configured. The production message endpoint requires Turnstile. Configure an owner-only Access application before deployment; forwarding email addresses alone do not authenticate dashboard access.

See [HOMELAB.md](HOMELAB.md), [CLOUDFLARE-SETUP.md](CLOUDFLARE-SETUP.md), [QA.md](QA.md), [PORTFOLIO-HANDOFF.md](PORTFOLIO-HANDOFF.md) and [research/CONTENT-DECISIONS.md](research/CONTENT-DECISIONS.md). Secrets, `.local/`, `.wrangler/` and `node_modules/` are ignored by Git. The project is pushed to the private Signal Room repository on `main` and `testing`. No changes have been published to 5u8han.dev.
