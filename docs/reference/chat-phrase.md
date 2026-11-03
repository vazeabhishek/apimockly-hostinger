# Reference: chat phrase grammar

```
[setup a mock api] METHOD /path [which] returns <json> [with status <code>]
```

| Part | Rules |
|---|---|
| `setup a mock api` | Optional. Also accepted: `set up mock api`. Case-insensitive. |
| `METHOD` | `GET`, `POST`, `PUT`, `PATCH` or `DELETE`. Case-insensitive. |
| `/path` | Must start with `/`. Allowed characters: letters, digits, `- . _ ~ / %`. Max 200 characters. No spaces, query string (`?`) or fragment (`#`). |
| `which` | Optional filler word. |
| `returns` | Required keyword. |
| `<json>` | Valid JSON (object, array, string, number, boolean or null). May span multiple lines. Max size is `MAX_BODY_BYTES` (default 10240 bytes). |
| `with status <code>` | Optional. Three-digit code from 200 to 599. Default 200. |

## Examples

```
setup a mock api GET /integer/30 which returns {"value": 30}
POST /orders returns {"error": "invalid"} with status 422
get /users/1 which returns {"id": 1, "name": "Ada"}
```

## Errors

Each failed message creates nothing and gets one of these replies:

| Cause | Reply (summary) |
|---|---|
| Message does not match the grammar | "I couldn't understand that." plus the format |
| Unsupported method | Lists the supported methods |
| Invalid path | Describes the path rules |
| Status outside 200–599 | "The status code must be between 200 and 599." |
| Body is not valid JSON | "The response body is not valid JSON." |
| Body too large | States the maximum in bytes |

A status of 204 or 304 is served with an empty body.
