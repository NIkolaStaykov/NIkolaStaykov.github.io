#!/usr/bin/env bash
# Send yourself a Telegram message from the command line.
#
#   ./notify.sh "build finished"
#   echo "training done" | ./notify.sh
#   ./notify.sh "$(tail -5 train.log)"
#
# Reads the token from ../telegram_token.txt (gitignored). Override with
# TELEGRAM_TOKEN / TELEGRAM_CHAT_ID in the environment.
set -euo pipefail

TOKEN="${TELEGRAM_TOKEN:-$(tr -d ' \t\n\r' < "$(dirname "$0")/../telegram_token.txt")}"
CHAT_ID="${TELEGRAM_CHAT_ID:-8001700798}"

TEXT="${1:-$(cat)}"
[ -n "$TEXT" ] || { echo "nothing to send" >&2; exit 1; }

curl -sS --max-time 20 -X POST \
  "https://api.telegram.org/bot${TOKEN}/sendMessage" \
  -H 'Content-Type: application/json' \
  --data-raw "$(TEXT="$TEXT" CHAT_ID="$CHAT_ID" python3 -c '
import json, os
print(json.dumps({"chat_id": int(os.environ["CHAT_ID"]), "text": os.environ["TEXT"]}))')" \
  | python3 -c 'import sys,json; d=json.load(sys.stdin); print("sent" if d.get("ok") else "failed: "+str(d.get("description")))'
