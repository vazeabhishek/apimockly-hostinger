## ADDED Requirements

### Requirement: Email/password sign-up and login
The system SHALL let users register and log in with email and password, storing only salted password hashes.

#### Scenario: Successful sign-up
- **WHEN** a user submits a valid unused email and password
- **THEN** an account is created and the user is logged in

#### Scenario: Duplicate email
- **WHEN** the email is already registered
- **THEN** sign-up is rejected with an error

### Requirement: Claim mock at sign-up
If sign-up includes the ID of a still-unowned, unexpired mock, the system SHALL assign it to the new user and remove its expiry.

#### Scenario: Claim succeeds
- **WHEN** a user signs up with the ID of their just-created mock
- **THEN** the mock becomes permanent and owned by the user

#### Scenario: Mock already expired or owned
- **WHEN** the supplied mock is expired or already owned
- **THEN** the account is created but the mock is not claimed

### Requirement: Signed-in users manage many mocks
Signed-in users SHALL be able to create multiple permanent mocks and list their own mocks.

#### Scenario: List mocks
- **WHEN** a signed-in user opens "My mocks"
- **THEN** only their mocks are listed with URL, method, path and status

#### Scenario: Created mocks are permanent
- **WHEN** a signed-in user creates a mock via chat
- **THEN** it has an owner and no expiry
