## 1. Project Setup

- [x] 1.1 Scaffold monorepo: `backend/` (Node/TypeScript, Fastify) and `frontend/` (React + Vite)
- [x] 1.2 Add MySQL driver/migration tool, config loading, lint/test tooling, docker-compose with MySQL
- [x] 1.3 Create `mocks` and `users` migrations (incl. indexes on `expires_at`, `owner_id`, `creator_ip_hash`)

## 2. Chat Parsing and Creation

- [x] 2.1 Implement phrase parser (method, path, JSON body, optional status) with unit tests for valid/invalid inputs
- [x] 2.2 Implement random mock ID generator (crypto RNG)
- [x] 2.3 Implement `POST /api/chat` creating a mock and returning URL, expiry and error messages

## 3. Mock Serving

- [x] 3.1 Implement catch-all `/m/:id/*` handler with exact method/path lookup
- [x] 3.2 Return 404 for unknown/expired mocks; set JSON content type, nosniff and CSP sandbox headers
- [x] 3.3 Integration tests for match, method mismatch, unknown and expired

## 4. Expiry and Cleanup

- [x] 4.1 Set 24h `expires_at` for anonymous mocks
- [x] 4.2 Implement node-cron cleanup job guarded by MySQL `GET_LOCK`
- [x] 4.3 Test cleanup deletes only expired unowned mocks

## 5. Accounts

- [x] 5.1 Implement sign-up/login with password hashing and session cookie
- [x] 5.2 Implement claim-on-signup (assign owner, clear expiry if unowned and unexpired)
- [x] 5.3 Make mocks created by signed-in users permanent and implement `GET /api/mocks` list

## 6. Abuse Protection

- [x] 6.1 Add per-IP rate limiting for creation and serving
- [x] 6.2 Enforce body size cap and per-IP anonymous mock cap (hashed IP)

## 7. Frontend

- [x] 7.1 Build chat UI with sample prompts and message history
- [x] 7.2 Show created mock card with URL, copy button, expiry notice and sign-up call to action
- [x] 7.3 Build sign-up/login forms that pass the in-memory mock ID, and a "My mocks" page

## 8. Documentation (Diátaxis)

- [x] 8.1 Create `docs/` structure with `tutorials/`, `how-to/`, `reference/`, `explanation/` and an index explaining the four types
- [x] 8.2 Tutorial: create your first mock and call it
- [x] 8.3 How-to guides: claim a mock by signing up, run/configure the cleanup job, configure limits
- [x] 8.4 Reference: chat phrase grammar, REST API, mock URL scheme, configuration, DB schema
- [x] 8.5 Explanation: architecture, namespaced URLs, anonymous expiry model, security trade-offs
- [x] 8.6 Update README to link docs; verify docs reflect final behavior
