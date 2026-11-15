## 1. Configuration

- [x] 1.1 Add `gaMeasurementId`/`gaApiSecret` to `Config` with format validation in `config.ts`
- [x] 1.2 Document new env vars in README/docs and `.env` examples

## 2. Backend events

- [x] 2.1 Create `analytics.ts` with non-blocking, batched, timeout-bound Measurement Protocol sender (no-op when disabled)
- [x] 2.2 Emit `mock_created`, `user_registered`, `mock_served` from the relevant routes in `app.ts`
- [x] 2.3 Emit `login`, `signup_failed`, `mock_create_failed`, `rate_limited` from routes/limiters, and `mock_expired` from `cleanup.ts`
- [x] 2.4 Expose the measurement ID to the frontend via runtime config

## 3. Frontend

- [x] 3.1 Load gtag.js only when an ID is provided
- [x] 3.2 Send `page_view` on route/view changes
- [x] 3.3 Send `donate_clicked` from `DonateDialog.tsx`

## 4. Tests

- [x] 4.1 Backend tests: disabled no-op, payload has no PII, failures don't affect responses, config validation
- [x] 4.2 Run backend tests and frontend build
