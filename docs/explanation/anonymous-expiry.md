# Explanation: the anonymous expiry model

Anyone can create a mock without an account, which removes friction but invites clutter and abuse. The expiry model balances the two.

## The rules

- An anonymous mock has exactly one route and lives 24 hours (configurable).
- Each chat message creates a new mock with a new ID; nothing links one anonymous mock to the next.
- Signing up while the page that created the mock is still open makes that mock permanent.
- Signed-in users can create any number of permanent mocks.

## Why expiry is enforced twice

The cleanup job removes expired rows only periodically. So the serving handler also treats a row as missing once `expires_at` has passed. Clients never see a mock that is past its lifetime, whatever the job's schedule.

## Why there is no cookie or localStorage for anonymous users

This was a deliberate trade-off for simplicity and privacy: no anonymous identity to store, nothing to track. The consequence is that the browser forgets the mock when the page is refreshed, and an unclaimed mock cannot be attached to an account afterwards. Users in that situation recreate the mock, which takes one sentence. The UI warns about this next to the sign-up prompt.

## Why sign-up is the incentive

Expiry is a gentle nudge: the tool is useful immediately, and an account is the answer to "I want to keep this". See [how to keep a mock](../how-to/claim-a-mock.md) and [the cleanup job](../how-to/run-cleanup-job.md).
