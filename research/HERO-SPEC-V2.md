# Homepage homelab hero — revised brief

## Implemented follow-up — selected home office

Sub selected study 01 and supplied two likeness references. The current homepage implements the chosen home office with a right-side Samsung-style 49-inch gaming ultrawide, Legion-style laptop and accessories; a left-side RAM/drive/cable parts bench; central keyboard/mouse table and printer; looser cable routing; and theme-responsive evening room lighting. Generated stylized Sub sprites provide seated, walking, console and service poses. Original photographs are excluded from public assets. The logo, draft mission line and typing capability panel sit above the interactive room. Ten simulated repair stories, front/rear service views, physical activity lights, traffic, bounded physics and Easter eggs are implemented. See `HOMELAB.md`, `research/HOMELAB-ARTWORK-V3.md` and the newest QA section for the exact scope. The fourth theme is still undecided and has not been invented.

Recorded 2026-11-05; updated with Sub's follow-up decisions. This supersedes the isometric framing of the current After Hours concept. The broad direction below is approved; generated room studies are awaiting selection and are not finished animation assets.

## Follow-up decisions from Sub

- Use the recommended detailed illustrated 2.5D treatment. Also create a separate pixel-art test; Sub is a fan of pixel art and may choose to adapt the entire site to it after review. Do not switch the whole site before that selection.
- The character should resemble Sub through cartoon/pixel/stylized animation. Personal photos are reference material only: never ship original portraits in public assets, source maps, public repositories or deploy packages. No new personal reference photographs were attached to the follow-up as received; character design is pending those inputs.
- The foreground stance means addressing the viewer with the technology behind, as in an anonymous video presenter. No phone or literal selfie-taking is required.
- Home office is the default setting; also produce basement workshop, garage and dedicated server-room examples for comparison.
- Equipment should be realistically based on HPE, Dell PowerEdge, Supermicro and Cisco, with NUCs, desktops and ASICs. Exact owned models/counts remain to be supplied. Manufacturer examples in concept art are representative, not verified ownership claims. Clarify whether ASIC means mining equipment, another accelerator, or both.
- Connectivity priority is fiber first, coax second, then the backup link. Sub called this satellite and gave an AT&T cellular hotspot as the example. Working interpretation: cellular tertiary; ask whether satellite is also wanted rather than conflating these technologies.
- Use a physical ultrawide management display. Recommended complement: smaller KVM/serial terminal, so the on-screen story can distinguish dashboard triage from console access. This recommendation has not been separately selected yet.
- Include the proposed PSU, disk, uplink, cooling, mains/UPS and service incidents. Add memory-pressure/capacity upgrade, disk-capacity expansion, failed-component replacement, water spills, and application crashes that require PuTTY/SSH or a serial console.
- Distinguish resource exhaustion from physical failure. RAM upgrades need a controlled shutdown and top access to the affected host; a full filesystem is not identical to a failed disk. Application faults need not change healthy physical status lamps.
- A rare rear-service incident rotates the entire room toward the opposite side, with enough temporary 3D depth to reveal the rear while retaining the predominantly frontal 2D-ish art direction. Keep props and device identities consistent through the turn.
- That rare event temporarily changes the whole website's theme while repair continues, then restores the visitor's prior preference. Implement an ephemeral visual override; never overwrite the saved selected/follow-desktop setting. Handle interruptions and reduced-motion without losing restoration.
- Add animated Easter eggs throughout. Personal references/themes for those are still to be supplied; avoid replacing the main repair story with random unrelated effects.
- Content must show the whole breadth of Sub's capabilities. Sub explicitly rejects ranking one kind of work above another: all work is good work. Do not require a narrowed target-role hierarchy or write a career narrative that belittles support, service desk, hardware or any other area.

## Current review deliverable

- Local gallery: `/room-studies.html` — four original still environments and a pixel-art home-office variant.
- Pixel deep link: `/room-studies.html?study=pixel-office`.
- Saved generated assets: `dist/assets/room-studies/`.
- Generation prompts/provenance: `research/ROOM-STUDY-PROMPTS.md`.
- Hardware panel sources/maintenance staging: `research/HARDWARE-REFERENCE-V2.md`.
- Character, animation, exact model asset sheets, rear turn and temporary theme override are not implemented by these still studies.

## Scope

Work on this hero first. Leave the existing portfolio and concepts available for comparison. Defer other page reviews and content rewriting: the current portfolio copy is temporary and has not been approved by Sub.

## Confirmed requirements from Sub

- Full-browser-width, mostly two-dimensional front elevation of a homelab room, with a shallow three-dimensional back wall and real equipment depth. Avoid an overhead/isometric miniature.
- Overlay the logo and mission statement on the scene. Do not split the hero into a copy column and a small illustration.
- A foreground human sprite stands slightly right of center, facing the viewer in the healthy idle state. The exact meaning of the selfie-like pose and the character design remain to be clarified.
- Multiple logically arranged racks contain distinguishable 1U, 2U, 4U and 8U equipment. Include networking, routing/firewalling, compute, storage, AI, power supplies and UPS equipment.
- Incoming connectivity starts at the leftmost rack: fiber, coax and satellite were named. Whether these represent an actual three-link topology or illustrative alternatives remains open.
- A central management shell/dashboard behind the character aggregates iLO, iDRAC, IPMI and services. Its physical form and displayed services remain open.
- Healthy operation has passing checks and varied activity. Equipment remains visually alive even when the character has nothing to fix.
- Randomly selected incidents drive a coherent sequence: exact warning appears; character reacts, goes to the management shell, diagnoses the problem, travels to the affected component, repairs/replaces it, verifies recovery, and returns.
- The faulty device, management display, network traffic, repair action and subsequent recovery must describe the same incident. Avoid unrelated blinking and generic repair gestures.
- Serious faults, downtime and shutoffs darken the ambient room while equipment, screens and their state-dependent lights remain visible. The severity threshold and physical versus theatrical dimming are still to be clarified.
- Include detailed front-panel behavior: drive rings and disk activity, power/health/identify indicators, switch link/activity lights, animated data dots following actual device connections, and distinct behavior for UPS and other device classes.
- The three supplied images are composition/mood references only. Do not publish the stock images as portfolio assets.

## References reviewed

- Image 1: large foreground portrait with front-facing rack wall. Useful character scale reference; user places character to the right.
- Image 2: front-facing equipment wall with technician servicing it. Useful baseline camera reference.
- Image 3: dark cinematic room with visible equipment glow and reflections. Useful incident-lighting reference.
- User video, watched in the browser: https://www.youtube.com/shorts/9hK3IejxTQo — HP ProLiant DL380 Gen10 with SSDs. Observed separate green status lamps and segmented activity rings on different drive bays at different phases. This is a detail reference, not a complete scene design.

## Hardware behavior research

Use manufacturer-specific semantics where recognizable models appear. A green dashboard check does not mean every physical lamp must be green. For example, Dell R740 healthy/identify indicators use blue; HPE UID blue is identification rather than generic health. Network amber can indicate negotiated link speed rather than failure. Independent disk and network activity should be bounded and event-driven, not identical timers.

- HPE DL380 Gen10 front indicators: https://support.hpe.com/hpesc/public/docDisplay?docId=a00019109en_us&docLocale=en_US&page=GUID-C46C75C1-880D-4163-8F41-C5E47415B814.html
- HPE maintenance/service guide, SmartDrive definitions: https://support.hpe.com/hpesc/public/api/document/a00106496en_us
- Dell R740 system health/ID: https://www.dell.com/support/manuals/en-is/oth-r740/per740_ism_pub/system-health-and-system-id-indicator-codes?guid=guid-c2f8bdb6-3ee5-4ea8-9335-8c15f943dfd8&lang=en-us
- Dell R740 drive indicators: https://www.dell.com/support/manuals/en-au/oth-r740/per740_ism_pub/drive-indicator-codes?guid=guid-a7bf411a-f6da-4da6-9e2b-04011e075e95&lang=en-us
- Dell R740 NIC indicators: https://www.dell.com/support/manuals/en-in/poweredge-r740/per740_ism_pub/nic-indicator-codes?guid=guid-1c758b1e-60f5-4045-adf2-6e95845cb116&lang=en-us
- Dell R740 rear layout: https://www.dell.com/support/manuals/en-us/poweredge-r740/per740_ism_pub/back-view-of-the-system?guid=guid-bee3e90b-23bd-49b1-aec4-5dfe990215ef&lang=en-us
- Dell redundant PSU/hot spare behavior: https://www.dell.com/support/manuals/en-in/poweredge-r740/per740_ism_pub/hot-spare-feature?guid=guid-2a62986e-cda9-448b-b972-390e1f408be2&lang=en-us

An individual redundant PSU fault need not stop the server. A mains outage should preserve UPS-backed loads until the scenario says otherwise. PSUs and some network connectors are at the rear; agree on a rear-access/cutaway convention before animating those repairs.

## Open design decisions

1. Art medium and detail level: illustrated 2.5D, realistic room plus stylized sprite, or detailed pixel art.
2. Character appearance, clothing, portrait likeness and whether the selfie-like pose includes a phone.
3. Home-room cues: office, workshop, basement, garage or dedicated server room.
4. Actual versus aspirational equipment, rack count/height and vendor/model priority.
5. Incoming link topology and failover behavior.
6. Physical console design and recognizable services displayed.
7. Incident priorities, concurrency, repair staging and duration.
8. Darkness severity threshold and foreground text visibility.
9. Rear-component access convention with a predominantly frontal camera.
10. Ambient versus visitor-triggered interactions, audio preference and mobile framing.
11. Approved logo and mission statement, or explicit placeholder until copy review.

## Recommended next deliverable

Resolve the high-impact art/composition decisions with Sub. Create a detailed static room composition and equipment/character treatment for review before building the full incident system. The next implementation must replace the miniature scene approach rather than merely add more lights to the existing racks.
