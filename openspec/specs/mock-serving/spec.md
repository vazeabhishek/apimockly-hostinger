# mock-serving

## Purpose

Introduced by change add-chat-mock-api.

## Requirements

### Requirement: Catch-all mock endpoint
The system SHALL serve mocks through a single handler at `/m/{id}/*` for all HTTP methods, looking up the mock by ID, method and exact path.

#### Scenario: Match found
- **WHEN** a client calls `GET /m/x7k2/integer/30` and a matching unexpired mock exists
- **THEN** the system returns the stored status, `application/json` content type and body

#### Scenario: Method mismatch
- **WHEN** the mock exists for GET but the client sends POST
- **THEN** the system returns 404 with a JSON error body

#### Scenario: Unknown ID or path
- **WHEN** no mock matches the ID and path
- **THEN** the system returns 404 with a JSON error body

#### Scenario: Expired mock
- **WHEN** a mock's `expires_at` is in the past
- **THEN** the system returns 404 even if the cleanup batch has not yet run

### Requirement: Safe response headers
Served mock responses SHALL include `X-Content-Type-Options: nosniff` and a sandboxing Content-Security-Policy.

#### Scenario: Headers present
- **WHEN** any mock is served
- **THEN** those headers are set
