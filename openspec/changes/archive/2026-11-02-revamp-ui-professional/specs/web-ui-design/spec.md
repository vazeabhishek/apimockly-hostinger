## ADDED Requirements

### Requirement: App shell layout
The web UI SHALL present an app shell with a sidebar (Chat, My mocks, account actions) and a top bar, styled with a shared design-token system in a light theme.

#### Scenario: Desktop navigation
- **WHEN** the viewport is 768px wide or more
- **THEN** the sidebar is permanently visible and the active section is visually highlighted

#### Scenario: Mobile navigation
- **WHEN** the viewport is narrower than 768px
- **THEN** the sidebar is hidden and opens as a drawer from a top-bar menu button, closing after a selection

#### Scenario: Logged-out user
- **WHEN** no user is logged in
- **THEN** the shell shows Log in and Sign up actions and hides My mocks

### Requirement: Chat presentation
The chat view SHALL render messages as styled bubbles with sender avatars, a polished composer, and sample-prompt chips, and SHALL show a typing indicator while a request is pending.

#### Scenario: Pending request
- **WHEN** the user sends a message and the response has not arrived
- **THEN** an animated typing indicator appears in the bot position and the send control is disabled

#### Scenario: Error reply
- **WHEN** the chat request fails
- **THEN** the bot message is shown with a distinct error style

### Requirement: Mock result card
A created mock SHALL be displayed in a card with a color-coded HTTP method badge, status pill, URL with a copy button, a syntax-highlighted pretty-printed JSON response preview, and the expiry notice for anonymous mocks.

#### Scenario: Copy URL
- **WHEN** the user clicks the copy button on the URL
- **THEN** the URL is copied to the clipboard and the button shows a transient "Copied" confirmation

#### Scenario: JSON preview available
- **WHEN** the originating prompt contains a valid JSON response body
- **THEN** the card shows it pretty-printed with distinct colors for keys, strings, numbers, booleans and null, and a copy button for the JSON

#### Scenario: JSON preview unavailable
- **WHEN** the response body cannot be parsed from the prompt
- **THEN** the card is shown without the preview and without error

### Requirement: My mocks presentation
The My mocks view SHALL list mocks with method badges, status, path, and copyable URL, and SHALL provide loading and empty states.

#### Scenario: Loading
- **WHEN** mocks are being fetched
- **THEN** skeleton placeholders are shown

#### Scenario: Empty
- **WHEN** the user has no mocks
- **THEN** an empty state explains how to create one with a button to open Chat

### Requirement: Auth screens presentation
Sign up and log in SHALL appear in a centered styled card with labeled inputs, inline error messages, and clear primary/secondary actions.

#### Scenario: Auth error
- **WHEN** authentication fails
- **THEN** the error message is shown inline in the card with error styling

### Requirement: Responsive and accessible styling
All views SHALL remain usable from 360px width, SHALL show visible keyboard focus indicators, and SHALL disable animations when the user prefers reduced motion.

#### Scenario: Small screen
- **WHEN** the viewport is 360px wide
- **THEN** no horizontal page scrolling occurs and the composer and cards fit the viewport

#### Scenario: Reduced motion
- **WHEN** the user's OS requests reduced motion
- **THEN** typing, skeleton and transition animations are disabled

### Requirement: Behavior preserved
The redesign SHALL NOT change backend APIs or existing functional behavior (chat creation, claim-on-signup, login/logout, mock listing).

#### Scenario: Claim on signup
- **WHEN** an anonymous user signs up after creating a mock
- **THEN** the mock is claimed exactly as before the redesign
