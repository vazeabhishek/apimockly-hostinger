# Explanation: security trade-offs

API Mocker has a public, unauthenticated write endpoint and hosts arbitrary JSON on your domain. That is the main risk, and these are the mitigations and what they cost.

| Risk | Mitigation | Trade-off |
|---|---|---|
| Spam creation filling the database | Per-IP rate limit, per-IP cap on live anonymous mocks, 24h expiry | Shared IPs (offices, NAT) share the cap |
| Using the domain for phishing or XSS | Responses are always `application/json` with `X-Content-Type-Options: nosniff` and `Content-Security-Policy: sandbox` | Users cannot mock HTML or other content types |
| Huge payloads | Body size limit on creation | Large fixtures are not supported |
| Brute-forcing accounts | Rate limit on auth endpoints, scrypt password hashing, identical error for unknown email and wrong password | Duplicate-email sign-up still reveals that an email exists |
| Storing IPs | Only a salted SHA-256 of the IP is stored | Rotating `SESSION_SECRET` resets anonymous caps |
| Session theft | Signed, HTTP-only, SameSite=Lax cookie; `Secure` when served over HTTPS | The cookie holds only the user ID, signed; there is no server-side revocation |

## Known gaps

- Mocks are publicly readable by anyone with the URL; do not put secrets in them.
- Responses carry no CORS headers, so browsers on other origins cannot call mocks directly.
- Behind a proxy, correct limits depend on `TRUST_PROXY` being set only when the proxy sets the client IP header; see [Configure limits](../how-to/configure-limits.md).
