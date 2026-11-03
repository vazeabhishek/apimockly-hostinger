# Explanation: architecture

API Mocker has one idea at its core: instead of starting a new server per mock, a single catch-all handler answers every mock request by looking the answer up in a database.

```
 React chat ── POST /api/chat ──▶ phrase parser ──▶ MySQL (mocks)
                                                       ▲
 Any client ── ANY /m/{id}/... ──▶ catch-all handler ──┘
                                   lookup by id, check method + path + expiry

 cron (in-app) ── hourly ──▶ DELETE expired anonymous mocks
```

## Why a catch-all and a database

Creating a mock is then just inserting a row: it is live instantly, needs no process management or port allocation, and survives restarts. Serving is a single primary-key lookup by `id`.

## Why a rule-based parser

The chat looks like an AI assistant, but it understands one fixed phrase format. A deterministic parser is free to run, instant, predictable and testable, and it needs no external service. The cost is that users must follow the format, which is why the UI shows example prompts. The parser sits behind a single function, so an LLM front end could be added later without touching storage or serving.

## Storage behind an interface

The app talks to a `Repo` interface. Production uses MySQL; tests use an in-memory implementation, which keeps the test suite fast and database-free. The cleanup job's cross-instance lock is part of that interface (MySQL `GET_LOCK` in production).

## Components

- **Backend** (Fastify): chat, auth, listing and the catch-all handler, plus rate limiting.
- **Frontend** (React): chat UI, sign-up/login, "My mocks".
- **MySQL**: `users` and `mocks`.
- **Cleanup job** (node-cron): runs inside the backend process.

See [Database schema](../reference/database-schema.md) and [REST API](../reference/rest-api.md) for details.
