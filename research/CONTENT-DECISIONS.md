# Content decisions — November 4, 2026

This file records owner decisions and unresolved facts. It is an internal content reference; it is not public portfolio copy.

## Confirmed by the owner

- Display identity: Sub / 5u8han.dev. Professional focus: support engineering, datacenter work, networks and hands-on hardware/electronics.
- The aim is to be noticed through work, history and capability. Do not use “contact me”, “hire me” or equivalent solicitation prompts anywhere in navigation, footers or content.
- The owner wants all supplied professional history considered for publication, with an experimental site and professional detail.
- The five roles after Endeavour Health / Swedish Hospital are contract-based: Alter Domus, Kirkland & Ellis, Illinois DoIT, Robinhood and Tropicana Brands Group.
- Preserve overlapping dates exactly as supplied. Do not invent the contracting agency, weekly hours or reason for an overlap.
- Chicago Lab Services began as full-time work building the infrastructure from the ground up. It later became call-based/on-call work: the owner responds to reported issues and handles patching, upgrades and changes. The transition date is not known. Do not label it a concurrent full-time job today.
- All existing domain email aliases reach the same inbox through Cloudflare forwarding. Use info@5u8han.dev as the canonical public address rather than displaying several aliases.
- Remove the phone number. Keep public social profiles except where the actual URL is missing; GitHub, LinkedIn and Twitter/X URLs are known.
- Generate original media for the site. Previous generic test films are references, not authentic footage of the owner or employer systems.

## Facts still needing confirmation before publication

- The previous live site lists CompTIA Network+, CompTIA Security+ and Google Associate Cloud Engineer. The owner has not confirmed current status, dates or desired wording. `profile-data.json` marks all three `publish:false`; do not render them as current credentials.
- The previous live site refers to Computer Science study at Northeastern Illinois University. Degree completion and exact public wording are unconfirmed. No education claim is included in the public Markdown or education array.
- Steam appeared on the previous site but linked to an email address. A real Steam profile URL has not been supplied. Do not invent one or copy the incorrect mail link.
- No actual equipment photographs, client screenshots, measurements, testimonials, awards or quantified outcomes have been supplied. Use original illustrative geometry and grounded scope descriptions, with no invented metrics.

## Wording boundaries

The company website at Chicago Lab uses Drupal/SiteGround. Collaboration with external developers on secure lab-report delivery is a separate responsibility; do not claim that a specific patient portal was personally built in Drupal. Work described as healthcare/security compliance support is not a certification badge or legal guarantee.

The board-level repair entry is personal practice. There is no specific documented repair job or verification record to turn into a success case yet. The other experience entries summarize supplied responsibilities rather than claiming independently audited outcomes.

DyoPath and Endeavour have no supplied contract/permanent classification. Their generic Employment label must not be expanded to permanent, full-time or contract without confirmation.

## Data files

`dist/profile-data.json` contains the current UI data: 8 career roles, 9 case/practice entries, skills, valid public social links, and explicitly unpublished credential placeholders. It contains no phone or street address. `content/profile.md`, `content/experience.md` and `content/case-*.md` mirror the public facts for the proposed Markdown/Git editing workflow. Root integration should filter credentials on `publish === true` and omit unknown/empty fields.
