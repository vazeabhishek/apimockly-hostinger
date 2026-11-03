# Explanation: why mock URLs are namespaced

Mock URLs look like `/m/{id}/integer/30`, not `/integer/30`. There are two reasons.

## Reason 1: the app needs its own routes

A catch-all that accepts every path would also swallow `/api/chat`, the UI and health checks. Reserving a prefix (`/m/`) for mocks, with everything else belonging to the application, removes the ambiguity entirely.

## Reason 2: users must not collide

If mocks lived at the root, the first person to claim `GET /integer/30` would own it for everyone. With an ID in the URL, each mock has its own private address space, and two people can both mock `/integer/30`.

The ID is also the only thing that identifies an anonymous mock, because there are no cookies for anonymous users. It is generated from a cryptographic random source (12 characters from 36 symbols), so it cannot practically be guessed. Anyone who has the URL can call the mock, which is the point of a mock API.

## Alternatives considered

- **Root paths with global matching**: nicer URLs, but collisions and route clashes.
- **Subdomain per mock** (`id.example.com`): cleaner URLs, but needs wildcard DNS and TLS, which is heavy for a small tool.
