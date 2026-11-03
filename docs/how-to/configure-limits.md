# How to configure limits

All limits are environment variables; restart the app after changing them. Defaults and meanings are in [Configuration](../reference/configuration.md).

| Goal | Variable |
|---|---|
| Allow larger response bodies | `MAX_BODY_BYTES` |
| Allow more mock creations per minute per IP | `CREATE_RATE_PER_MIN` |
| Allow more calls to mocks per minute per IP | `SERVE_RATE_PER_MIN` |
| Allow more live anonymous mocks per IP | `ANON_CAP_PER_IP` |

Example: allow 50 KB bodies and 20 anonymous mocks per IP.

```bash
MAX_BODY_BYTES=51200 ANON_CAP_PER_IP=20 node backend/dist/server.js
```

The chat endpoint itself accepts requests up to 16 KB, so bodies larger than that cannot be created regardless of `MAX_BODY_BYTES`.

## Behind a reverse proxy

Limits are per client IP. Behind a proxy or load balancer, set `TRUST_PROXY=true` so the real client IP (from `X-Forwarded-For`) is used. Only do this if the proxy overwrites that header; otherwise clients can spoof their IP and dodge the limits.
