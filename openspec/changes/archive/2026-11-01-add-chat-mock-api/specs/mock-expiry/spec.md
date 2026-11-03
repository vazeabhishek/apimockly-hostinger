## ADDED Requirements

### Requirement: Anonymous mocks expire after 24 hours
Mocks created without an account SHALL have `expires_at` set to 24 hours after creation, and the UI SHALL tell the user they will be removed unless they sign up.

#### Scenario: Anonymous creation
- **WHEN** an anonymous user creates a mock
- **THEN** `expires_at` is creation time plus 24 hours and the reply states the expiry

### Requirement: Scheduled cleanup batch
An in-app node-cron job SHALL periodically delete mocks that have no owner and whose `expires_at` has passed.

#### Scenario: Expired mocks removed
- **WHEN** the cleanup job runs
- **THEN** all unowned mocks past `expires_at` are deleted and owned mocks are untouched

#### Scenario: Multiple app instances
- **WHEN** several instances run the schedule simultaneously
- **THEN** only one executes the cleanup, enforced by a MySQL advisory lock
