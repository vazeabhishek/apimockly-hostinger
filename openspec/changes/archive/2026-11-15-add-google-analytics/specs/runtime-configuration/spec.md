## ADDED Requirements

### Requirement: Analytics settings
The system SHALL support optional `GA_MEASUREMENT_ID` (format `G-` followed by alphanumerics) and `GA_API_SECRET` settings, and SHALL fail startup if `GA_MEASUREMENT_ID` is set with an invalid format.

#### Scenario: Invalid ID
- **WHEN** `GA_MEASUREMENT_ID` is `UA-123`
- **THEN** startup fails with an error naming `GA_MEASUREMENT_ID`

#### Scenario: ID without secret
- **WHEN** `GA_MEASUREMENT_ID` is set and `GA_API_SECRET` is unset
- **THEN** browser tracking is enabled and server-side events are disabled
