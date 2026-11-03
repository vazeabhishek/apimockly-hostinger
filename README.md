# API Mocker

Describe an API in a chat and get it hosted instantly:

```
setup a mock api GET /integer/30 which returns {"value": 30}
```

A single catch-all endpoint (`/m/{id}/*`) serves every mock from MySQL. Anonymous mocks expire after 24 hours; signing up keeps them.

**Stack:** Node/TypeScript (Fastify), React (Vite), MySQL.

## Quick start

```bash
docker compose up -d mysql
export SESSION_SECRET="$(openssl rand -hex 32)"
(cd backend && npm install && npm run migrate && npm run dev)
(cd frontend && npm install && npm run dev)   # http://localhost:5173
```

## Documentation

Docs follow the [Diátaxis](https://diataxis.fr/) framework; start at [docs/README.md](docs/README.md):
tutorials, how-to guides, reference and explanation.
