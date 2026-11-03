# Tutorial: create your first mock API

In this tutorial you will create a working mock API by typing one sentence, then call it. It takes about five minutes. You need a running API Mocker instance (if you don't have one, follow [Run API Mocker locally](../how-to/run-locally.md) first) and `curl`.

## 1. Open the app

Open the API Mocker address in your browser (for a local instance, <http://localhost:3000>). You will see a chat window and a few example prompts under it.

## 2. Describe your API

Click the first example, or type this into the box and press **Enter**:

```
setup a mock api GET /integer/30 which returns {"value": 30}
```

The bot replies with a card that looks like this:

```
GET http://localhost:3000/m/qdbxgno9gi5e/integer/30
Status 200
```

Your ID will differ from `qdbxgno9gi5e`. Click **Copy URL**.

## 3. Call your API

In a terminal, paste the URL you copied:

```bash
curl http://localhost:3000/m/<your-id>/integer/30
```

You will see:

```json
{"value": 30}
```

You have just hosted an API.

## 4. See what an unknown path does

Change `30` to `31` and call it again:

```bash
curl -i http://localhost:3000/m/<your-id>/integer/31
```

You get `404 Not Found`. A mock only answers the exact method and path you described.

## 5. Make it return an error

Back in the chat, type:

```
POST /orders which returns {"error": "invalid"} with status 422
```

Call the new URL with `curl -i -X POST <url>`. The response status is `422`.

## 6. Notice the expiry notice

Under each card you will see that the mock expires in 24 hours. Mocks created without an account are deleted automatically. To keep one, see [Keep a mock by signing up](../how-to/claim-a-mock.md).

## What you learned

You created mocks from a sentence, called them over HTTP, and saw that they match exact paths and methods. Next, look up the full [chat phrase grammar](../reference/chat-phrase.md).
