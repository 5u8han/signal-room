# Themes, datacenter worlds and original films

Open [the comparison page](http://127.0.0.1:4320/concepts.html). The three live worlds are original code-native illustrations: cinematic isometric racks, a pixel service room, and an animated technical plan. Every world shows an illustrated technician handling alerts through KVM diagnosis, physical service and verification. The faults and consoles are invented illustrations, not live monitoring or evidence of a particular client incident.

The retained Motion Atlas still offers 20 distinct studies. The shared top-right picker offers Dark, Light and Evening, plus Follow desktop. A manual choice persists in this browser. Theme selection expands from the click point in supported browsers; quiet/reduced-motion preferences use an immediate change. Video colors and the datacenter worlds retain their authored art palettes independently of the page chrome.

Two new original 12-second loops replace the old unrelated adverts: **The Maintenance Window** and **Follow the Signal**. Both show datacenter racks, KVM warnings and a technician's diagnostic/repair cycle. `render-datacenter-films.py` uses local fonts, Pillow and FFmpeg; `dist/assets/tech-ads.json` records exact encodings, dimensions, hashes and validation flags. Existing media outside this new checkout is preserved.

`dist/tech-reels.js/css` adds two video sections to portfolio/art pages. Films load when needed, one visible film plays at a time, and hidden/offscreen films pause without losing their position. Quiet mode shows stills unless the visitor explicitly plays a film. Native player controls are available. The operator dashboard deliberately omits decorative films and audience tracking.

The build/editor commands and effects are explained in README.md. Detailed checks and limits are in QA.md. Scene/image exports retain their underlying authored colors rather than baking the shared CSS theme filter into them.
