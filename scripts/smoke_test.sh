#!/usr/bin/env bash
set -euo pipefail

python3 -m http.server 8000 >/tmp/rainbow_server.log 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" >/dev/null 2>&1 || true' EXIT

for _ in {1..25}; do
  if curl -fsS http://127.0.0.1:8000/index.html >/tmp/rainbow_index.html 2>/dev/null; then
    break
  fi
  sleep 0.2
done

curl -fsS http://127.0.0.1:8000/index.html >/tmp/rainbow_index.html
curl -fsS http://127.0.0.1:8000/game.js >/tmp/rainbow_game.js

rg -q 'cdn.jsdelivr.net/npm/tone' /tmp/rainbow_index.html
rg -q 'canvas-confetti' /tmp/rainbow_index.html
rg -q 'id="unicornDancer"' /tmp/rainbow_index.html
rg -q 'class="synth-pad"' /tmp/rainbow_index.html
rg -q 'function ensureToneReady' /tmp/rainbow_game.js
rg -q 'function burstConfetti' /tmp/rainbow_game.js
rg -q 'requestAnimationFrame\(songLoop\)' /tmp/rainbow_game.js
rg -q 'localStorage\.setItem' /tmp/rainbow_game.js

echo "Smoke test passed"
