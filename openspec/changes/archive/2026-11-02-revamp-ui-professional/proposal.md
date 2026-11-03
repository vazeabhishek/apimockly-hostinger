## Why

The current UI is a single centered column with a 26-line stylesheet, default fonts and a plain table. It looks unfinished and undermines trust in the product. A modern SaaS-style interface (clean, light, subtle gradients, Linear/Vercel feel) makes the tool look professional and easier to use.

## What Changes

- Introduce a design-token system (colors, spacing, radii, shadows, typography) in hand-written CSS; no new dependencies.
- Replace the single-column layout with an app shell: left sidebar (Chat, My mocks, account) plus a top bar; sidebar collapses to a drawer on mobile.
- Restyle chat: message bubbles with avatars, typing indicator and loading skeletons while a mock is being created, polished composer and sample-prompt chips.
- Mock result card: method badge (color per HTTP method), status pill, copy-to-clipboard for URL, syntax-highlighted JSON response preview (parsed client-side from the user's prompt), refined expiry notice.
- My mocks: card/table redesign with method badges, copy buttons, empty and loading states.
- Auth screens: centered card with polished inputs, errors and buttons.
- Responsive/mobile polish across all views.
- Visual only: no backend, API, or behavior changes. Light theme only.

## Capabilities

### New Capabilities
- `web-ui-design`: Visual and interaction requirements for the web frontend (app shell, design tokens, chat presentation, mock result card with JSON preview and copy actions, loading states, responsive behavior).

### Modified Capabilities

## Impact

- `frontend/src/styles.css` (rewritten), `App.tsx` (split into shell/chat components), `MyMocks.tsx`, `AuthForm.tsx`, new small components (method badge, JSON preview, copy button, icons).
- `frontend/index.html` (font/meta). No new npm dependencies; JSON highlighting is hand-written.
- Existing frontend tests (if any) may need selector updates. Backend and API untouched.
