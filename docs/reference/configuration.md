# Reference: configuration

The backend is configured with environment variables. At startup it also loads `.env.<APP_PROFILE>` and then `.env` from the working directory (missing files are ignored). Variables already set in the environment always win over file values.

| Variable | Default | Description |
|---|---|---|
| `SESSION_SECRET` | none, **required** (≥16 chars) | Signs session cookies and salts stored IP hashes. Changing it logs everyone out. |
| `DATABASE_URL` | `mysql://apimocker:apimocker@localhost:3306/apimocker` | MySQL connection URL. |
| `APP_PROFILE` | `development` | `development` or `production`. Any other value fails startup. |
| `PORT` | `3000` | HTTP port. |
| `PUBLIC_BASE_URL` | `http://localhost:$PORT` in development; **required** in production | Used to build mock URLs. An `https://` value also marks cookies `Secure`. In production it must be an absolute http(s) URL and not localhost, or startup fails. |
| `STATIC_DIR` | unset | Directory of the built frontend to serve at `/`. |
| `MAX_BODY_BYTES` | `10240` | Max size of a mock's JSON body. |
| `CREATE_RATE_PER_MIN` | `10` | Per-IP limit per minute on chat and auth endpoints. |
| `SERVE_RATE_PER_MIN` | `120` | Per-IP limit per minute on `/m/*`. |
| `ANON_CAP_PER_IP` | `5` | Max live anonymous mocks per (hashed) IP. |
| `ANON_TTL_HOURS` | `24` | Lifetime of anonymous mocks. |
| `CLEANUP_CRON` | `0 * * * *` | Cron expression for the cleanup job. |
| `TRUST_PROXY` | `false` | Set `true` to use `X-Forwarded-For` for the client IP. |

## Production

Set `APP_PROFILE=production` and `PUBLIC_BASE_URL=https://your.domain`, either as environment variables or in `.env.production` (see `.env.production.example`). Step by step: [Configure for production](../how-to/configure-production.md).

## npm scripts (backend)

| Script | Purpose |
|---|---|
| `npm run dev` | Start with reload |
| `npm run build` / `npm start` | Compile to `dist/` / run it |
| `npm run migrate` | Apply `src/migrations/*.sql` (idempotent `CREATE TABLE IF NOT EXISTS`) |
| `npm test` | Run tests |
