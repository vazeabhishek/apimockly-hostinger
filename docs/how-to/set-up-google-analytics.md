# How to set up Google Analytics

API Mocker can report usage to Google Analytics 4 (GA4): page views in the web UI, plus server-side events such as mocks created and users registered. Analytics is **off** unless you configure the keys below.

## What you need

| Value | Where to get it | Env variable | Enables |
|---|---|---|---|
| Measurement ID, like `G-ABC123XYZ` | GA4 → Admin → Data streams → your web stream | `GA_MEASUREMENT_ID` | Browser page views |
| Measurement Protocol API secret | Same data stream → Measurement Protocol API secrets → Create | `GA_API_SECRET` | Server-side events (needs the ID too) |

The API secret is a secret: keep it on the backend only. It is never sent to the browser. The measurement ID is public and is served to the UI via `/api/config`.

## Steps

1. In [Google Analytics](https://analytics.google.com), create a GA4 property and a **Web** data stream using your public URL.
2. Copy the **Measurement ID** from the stream details.
3. In the same stream, open **Measurement Protocol API secrets**, click **Create**, name it (e.g. `apimocker-server`) and copy the secret value.
4. Put both in the backend's environment, in `backend/.env.production` (or `backend/.env` for local testing):
   ```bash
   GA_MEASUREMENT_ID=G-ABC123XYZ
   GA_API_SECRET=your-secret-value
   ```
   Or set them as environment variables in your hosting platform; real environment variables override file values. The backend reads these files from its working directory (see [Configure for production](configure-production.md)).
5. Restart the backend. The frontend needs no build-time setting: it fetches the ID at runtime.

## Check it worked

- `curl http://localhost:3000/api/config` returns `{"gaMeasurementId":"G-ABC123XYZ"}`.
- In GA4 open **Reports → Realtime**, then load the site, create a mock and sign up. You should see `page_view`, `mock_created` and `user_registered`. Server events can take a few seconds to batch (flushed every 10 s).
- Startup fails with `GA_MEASUREMENT_ID must look like G-XXXXXXXX` if the ID is malformed (e.g. an old `UA-` ID).

## Events sent

| Event | Source | Parameters |
|---|---|---|
| `page_view` | Browser | `page_title`, `page_path` |
| `donate_clicked` | Browser | none |
| `mock_created` | Server | `source`, `owner` (`anon`/`user`) |
| `mock_served` | Server | `method`, `status_class` (`2xx`/`4xx`/`5xx`) |
| `user_registered`, `login` | Server | none |
| `signup_failed` | Server | `reason` |
| `mock_create_failed` | Server | `reason` |
| `rate_limited` | Server | `kind` (`create`/`serve`) |
| `mock_expired` | Server | `count` |

No emails, IP addresses, mock paths or bodies are sent.

## See the numbers in GA4

- Counts per event: **Reports → Engagement → Events** (e.g. `mock_created`, `user_registered`).
- To break down by a parameter (`owner`, `status_class`, `reason`…), register it first: **Admin → Custom definitions → Create custom dimension** with scope *Event* and the parameter name.
- Mark `mock_created` and `user_registered` as key events (Admin → Events) to track them as conversions.
- Traffic volume: `mock_served` event count over time.

## Privacy

GA4 sets cookies in the browser. Depending on your region you may need a consent notice before loading analytics; API Mocker does not ship one.
