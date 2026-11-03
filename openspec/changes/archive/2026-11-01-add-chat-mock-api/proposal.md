## Why

Setting up a mock API today means writing config files or running tooling. Developers want to type one sentence ("setup a mock api GET /integer/30 which returns {...}") and immediately get a live endpoint. A chat-style web UI over a single catch-all API makes this instant and approachable.

## What Changes

- New web app (Node/TypeScript backend, React chat UI, MySQL) for creating mock endpoints from a fixed natural-ish phrase.
- Chat UI shows sample prompts so users learn the accepted format.
- A catch-all handler at `/m/{id}/*` looks up the stored mock by `(id, method, path)` and returns the configured status, content type and body.
- Anonymous users can create mocks without login; each message creates a new mock with a random ID and exactly one route. Anonymous mocks expire after 24 hours, and the UI says so and promotes sign-up.
- A node-cron batch deletes expired anonymous mocks.
- Email/password sign-up: the just-created mock can be claimed (made permanent) at sign-up; signed-in users can create many mocks and see a list.
- Documentation structured per the Diátaxis framework (tutorials, how-to guides, reference, explanation), maintained with every change.

## Capabilities

### New Capabilities
- `chat-mock-creation`: Chat UI and rule-based parser that turns a phrase into a mock definition and returns its URL.
- `mock-serving`: Catch-all endpoint that serves stored mocks by exact method and path under a mock ID namespace.
- `mock-expiry`: 24h expiry of anonymous mocks and the scheduled cleanup batch.
- `user-accounts`: Email/password sign-up/login, claiming a mock on sign-up, and listing a user's mocks.
- `abuse-protection`: Per-IP rate limits and size/count caps on mock creation and serving.
- `project-documentation`: Diátaxis-structured documentation requirements.

### Modified Capabilities
<!-- none: greenfield -->

## Impact

- New codebase: backend (Node/TypeScript, Express or Fastify), frontend (React), MySQL schema and migrations, in-app cron job.
- New dependencies: MySQL driver/ORM, password hashing, session/JWT auth, rate limiter, node-cron.
- New `docs/` tree following Diátaxis.
- Security surface: public unauthenticated write endpoint and public mock hosting (phishing/abuse risk).
