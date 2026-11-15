## ADDED Requirements

### Requirement: Analytics is opt-in
The system SHALL send no analytics data and load no Google scripts unless `GA_MEASUREMENT_ID` is configured.

#### Scenario: Not configured
- **WHEN** `GA_MEASUREMENT_ID` is unset
- **THEN** the UI does not load gtag.js and the backend makes no calls to Google Analytics

### Requirement: Browser page tracking
When a measurement ID is configured, the web UI SHALL load GA4 and record a page view on initial load and on each client-side route change.

#### Scenario: Navigation
- **WHEN** a user navigates between UI views
- **THEN** a `page_view` is sent for each view

### Requirement: Server-side usage events
When `GA_MEASUREMENT_ID` and `GA_API_SECRET` are configured, the backend SHALL send GA4 events `mock_created` when a mock is created, `user_registered` when an account is registered, and `mock_served` when a mock endpoint is served.

#### Scenario: Mock created
- **WHEN** a mock is successfully created
- **THEN** a `mock_created` event is sent with `source` (chat or manual) and `owner` (anon or user)

#### Scenario: User registered
- **WHEN** a user registers successfully
- **THEN** a `user_registered` event is sent

#### Scenario: Mock served
- **WHEN** a mock endpoint responds to a request
- **THEN** a `mock_served` event with HTTP method and status class (2xx, 4xx, 5xx) is sent

### Requirement: Funnel and health events
The backend SHALL send `login` on successful login, `signup_failed` on failed registration, `mock_create_failed` with an enumerated `reason` on rejected creation, `mock_expired` with a `count` when the cleanup job removes mocks, and `rate_limited` with `kind` (create or serve) when a rate limit rejects a request.

#### Scenario: Rate limited
- **WHEN** a create request is rejected by the rate limiter
- **THEN** a `rate_limited` event with `kind=create` is sent

#### Scenario: Creation rejected
- **WHEN** creation fails because the body is too large
- **THEN** a `mock_create_failed` event with a `reason` value is sent

#### Scenario: Cleanup expiry
- **WHEN** the cleanup job removes expired mocks
- **THEN** a single `mock_expired` event with the removed `count` is sent

### Requirement: Donation click tracking
When browser analytics is enabled, the UI SHALL send a `donate_clicked` event when the user clicks a donation link.

#### Scenario: Donate click
- **WHEN** a user clicks a donation link in the donate dialog
- **THEN** a `donate_clicked` event is sent

### Requirement: Privacy-preserving payloads
Analytics events SHALL NOT contain emails, passwords, IP addresses, mock paths, or request/response bodies.

#### Scenario: Registration event payload
- **WHEN** `user_registered` is sent
- **THEN** its payload contains no email or IP address

### Requirement: Analytics never impacts requests
Analytics delivery SHALL be asynchronous, time-bounded, and failures SHALL NOT change the response of any API request.

#### Scenario: Google unreachable
- **WHEN** the analytics endpoint times out or errors during mock creation
- **THEN** the creation response is unchanged and the error is only logged
