# Visitor ping

Pings Telegram or WhatsApp when someone opens the site.

The notification is the words **"Someone dropped by"** and nothing else — no IP, no
location, no network, no referrer, not even the page path.

The Worker unavoidably receives the visitor's IP, because it arrives with the
connection as it does for any server, but it is never transmitted and never logged.
It is hashed once with a secret, daily-rotating salt and used only to avoid pinging
you four times for one person reading four pages.

The secret matters: IPv4 is only 2^32 addresses, so a hash salted with a
publicly-known value can be brute-forced in seconds. Set `HASH_SALT` to a random
value and it cannot be:

```sh
python3 -c "import secrets;print(secrets.token_hex(32))" | npx wrangler secret put HASH_SALT
```

Bots are dropped — most traffic to a personal site is automated, and without the
filter your phone is unusable.

## Setup

Three senders. The Worker uses whichever secrets are set, preferring Telegram,
then CallMeBot, then Meta.

### 1. Telegram — recommended

Two minutes, no approval, and no sending window.

1. Message **@BotFather**, send `/newbot`, follow the prompts. It gives you a
   token like `8123456789:AAH...`.
2. Open a chat with your new bot and send it anything — a bot cannot message you
   until you have started the conversation.
3. Get your chat id:

   ```sh
   curl -s "https://api.telegram.org/bot<TOKEN>/getUpdates" | grep -o '"id":[0-9-]*' | head -1
   ```

That id and the token are the two secrets.

### 1a. WhatsApp — CallMeBot

1. Add **+34 644 51 95 23** to your contacts.
2. Send it: `I allow callmebot to send me messages`
3. It replies with an API key.

### 1b. WhatsApp — Meta Cloud API (official)

Create a Meta app with the WhatsApp product, note the phone number ID, and issue a
permanent token. More setup, and note that free-form messages only deliver inside a
24-hour window — after an idle spell you need an approved template instead.

### 2. Deploy

```sh
cd worker
npx wrangler login

# Telegram:
npx wrangler secret put TELEGRAM_TOKEN
npx wrangler secret put TELEGRAM_CHAT_ID

# …or WhatsApp:
# npx wrangler secret put WHATSAPP_TO        # 41791234567 — no +, no spaces
# npx wrangler secret put CALLMEBOT_APIKEY   # or META_TOKEN + META_PHONE_ID

npx wrangler deploy
```

Switching later means setting different secrets and redeploying — the site does
not change.

Wrangler prints the Worker URL.

### 3. Turn it on

Put that URL in `src/config.ts` as `pingEndpoint`, then push. Until it is set, the
beacon is not emitted and the footer notice does not render — the feature is
entirely inert.

## Tuning

In `worker/src/index.js`:

- `DEDUP_HOURS` — one ping per visitor per this many hours. Default 6.
- `HONOUR_DNT` — set false to ping regardless of Do-Not-Track.
- `BOT_RE` — add patterns if something noisy gets through.

## Cost

Cloudflare Workers' free tier is 100k requests/day. A personal site will not
approach it.
