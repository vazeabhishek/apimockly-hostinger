## ADDED Requirements

### Requirement: Rate limiting
The system SHALL rate-limit mock creation and mock serving per client IP.

#### Scenario: Creation limit exceeded
- **WHEN** an IP exceeds the creation limit
- **THEN** the chat replies with a rate-limit message and HTTP 429 is returned

### Requirement: Size and count caps
The system SHALL reject mock bodies larger than the configured maximum and cap the number of live anonymous mocks per IP hash.

#### Scenario: Oversized body
- **WHEN** the JSON body exceeds the maximum size
- **THEN** no mock is created and the user is told the limit

#### Scenario: Anonymous cap reached
- **WHEN** an IP already has the maximum live anonymous mocks
- **THEN** creation is refused with a prompt to sign up or wait for expiry

### Requirement: JSON-only content
Served mocks SHALL always use the `application/json` content type.

#### Scenario: Content type
- **WHEN** any mock is served
- **THEN** the Content-Type is `application/json`
