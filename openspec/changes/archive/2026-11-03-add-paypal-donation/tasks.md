## 1. Assets and Icon

- [x] 1.1 Copy `/Users/r03996/Downloads/IMG_02195F2241CC-1.jpeg` to `frontend/src/assets/paypal-qr.jpeg`
- [x] 1.2 Add a PayPal icon to `Icons` in `frontend/src/ui.tsx`

## 2. Donation UI

- [x] 2.1 Create `frontend/src/DonateDialog.tsx` using `<dialog>` with request text, QR image (alt text), and paypal.me/vazeabhishekd link (`target="_blank" rel="noopener noreferrer"`)
- [x] 2.2 Add the donation button to the `Shell` sidebar footer and wire open/close with focus return
- [x] 2.3 Add styles for the button and dialog in `frontend/src/styles.css`, responsive on mobile

## 3. Verification

- [x] 3.1 Verify button and dialog in the running app (logged out and logged in, desktop and mobile widths)
- [x] 3.2 Run frontend typecheck/build and confirm the link target is correct
