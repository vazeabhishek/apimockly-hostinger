## Context

Greenfield project. Users describe a mock in one sentence in a chat UI; the app persists it and serves it from a single catch-all route. Anonymous use must be frictionless, but anonymous data must not accumulate, so it expires after 24h unless the user signs up.

```
React chat ──POST /api/chat──▶ parser ──▶ MySQL(mocks)
Any client ──ANY /m/{id}/*──▶ catch-all ──▶ lookup(id, method, path) ──▶ response
cron (hourly) ──▶ DELETE anonymous mocks WHERE expires_at < now()
```

## Goals / Non-Goals

**Goals:**
- Create a live mock from one phrase in seconds, no login.
- Single catch-all handler backed by MySQL lookup.
- Automatic cleanup of expired anonymous mocks.
- Sign-up to keep a mock; signed-in users manage many mocks.
- Diátaxis documentation kept current.

**Non-Goals:**
- Editing or deleting mocks via chat (create only in MVP).
- Path parameters or wildcards (exact path match only).
- LLM-based parsing, dynamic/templated bodies, delays, error injection.
- Remembering the last mock across page refresh (no cookie/localStorage); a refreshed anonymous mock is simply not claimable.

## Decisions

- **Stack**: Node/TypeScript with Fastify (or Express), React + Vite frontend, MySQL. Alternative: Spring/Go; rejected per user preference.
- **Namespace**: mocks served at `/m/{id}/{path}`. App routes live under `/api/*` and the UI at `/`, so the catch-all cannot collide with them. Alternative: root paths (global collisions) or subdomains (DNS/infra cost).
- **Identity**: anonymous mocks are identified only by an unguessable random ID (e.g. 10+ chars, base62 from crypto RNG). No cookie. One route per anonymous mock; every chat message creates a new mock.
- **Schema** `mocks(id PK, method, path, status, content_type, body, owner_id NULL, expires_at NULL, creator_ip_hash, created_at)`. Lookup by `id` (PK) then compare method/path. Registered users may own many mocks, so for owned mocks `id` remains unique per mock (one route each), and the user list queries `owner_id`.
- **Parser**: deterministic regex grammar: `[setup a mock api] METHOD /path which returns <json> [with status <code>]`. Case-insensitive keywords; JSON extracted as everything after the first `returns` up to an optional trailing `with status N`, validated with `JSON.parse`. Unparseable input returns a helpful message with sample prompts.
- **Expiry**: `expires_at = now()+24h` for anonymous mocks; serving treats expired rows as 404 even before cleanup runs. node-cron hourly job deletes expired rows with `owner_id IS NULL`. Multi-instance safety via MySQL `GET_LOCK`.
- **Claim on sign-up**: the sign-up request carries the in-memory mock ID from the page; server sets `owner_id`, clears `expires_at` only if the mock is still unowned and unexpired.
- **Auth**: email/password, argon2/bcrypt hashing, HTTP-only session cookie for signed-in users only.
- **Abuse controls**: per-IP rate limit on creation and serving, max body size (e.g. 10 KB), cap on anonymous mocks per IP hash, allowed content type limited to `application/json`, security headers (`X-Content-Type-Options: nosniff`, `Content-Security-Policy: sandbox`) on served mocks.
- **Docs**: `docs/{tutorials,how-to,reference,explanation}` per Diátaxis; each user-visible change updates the relevant quadrant.

## Risks / Trade-offs

- Anonymous creation is unlimited per user → per-IP rate limit and global/IP caps.
- Public hosting of arbitrary JSON can be abused for phishing → JSON-only content type, nosniff, sandbox CSP.
- Refresh loses claimability → accepted trade-off, documented in UI and explanation docs.
- Cron on multiple instances → DB advisory lock.
- IP hashing with proxies → trust-proxy configuration needed.

## Open Questions

- Exact limits (rate, body size, per-IP cap).
- Whether signed-in users' mocks ever expire.
