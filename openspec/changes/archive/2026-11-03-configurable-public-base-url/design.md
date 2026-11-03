## Context

`loadConfig(env)` in `backend/src/config.ts` reads `process.env` only. `PUBLIC_BASE_URL` defaults to `http://localhost:3000`, and `app.ts` uses it both for mock URLs (`${publicBaseUrl}/m/${id}${path}`) and to decide whether cookies are `Secure`. No `.env` loader exists, and the `dev`/`start` scripts do not pass `--env-file`. The frontend uses relative `/api` calls and displays server-provided URLs, so it needs no change.

## Goals / Non-Goals

**Goals:**
- Production never silently emits localhost URLs.
- The base URL can come from a profile config file or a real environment variable.
- Local development works with zero configuration.

**Non-Goals:**
- Deriving the base URL from request `Host` headers (spoofable, and a proxy-trust concern).
- Frontend runtime config or a config server.
- Changing the Vite dev proxy.

## Decisions

- **Profile selection via `APP_PROFILE`** (default `development`) rather than `NODE_ENV`: `NODE_ENV` has side effects in libraries and is often set to `production` for builds. Alternative: reuse `NODE_ENV`, which is simpler but couples unrelated behaviors.
- **Env files via Node's built-in `process.loadEnvFile`** (no new dependency). Load order: `.env.<profile>` then `.env`; already-set variables are never overridden, so real env vars win. Missing files are ignored. Alternative: `dotenv` (extra dependency for no gain); YAML/JSON config (new format and parser, with no benefit over env files).
- **Validation in `loadConfig`**: in `production`, require `PUBLIC_BASE_URL`, parse it with `new URL`, require protocol `http:`/`https:`, and reject `localhost`, `127.0.0.0/8`, `::1` and `0.0.0.0`. The development default becomes `http://localhost:${PORT}`. `loadConfig` stays pure for tests (env is passed in); the file loading lives in a separate `loadEnvFiles(profile)` called from `server.ts`.
- **Keep the trailing-slash strip** and the `https://` => Secure cookie rule unchanged.

## Risks / Trade-offs

- [Existing prod deployments break on upgrade] → clear startup error message naming the variable; documented in the config reference.
- [Rejecting loopback blocks legit local prod-like testing] → use the `development` profile, or an `ALLOW_LOCALHOST_BASE_URL`-style override is deliberately not added (YAGNI).
- [`loadEnvFile` throws on unreadable files] → only call it if the file exists.

## Migration Plan

Set `APP_PROFILE=production` and `PUBLIC_BASE_URL=https://your.domain` (env var or `.env.production`) before deploying. Rollback is reverting the release; no data changes.

## Open Questions

- Should the production profile be inferred from `NODE_ENV=production` as a fallback?
