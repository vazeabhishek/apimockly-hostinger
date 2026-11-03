# How to run API Mocker locally

## Prerequisites
- Node.js 22 or newer
- Docker (for MySQL), or any MySQL 8 server

## Steps

1. Start MySQL:
   ```bash
   docker compose up -d mysql
   ```
2. Install dependencies:
   ```bash
   (cd backend && npm install) && (cd frontend && npm install)
   ```
3. Set the environment (see [Configuration](../reference/configuration.md)). At minimum:
   ```bash
   export SESSION_SECRET="$(openssl rand -hex 32)"
   ```
   The default `DATABASE_URL` matches `docker-compose.yml`.
4. Create the tables:
   ```bash
   (cd backend && npm run migrate)
   ```
5. Start the backend:
   ```bash
   (cd backend && npm run dev)
   ```
6. Start the frontend dev server in a second terminal:
   ```bash
   (cd frontend && npm run dev)
   ```
   Open <http://localhost:5173>. It proxies `/api` and `/m` to the backend on port 3000.

## Serve the UI from the backend instead

Build the frontend and point the backend at the output:

```bash
(cd frontend && npm run build)
(cd backend && npm run build)
STATIC_DIR=$PWD/frontend/dist node backend/dist/server.js
```

## Run the tests

```bash
(cd backend && npm test)
```

The tests use an in-memory repository and need no database.
