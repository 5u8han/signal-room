# Cloudflare production setup — pending owner connection

The code builds for a Worker with static assets. No existing Cloudflare project, domain route or database was changed. The current live Nightfall deployment remains untouched.

Before deployment:

1. Renew the owner's local Wrangler sign-in. Do not paste API tokens into chat or put them in source files.
2. Identify the intended Cloudflare account/project. The app's local name is `sub-portfolio-studio`; it is not a verified deployed project ID.
3. Create or select a D1 database and add its exact returned ID as the `DB` binding in `wrangler.jsonc`. Apply `migrations/0001_initial.sql` to that selected database after confirming the target. Do not reuse the local preview SQLite file as a production database.
4. Configure an owner-only Cloudflare Access application covering `/dashboard*` and `/api/admin/*`. Supply `ACCESS_TEAM_DOMAIN` (the team's `*.cloudflareaccess.com` hostname) and `ACCESS_AUD` from that exact application. Worker code verifies signature, issuer, audience and expiry using the official JWKS and `jose`; trusting an unverified forwarded email header is not enough.
5. Set a random `ANALYTICS_SALT` Worker secret for rate-limit HMACs. No raw client IP is retained in audience-event rows. Short-lived anti-abuse counters use the request-window keyed digest separately.
6. Configure a Turnstile widget restricted to the actual site hostname, with `TURNSTILE_SITE_KEY` and the `TURNSTILE_SECRET` Worker secret. Correspondence is disabled in production until this is configured; local previews can exercise the form without it.
7. Keep the production dashboard and admin API behind Access. The static-assets configuration runs Worker auth before `/dashboard*`, and Worker code checks admin API requests as well. Local tests verified that both `/dashboard.html` and `/dashboard` return 401 without authentication.
8. Verify the chosen landing direction on a staging URL, connect the production bindings, test a real Access session and D1 persistence, then perform the approved domain cutover. Confirm hosting limits/cost preferences before creating paid resources.

The dashboard builds campaign URLs and exports recorded data. No ad network, CRM, bulk-mail provider or outbound message service is connected. Cloudflare Email Routing forwards email sent to the public addresses; it is not used here to send dashboard replies.

Primary platform references:

- [Workers static assets](https://developers.cloudflare.com/workers/static-assets/)
- [D1 binding API](https://developers.cloudflare.com/d1/worker-api/)
- [Validate Access JWTs](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/)
- [Turnstile server validation](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/)

The frontend privacy controls and minimized data collection are implementation choices, not a legal-compliance certification. Before production, review the actual site privacy notice, retention and chosen audience/region requirements.
