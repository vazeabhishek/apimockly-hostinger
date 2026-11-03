# runtime-configuration Specification

## Purpose
TBD - created by archiving change configurable-public-base-url. Update Purpose after archive.
## Requirements
### Requirement: Configuration profiles
The system SHALL support an `APP_PROFILE` setting with values `development` and `production`, defaulting to `development`, and SHALL reject any other value at startup.

#### Scenario: Default profile
- **WHEN** `APP_PROFILE` is unset
- **THEN** the system runs with the `development` profile

#### Scenario: Unknown profile
- **WHEN** `APP_PROFILE` is `staging`
- **THEN** startup fails with an error naming the allowed values

### Requirement: Profile config files
The system SHALL load `.env.<profile>` and then `.env` from the working directory at startup, ignoring missing files, and SHALL NOT override variables already present in the process environment.

#### Scenario: Value from profile file
- **WHEN** profile is `production`, `.env.production` sets `PUBLIC_BASE_URL=https://mock.example.com` and the variable is not in the environment
- **THEN** mock URLs use `https://mock.example.com`

#### Scenario: Environment wins
- **WHEN** `PUBLIC_BASE_URL` is set in the environment and differs in `.env.production`
- **THEN** the environment value is used

### Requirement: Production public base URL
In the `production` profile the system SHALL require `PUBLIC_BASE_URL` to be an absolute `http` or `https` URL whose host is not a loopback or unspecified address, and SHALL fail startup with a descriptive error otherwise.

#### Scenario: Missing in production
- **WHEN** profile is `production` and `PUBLIC_BASE_URL` is unset
- **THEN** startup fails with an error naming `PUBLIC_BASE_URL`

#### Scenario: Localhost in production
- **WHEN** profile is `production` and `PUBLIC_BASE_URL` is `http://localhost:3000`
- **THEN** startup fails

#### Scenario: Valid production URL
- **WHEN** profile is `production` and `PUBLIC_BASE_URL` is `https://mock.example.com/`
- **THEN** mock URLs are built as `https://mock.example.com/m/{id}{path}` and cookies are marked `Secure`

### Requirement: Development base URL default
In the `development` profile, when `PUBLIC_BASE_URL` is unset the system SHALL default it to `http://localhost:{PORT}`.

#### Scenario: Default with custom port
- **WHEN** profile is `development`, `PORT` is `4000` and `PUBLIC_BASE_URL` is unset
- **THEN** mock URLs begin with `http://localhost:4000/m/`

