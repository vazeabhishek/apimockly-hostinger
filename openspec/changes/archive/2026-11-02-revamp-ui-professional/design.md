## Context

The frontend is React 19 + Vite with one 26-line `styles.css`; `App.tsx` mixes header, chat, and routing (`view` state). There are no UI libraries and no frontend tests. `MockInfo` has no response body. The user chose: modern light SaaS look, hand-written CSS with tokens, sidebar app shell, and visual-only scope.

## Goals / Non-Goals

**Goals:**
- Professional, consistent look via design tokens and a small set of reusable components.
- Sidebar + top bar shell, responsive down to ~360px.
- JSON preview with syntax highlighting, copy buttons, method badges, typing indicator and skeletons.

**Non-Goals:**
- Dark mode, new dependencies, backend/API changes, new routes or features, changing the in-memory `view` navigation.

## Decisions

- **Plain CSS with custom properties** in `styles.css` (`:root` tokens for color, spacing, radius, shadow, font sizes). Alternatives (Tailwind, component libs) rejected per user choice and to avoid dependencies.
- **System font stack with Inter first** (no web-font download) to keep it offline-friendly; monospace stack for code.
- **Component split:** `Shell` (sidebar, top bar, mobile drawer), `Chat`, `MockCard`, `MethodBadge`, `JsonPreview`, `CopyButton`, `Icons` (inline SVG). `App.tsx` retains state and `send` logic, unchanged behavior.
- **JSON preview source:** parse the JSON object from the user's prompt text client-side (text between "returns" and optional "with status"); if it fails to parse, show it raw/omit. Avoids backend changes; pretty-printed and tokenized by a small hand-written highlighter (keys, strings, numbers, booleans, null) that renders React nodes (no `dangerouslySetInnerHTML`).
- **Typing indicator:** a bot-bubble with animated dots while `busy`, plus a skeleton card; My mocks shows skeleton rows while loading.
- **Responsive:** sidebar becomes an off-canvas drawer under 768px toggled by a top-bar menu button; tables become stacked cards.
- **Accessibility:** visible focus rings, `aria-label`s on icon buttons, `prefers-reduced-motion` disables animations, AA contrast for badges.

## Risks / Trade-offs

- [Prompt parsing misses edge cases] → fall back gracefully to no preview; never block the card.
- [Large CSS hand-written, inconsistency] → enforce tokens only, no hard-coded colors outside `:root`.
- [Refactor of App.tsx regresses behavior] → keep state/handlers intact; verify manually (chat, claim-on-signup, login/logout, mocks list) and `npm run build`.

## Migration Plan

Frontend-only; ship by rebuilding (`npm run build`). Rollback by reverting the frontend files.

## Open Questions

- Product logo/name styling: use a simple text wordmark with an inline SVG mark unless a brand asset is provided.
