## 1. Config loading

- [x] 1.1 Add `loadEnvFiles(profile)` using `process.loadEnvFile` (existing files only, never overriding set vars) and call it first in `backend/src/server.ts`
- [x] 1.2 Add `profile` to `Config`; parse and validate `APP_PROFILE` in `loadConfig`
- [x] 1.3 Derive the dev default `http://localhost:${PORT}`; in production require and validate `PUBLIC_BASE_URL` (absolute http(s), non-loopback)

## 2. Tests

- [x] 2.1 Unit tests for `loadConfig`: default profile, unknown profile, missing/localhost/valid production URL, dev default with custom port
- [x] 2.2 Test env-file precedence (environment beats file)
- [x] 2.3 Run `npm test` and `npm run typecheck` in `backend`

## 3. Docs and examples

- [x] 3.1 Add `.env.development.example` and `.env.production.example`; update `.env.example`
- [x] 3.2 Update `docs/reference/configuration.md` (`APP_PROFILE`, production requirement) and add production deployment notes
