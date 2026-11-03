## 1. Design foundation

- [x] 1.1 Rewrite `styles.css` with design tokens (colors, spacing, radii, shadows, type) and base/reset styles, buttons, inputs, focus rings
- [x] 1.2 Update `index.html` (title, meta theme-color, viewport) and add `prefers-reduced-motion` rules

## 2. Shared components

- [x] 2.1 Add inline-SVG `Icons` (logo, chat, list, menu, copy, check, send, user)
- [x] 2.2 Add `MethodBadge` with per-method colors and status pill
- [x] 2.3 Add `CopyButton` with transient "Copied" state
- [x] 2.4 Add `JsonPreview` with hand-written tokenizer rendering React nodes (keys, strings, numbers, booleans, null) and a helper to parse the JSON body from the prompt text

## 3. App shell and chat

- [x] 3.1 Create `Shell` (sidebar, top bar, mobile drawer, account actions) and wire `App.tsx` view state to it without changing handlers
- [x] 3.2 Restyle chat: bubbles with avatars, typing indicator while `busy`, composer, sample chips
- [x] 3.3 Build `MockCard` (method badge, status pill, URL + copy, JSON preview, expiry notice) and use it in chat

## 4. Other views

- [x] 4.1 Redesign `MyMocks` with badges, copy buttons, skeleton loading, empty state with "Open chat" button, mobile stacked layout
- [x] 4.2 Redesign `AuthForm` as centered card with labels, inline error, primary/secondary actions

## 5. Verify

- [x] 5.1 Run `npm run build` in `frontend` (type-check passes)
- [x] 5.2 Manually verify chat creation, claim-on-signup, login/logout, mocks list, and layout at 360px and desktop widths
