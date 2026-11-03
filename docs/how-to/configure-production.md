# How to configure API Mocker for production

Mock URLs are built from `PUBLIC_BASE_URL`. In production it must be your public address, otherwise users would be given `localhost` links. The `production` profile enforces this.

## Steps

1. Copy the production example next to where the backend runs. The backend reads files from its **working directory** (`backend/` when you use `npm start`):
   ```bash
   cp .env.production.example backend/.env.production
   ```
2. Edit `backend/.env.production`:
   | Variable | What to set |
   |---|---|
   | `APP_PROFILE` | `production` |
   | `PUBLIC_BASE_URL` | Your public URL, e.g. `https://mock.example.com` (no localhost) |
   | `SESSION_SECRET` | A long random string: `openssl rand -hex 32` |
   | `DATABASE_URL` | Your production MySQL URL |
   | `TRUST_PROXY` | `true` if behind a reverse proxy or load balancer |
3. Alternatively, skip the file and set the same variables in your hosting platform's environment. Real environment variables always override file values.
4. Build, migrate and start:
   ```bash
   cd backend && npm run build && npm run migrate && npm start
   ```
   `APP_PROFILE` selects which file is loaded, so it must be set in the environment (e.g. `export APP_PROFILE=production`) for `migrate` and `start`; the file then supplies the rest.

## Check it worked

- Startup fails with `PUBLIC_BASE_URL must be set…` or `…must not point at localhost…` if the URL is missing or points at localhost. Fix the value and restart.
- Create a mock in the UI and confirm its URL starts with your public address.

`.env.*` files are git-ignored (only `*.example` files are committed), so secrets stay out of the repo.

See [Configuration](../reference/configuration.md) for all variables.
