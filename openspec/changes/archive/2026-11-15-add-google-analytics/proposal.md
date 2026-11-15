## Why

Operators have no visibility into how apimocker is used: how many mock APIs are created, how many users register, and how much traffic the mocks and UI receive. Google Analytics 4 gives this as a hosted dashboard without building our own reporting.

## What Changes

- Add GA4 page tracking (gtag.js) to the web UI, loaded only when a measurement ID is configured.
- Add server-side GA4 events (Measurement Protocol) for `mock_created`, `user_registered` and `mock_served`, so counts of mocks, registrations and mock traffic appear in GA reports.
- Add funnel, health and adoption events: `login`, `signup_failed`, `mock_create_failed`, `mock_deleted`, `mock_expired`, `rate_limited`, and a UI `donate_clicked` event.
- Add configuration for the measurement ID and API secret; analytics is disabled when unset.
- Analytics failures never affect request handling; no PII or mock content is sent.

## Capabilities

### New Capabilities
- `web-analytics`: GA4 client page tracking and server-side usage events (mock created, user registered, mock served).

### Modified Capabilities
- `runtime-configuration`: new optional `GA_MEASUREMENT_ID` and `GA_API_SECRET` settings.

## Impact

- Backend: `config.ts`, new `analytics.ts`, hooks in mock creation, registration and mock-serving routes in `app.ts`; new outbound HTTPS call to `google-analytics.com`.
- Frontend: `index.html`/`main.tsx` gtag loader, route-change page views; served config exposes the measurement ID.
- Privacy: user IP/ids are hashed or omitted; consider consent/cookie notice.
