## Why

Mock URLs are built from `PUBLIC_BASE_URL`, which silently defaults to `http://localhost:3000`. In production, a missing or forgotten variable yields mock URLs pointing at localhost, and nothing flags it. There is also no profile concept, and `.env` files are never loaded by the backend, so "take it from a config file" is not possible today.

## What Changes

- Introduce an environment profile (`APP_PROFILE`: `development` | `production`, default `development`).
- Load profile config files (`.env.<profile>`, then `.env`) at startup; real environment variables always win.
- In the `production` profile, `PUBLIC_BASE_URL` is required, must be an absolute `http(s)` URL and must not point at a loopback host; startup fails with a clear error otherwise.
- In `development`, the `http://localhost:<PORT>` default is kept (derived from `PORT`).
- Ship `.env.development.example` / `.env.production.example` and update the configuration docs.

## Capabilities

### New Capabilities
- `runtime-configuration`: Profile-based loading of configuration and validation of the public base URL used to build mock URLs.

### Modified Capabilities

## Impact

- `backend/src/config.ts` (profile handling, validation), `backend/src/server.ts` (load env files before config), `backend/test/` (config tests).
- `.env.example`, `docs/reference/configuration.md`, `docs/how-to/` (deployment notes).
- No frontend change: it already renders the `url` returned by the API. The Vite dev proxy to localhost stays dev-only.
- **BREAKING** for production deployments that relied on the localhost default: they must now set `PUBLIC_BASE_URL`.
