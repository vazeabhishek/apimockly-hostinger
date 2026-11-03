# donation-support Specification

## Purpose
TBD - created by archiving change add-paypal-donation. Update Purpose after archive.
## Requirements
### Requirement: Donation entry point
The web UI SHALL display a PayPal donation button in the app shell on every view, for both anonymous and authenticated users.

#### Scenario: Button visible when logged out
- **WHEN** an anonymous user opens the app
- **THEN** a PayPal donation button is visible in the sidebar

#### Scenario: Button visible when logged in
- **WHEN** an authenticated user navigates between views
- **THEN** the donation button remains visible

### Requirement: Donation dialog
Activating the donation button SHALL open a dialog that states the donation helps keep the platform free and running, shows the PayPal QR code, and links to the PayPal account `@vazeabhishekd`.

#### Scenario: Open dialog
- **WHEN** the user clicks the donation button
- **THEN** a dialog shows the request text, the QR code image with alt text, and a link to `https://www.paypal.me/vazeabhishekd`

#### Scenario: Link opens safely
- **WHEN** the user clicks the PayPal link
- **THEN** it opens in a new tab with `rel="noopener noreferrer"`

#### Scenario: Close dialog
- **WHEN** the user presses Escape or activates the close control
- **THEN** the dialog closes and focus returns to the donation button

### Requirement: Non-intrusive behavior
The donation prompt MUST NOT open automatically and MUST NOT block use of the app.

#### Scenario: No auto-popup
- **WHEN** a user loads the app or performs any action
- **THEN** the dialog opens only after the user activates the donation button

