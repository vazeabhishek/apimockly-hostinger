# Reference: REST API

All `/api` endpoints exchange JSON. Authentication uses an HTTP-only signed cookie named `sid`, set by sign-up and login. Request bodies are limited to 16 KB.

## `GET /api/samples`
Returns `{ "prompts": string[] }`, the example prompts shown in the UI.

## `POST /api/chat`
Rate limited (`CREATE_RATE_PER_MIN`).

Request: `{ "message": string }`

| Status | Body |
|---|---|
| 200 | `{ "ok": true, "reply": string, "mock": Mock }` |
| 400 | `{ "ok": false, "reply": string }`, message empty or not parseable; see [Chat phrase grammar](chat-phrase.md) |
| 429 | `{ "ok": false, "reply": string }` for the anonymous cap, or the rate limiter's error body |

`Mock`: `{ id, url, method, path, status, expiresAt }`. `expiresAt` is an ISO timestamp, or `null` for mocks owned by a signed-in user.

A request from a signed-in user creates a permanent mock owned by that user. Otherwise the mock is anonymous and expires after `ANON_TTL_HOURS`.

## `POST /api/auth/signup`
Rate limited.

Request: `{ "email": string, "password": string, "claimMockId"?: string }`. Password: 8–200 characters.

| Status | Body |
|---|---|
| 200 | `{ "user": { "email" }, "claimed": boolean }`, sets the `sid` cookie |
| 400 | `{ "error": string }` invalid email or password |
| 409 | `{ "error": string }` email already registered |

`claimed` is `true` when `claimMockId` referred to an unowned, unexpired mock, which is then owned by the new user and no longer expires.

## `POST /api/auth/login`
Rate limited. Request: `{ "email", "password" }`. Returns 200 `{ "user": { "email" } }` and sets the cookie, or 401 `{ "error" }`.

## `POST /api/auth/logout`
Clears the cookie. Returns `{ "ok": true }`.

## `GET /api/auth/me`
Returns `{ "user": { "email" } | null }`.

## `GET /api/mocks`
Signed-in only. Returns `{ "mocks": Mock[] }` for the current user, newest first, or 401.

## `ANY /m/:id/*`
The mock endpoint; see [Mock URL scheme and serving rules](mock-urls.md).
