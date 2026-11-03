# How to run and schedule the cleanup job

The cleanup job deletes anonymous mocks whose expiry has passed. It runs inside the app process; there is nothing extra to deploy.

## Change how often it runs

Set `CLEANUP_CRON` to a cron expression and restart the app. For example, every 15 minutes:

```bash
CLEANUP_CRON="*/15 * * * *"
```

The default is hourly (`0 * * * *`).

## Run multiple app instances

Nothing to do. Each run first takes a MySQL advisory lock named `apimocker_cleanup`; an instance that cannot get the lock skips that run.

## Confirm that it works

The app logs `cleanup removed N expired anonymous mocks` after each run that did the work. To check the database directly:

```sql
SELECT COUNT(*) FROM mocks WHERE owner_id IS NULL AND expires_at <= NOW();
```

Between runs this count may be above zero, but those mocks already return 404; see [Mock URL scheme and serving rules](../reference/mock-urls.md).

## Change the lifetime of anonymous mocks

Set `ANON_TTL_HOURS`. It applies only to mocks created afterwards.
