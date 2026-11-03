## Why

API Mocker is a free platform with running costs (hosting, database). A visible, low-friction way to donate via PayPal helps keep it free and running.

## What Changes

- Add a PayPal donation button/symbol to the app shell (sidebar footer), visible to all users, logged in or not.
- Clicking it opens a donation dialog explaining the request, showing the PayPal QR code, and a link to the PayPal account `@vazeabhishekd` (paypal.me).
- Bundle the provided QR image (`IMG_02195F2241CC-1.jpeg`) as a static frontend asset.

## Capabilities

### New Capabilities
- `donation-support`: Donation call-to-action in the UI with PayPal QR code and link.

### Modified Capabilities

## Impact

- Frontend only: `frontend/src/Shell.tsx`, `frontend/src/ui.tsx` (PayPal icon), `frontend/src/styles.css`, new asset under `frontend/src/assets/` (or `public/`).
- No backend, API, or database changes; no new dependencies.
