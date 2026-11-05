# Home-office hero artwork and implementation

Generated 2026-11-05 with the built-in image_gen tool. The user selected room study 01 and supplied two personal likeness references. Original photographs remain outside the public site; only generated stylized derivatives are shipped.

## Assets

- `dist/assets/homelab/room-front.png`: revised office with gaming desk, parts bench, printer/KVM table and relaxed wiring.
- `dist/assets/homelab/room-rear.png`: the same room viewed from behind the racks.
- `dist/assets/homelab/sub-atlas.png`: transparent 4×3 stylized character pose sheet.
- `dist/assets/homelab/chair.png`: independent chair prop for spring motion.

The scene is illustrative and its telemetry is simulated. It does not connect to personal infrastructure.

## Prompt: front

Use case: precise-object-edit. Edit target: the supplied generated home office study. Asset type: full width animated website environment base, 16:9 wide, high resolution. Preserve the camera: mostly 2D front-facing room wall with slight 3D depth, all four server rack fronts parallel to picture, no isometric view. Preserve the original warm home-office character, four distinct real-hardware-inspired rack banks, window on left and central management ultrawide. Expand the room composition slightly wider so both side workspaces are useful and all four rack banks stay visible.

Required changes: RIGHT side is now a convincing gaming/workstation desk, more substantial and prominent than the original narrow repair bench: a curved Samsung Odyssey-style 49-inch super-ultrawide monitor with true broad 32:9 proportions, dark screen with subtle blue game/desktop glow; an open Lenovo Legion-style gaming laptop on an angled riser to its right; mechanical keyboard, large desk mat, gaming mouse, headphones on stand, microphone boom arm, compact speakers, a dark gaming PC with subdued internal light below/beside the desk. The desk is slightly angled toward the room at far right, mostly frontal. Leave an OPEN SEAT SPACE in front of that desk for an animated seated person; no person and no chair in the base image, they will be composited as moving layers. Enough visible floor foreground for a walking adult.

LEFT side: replace the decorative left table/window-shelf books/plants with a practical small parts/repair bench holding clearly visible green RAM DIMMs in trays, loose 2.5-inch and 3.5-inch drives, spare server caddies, a PCIe network card, a screwdriver kit, SFP modules, tangled patch leads and coiled cables. Shelves/parts bins can show lived-in organization. It is a hobbyist's actual home, not a spotless showroom.

CENTER: In the gap between the two rack pairs, put a small real table below the management ultrawide, with keyboard and mouse on tabletop and a compact laser printer underneath on the lower shelf. Keep the central screen rectangular, flat, unobstructed and dark, with only faint monitor placeholders (animation will be drawn over it).

WIRING: reduce professional cable perfection. Some cable bundles in trays, some uneven hanging loops in teal/blue/yellow, two or three hand-routed patch leads across rack edges, a small spool and accessible service slack. Believable safe household setup, not a tangled dangerous mess. Show rack-mounted Cisco-like copper/SFP networking in left rack, HPE DL380 Gen10-like 2U servers with SFF drive carriers second rack, Dell PowerEdge-like compute/storage third, Supermicro-style GPU server and tall larger chassis fourth. Varied rack heights/devices/vent grilles, UPS at bottoms.

LIGHTING: subtly dimmer evening home office, still enough room light to clearly see all equipment and parts. Soft muted blue/teal from screens balanced with restrained warm desk lamp. No blown-out daylight. Keep an uncluttered quiet upper wall area (~top 20 percent) for overlaid website logo, mission statement and typing panel. Do NOT draw any text, logo, watermark, human, silhouette, mascot or interface frame into image. Refined hand-painted/illustrated 2.5D materials and clean rich detail, not cartoon toy boxes. Keep same room identity. Separate code will animate LEDs/screens/person so do not overexpose baked glowing lights.

## Prompt: avatar

Use case: stylized-concept. Input images 1 and 2 are private photographic likeness references of the SAME ADULT PERSON, Sub. They are references only: create an ORIGINAL STYLIZED CARTOON CHARACTER, never reuse/collage the actual photographic face or background. Asset type: production transparent character animation sprite atlas for a detailed illustrated 2.5D homelab website.

Create a clean 4-COLUMN by 3-ROW sheet, TWELVE uniformly sized cells. Transparent background throughout, no labels, no cell lines, no shadows that cross cells, no lettering or watermark. Each entire figure fully within its cell with generous transparent margins. Same character proportions/scale/costume/face in every cell. Full standing figure occupies ~82% cell height; feet baseline ~92% from cell top. Front-facing room camera, no isometric floor.

Likeness: adult with warm medium complexion, short dark hair/trimmed sides, neat short full beard/moustache, strong eyebrows, characteristic face inspired by supplied photos but substantially cartoonified. Dark baseball cap worn backward as in reference2. Dark charcoal/navy zip hoodie over muted blue shirt, dark jeans, light gray/white sneakers, a dark watch with subtle orange strap detail. Confident friendly technical person, natural sturdy adult proportions with mildly enlarged expressive head (~1:5 head:body), not a child, no exaggerated caricature. Polished 2D/2.5D animated-film character rendering, clean silhouettes, soft cel shading with fine illustrative detail matching a premium game environment. Gentle neutral keylight, no environmental background.

Read cells in this exact order left-to-right, top-to-bottom:
ROW1 cell1 standing neutral facing visitor slight3/4; cell2 side-profile facing RIGHT walk contact pose rightleg forward; cell3 side-profile facing RIGHT passing pose; cell4 side-profile facing RIGHT opposite contact leftleg forward.
ROW2 cell1 side-profile facing RIGHT passing pose opposite; cell2 standing facing RIGHT with both hands extended chestheight carefully servicing a rack; cell3 kneeling/crouching facing RIGHT holding a replacement drive; cell4 back-three-quarter standing at a keyboard, both hands typing.
ROW3 cell1 SEATED side-three-quarter facing RIGHT at a gaming desk, arms forward to keyboard/mouse, bentknees/feetforward; no chair/table/monitor in this cell, ONLY THE PERSON sitting in emptyspace; cell2 standing facing RIGHT carrying a small server drive caddy; cell3 facing front with subtle alert/raised eyebrow gesture; cell4 facing front relaxed small thumbs-up after repair.

All 12 poses are distinct and usable animation assets. Maintain the identity, clothes and adult proportions across every pose. True alpha transparent canvas; no checkerboard background. Extra crisp face and beard detail at sprite scale, but stylized and illustrated rather than photographic.

## Prompt: rear

Use case: precise-object-edit. The input image is the APPROVED FRONT room base of a domestic homelab website. Create the matching REVERSE CAMERA / REAR SERVICE VIEW of this same room, as if the whole room and four rack banks turned 180 degrees to show their BACKS, keeping a mostly frontal 2D-ish plane with slight 3D depth. It must still be the same home office at the same scale and wide16:9 framing, same floor, warm muted evening light, same room ceiling and wall heights, quiet upper20percent for live text overlay, no people.

Show the true backs of ALL FOUR RACKS rather than front drive bays. Realistic distinct server rear panels with dual hot-swap PSU modules and small handles, power leads, I/O ports, ventilation, network copper/SFP patch cables. Rack order must reverse compared with front reference: far left is the Supermicro GPU/tall system bank; left-center Dell PowerEdge rear panels with redundant PSU bays and blue service handles; right-center HPE rear panels; far right networking/edge rack. Two vertical PDUs along rack sides with individually connected power cords. Cable service loops have uneven human-installed slack, some bundling but lived-in home lab—not professional cable showroom.

Composition follows 180degree view: HOME GAMING DESK is now at FAR LEFT, seen from its back/side with rear of broad49inch Samsung-style ultrawide, laptop, speakers and dark PC beneath. PARTS/REPAIR BENCH and window now at FAR RIGHT with RAM trays, drives, tools and cables. Center gap still contains a small management console table and a visible printer below, but monitor arm/back and physical cable connections can now be seen. Floorforeground wideopen; no chair or person. Keep rackstop near28percent imageheight andrackbases near78percent, as close to referenceheight as possible. Device ports and PSUmodules should be crisp, believable and readable, ready for live LEDs to overlay. No big warning signs, no sparks, no explosions, no text, labels, logos, watermarks or pre-rendered UI. Premium refined illustrated2.5D materials consistent with the front reference. This is a coherent rear-service environment asset, not a different room and not an overhead diagram.

## Prompt: chair

Use case: stylized-concept. Asset type: single transparent prop for animated homelab gaming desk. Draw ONE high quality dark charcoal ergonomic gaming/office chair, full chair with five caster wheels, base, seat, contoured medium-height backrest and armrests. The occupant would sit facing RIGHT in side-three-quarter view, matching the right-facing seated person in row3cell1 of the supplied cartoon sprite sheet. Image is a style reference only; do not draw any person or bodypart. Premium 2D/2.5D animated illustration with soft cel-shaded navy/charcoal upholstery, restrained teal seams, realistic adult-size chair proportions and slight shallowdepth. No logos, no text, no RGBgarishdecoration. Entire chair within image, generous transparent margin, actual alpha background, no floor, room, shadows that extend far, or checkerboard. Face the chair toward right exactly; this will sit under the moving seated sprite in the website.

## Runtime

Shallow CSS 3D room planes, canvas emission layers and a generated character atlas. Independently animated drive rings/LEDs, link traffic, physical screens, fans and power states are tied to ten diagnosis/repair/verification stories. Bounded springs move cables and the chair; tossed DIMMs use gravity and bounce. Rear service temporarily overrides the displayed theme while preserving the saved preference.

Original portrait references are never copied into dist or the deployment package. The avatar is a generated stylized likeness, not a photographic portrait. Model families are representative pending an exact equipment inventory.

