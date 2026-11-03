## Context

The frontend is a React/Vite app with a `Shell` component (sidebar with brand, nav, and footer; topbar). Icons live in `ui.tsx`. There is no router or modal component yet.

## Goals / Non-Goals

**Goals:**
- Unobtrusive, always-visible donation entry point.
- Show PayPal QR and a direct link for `@vazeabhishekd`.
- Work on mobile (sidebar is a drawer) and desktop.

**Non-Goals:**
- Payment processing, donation tracking, or PayPal SDK integration.
- Backend changes or user-specific donor state.

## Decisions

- **Placement: sidebar footer, above the account controls.** Visible on every view without cluttering the chat. Alternative: topbar button — rejected, crowded on mobile.
- **Dialog with QR + link rather than inline QR.** Keeps the sidebar compact. Implemented as a small local component using a native `<dialog>` element (accessible, Escape-to-close, no dependency).
- **Link: `https://www.paypal.me/vazeabhishekd`**, opened with `target="_blank" rel="noopener noreferrer"`. Alternative: PayPal SDK donate button — rejected as unnecessary third-party script.
- **QR as a static asset imported by Vite** (`frontend/src/assets/paypal-qr.jpeg`), hashed and bundled; includes alt text.
- **PayPal icon as inline SVG** in `Icons`, consistent with existing icons.

## Risks / Trade-offs

- [Unverified paypal.me URL] → Confirm the link resolves to the intended account before release; QR is the authoritative fallback.
- [QR image is 600x600 JPEG, personal data exposure] → Image only encodes the public PayPal profile; confirm with owner it is fine to publish.
- [Perceived nagging] → Single subtle button, no auto-popups.
