# Reference: configuration

The backend is configured with environment variables.

| Variable | Default | Description |
|---|---|---|
| `SESSION_SECRET` | none, **required** (≥16 chars) | Signs session cookies and salts stored IP hashes. Changing it logs everyone out. |
| `DATABASE_URL` | `mysql://apimocker:apimocker@localhost:3306/apimocker` | MySQL connection URL. |
| `PORT` | `3000` | HTTP port. |
| `PUBLIC_BASE_URL` | `http://localhost:3000` | Used to build mock URLs. An `https://` value also marks cookies `Secure`. |
| `STATIC_DIR` | unset | Directory of the built frontend to serve at `/`. |
| `MAX_BODY_BYTES` | `10240` | Max size of a mock's JSON body. |
| `CREATE_RATE_PER_MIN` | `10` | Per-IP limit per minute on chat and auth endpoints. |
| `SERVE_RATE_PER_MIN` | `120` | Per-IP limit per minute on `/m/*`. |
| `ANON_CAP_PER_IP` | `5` | Max live anonymous mocks per (hashed) IP. |
| `ANON_TTL_HOURS` | `24` | Lifetime of anonymous mocks. |
| `CLEANUP_CRON` | `0 * * * *` | Cron expression for the cleanup job. |
| `TRUST_PROXY` | `false` | Set `true` to use `X-Forwarded-For` for the client IP. |

## npm scripts (backend)

| Script | Purpose |
|---|---|
| `npm run dev` | Start with reload |
| `npm run build` / `npm start` | Compile to `dist/` / run it |
| `npm run migrate` | Apply `src/migrations/*.sql` (idempotent `CREATE TABLE IF NOT EXISTS`) |
| `npm test` | Run tests |
