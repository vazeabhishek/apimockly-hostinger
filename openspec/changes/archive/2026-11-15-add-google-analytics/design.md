## Context

Backend is a Node/TypeScript app (`app.ts`, `config.ts`, env-profile loading); frontend is a Vite React SPA. GA4 client tracking only sees browser traffic, but mocks are consumed by API clients (curl, apps) that never run JavaScript. "How many APIs are mocked", "users registered" and mock traffic are server-side facts.

## Goals / Non-Goals

**Goals:**
- Dashboard in GA4 showing UI traffic, mocks created, registrations and mock-serve volume.
- Zero impact on request latency/availability; fully optional.

**Non-Goals:**
- Own analytics storage/dashboards, per-user tracking, sending mock bodies/paths/emails.
- Cookie-consent UI (noted as a risk).

## Decisions

- **Hybrid tracking**: gtag.js in the browser for page views; GA4 Measurement Protocol (`POST https://www.google-analytics.com/mp/collect`) from the backend for domain events. Alternative: client-only — rejected, misses API-client traffic and can be blocked by ad blockers.
- **Events**: `mock_created` (`source` = chat/manual, `owner` = anon/user), `user_registered`, `login`, `signup_failed`, `mock_create_failed` (`reason`), `mock_deleted`, `mock_expired` (from cleanup job), `rate_limited` (`kind` = create/serve), `mock_served` (`method`, `status_class` = 2xx/4xx/5xx). `donate_clicked` is sent from the browser. All params are low-cardinality (enumerated values only). No mock ids/paths to avoid cardinality and leaking data. "Total mocks" is then event count in GA; current active totals are out of scope.
- **Client id**: random per-event-source `client_id` for server events (`server` constant or hash of user id for registered users); never raw IP/email.
- **Fire-and-forget**: `analytics.track(name, params)` queues without awaiting, short timeout, errors logged at debug and swallowed. `mock_served` is sampled-free but batched (MP accepts up to 25 events/request) with a flush interval to limit outbound calls.
- **Config**: `GA_MEASUREMENT_ID` (`G-XXXX`) and `GA_API_SECRET`; both required for server events, ID alone enables browser tracking. Validated by format at startup. Frontend gets the ID via a runtime config endpoint/injected into index.html rather than a build-time var, so one build serves all environments.
- Disabled by default in `development` profile unless set.

## Risks / Trade-offs

- [Mock-serve volume floods GA quota] → batching, and a config cap/optional `GA_SERVE_EVENTS=false`.
- [Privacy/consent regulations] → no PII sent; document that operators must provide consent notice where required.
- [Ad blockers drop browser hits] → server events unaffected.
- [Outbound network failure] → swallowed, bounded queue drops oldest.
