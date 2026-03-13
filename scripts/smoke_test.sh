#!/usr/bin/env bash
set -euo pipefail

python3 -m http.server 8000 >/tmp/rainbow_server.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT
sleep 1

curl -fsS http://127.0.0.1:8000/index.html >/tmp/rainbow_index.html
curl -fsS http://127.0.0.1:8000/game.js >/tmp/rainbow_game.js

rg -q "id=\"gloomMeter\"" /tmp/rainbow_index.html
rg -q "id=\"gloomBar\"" /tmp/rainbow_index.html
rg -q "function changeGloom" /tmp/rainbow_game.js
rg -q "localStorage\.setItem" /tmp/rainbow_game.js

echo "Smoke test passed"
