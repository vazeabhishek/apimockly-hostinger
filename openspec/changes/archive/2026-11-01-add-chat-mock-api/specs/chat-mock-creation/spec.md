## ADDED Requirements

### Requirement: Chat interface with sample prompts
The UI SHALL present a chat interface showing sample prompts that demonstrate the accepted phrase format.

#### Scenario: First visit
- **WHEN** a user opens the app
- **THEN** the chat shows example prompts such as `setup a mock api GET /integer/30 which returns {"value": 30}`

### Requirement: Parse mock phrase
The system SHALL parse messages of the form `[setup a mock api] METHOD /path which returns <json> [with status <code>]`, case-insensitive for keywords, and the status SHALL default to 200.

#### Scenario: Valid phrase
- **WHEN** the user sends `setup a mock api GET /integer/30 which returns {"value":30}`
- **THEN** the system creates a mock with method GET, path `/integer/30`, status 200 and that JSON body

#### Scenario: Custom status
- **WHEN** the user sends `POST /orders which returns {"error":"x"} with status 422`
- **THEN** the mock responds with status 422

#### Scenario: Invalid JSON
- **WHEN** the returned body is not valid JSON
- **THEN** the system creates nothing and replies with an error explaining the format and sample prompts

#### Scenario: Unsupported method or malformed path
- **WHEN** the method is not one of GET, POST, PUT, PATCH, DELETE or the path does not start with `/`
- **THEN** the system creates nothing and replies with an error

### Requirement: Create one mock per message
Each successful message SHALL create exactly one new mock with a new random ID and reply with its full URL `/m/{id}{path}`.

#### Scenario: Successful creation reply
- **WHEN** a mock is created
- **THEN** the chat shows the URL, method, status, and, for anonymous users, the expiry time with a sign-up prompt
