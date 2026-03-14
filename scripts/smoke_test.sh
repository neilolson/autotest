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
curl -fsS http://127.0.0.1:8000/style.css >/tmp/rainbow_style.css

rg -q 'id="graphicsMode"' /tmp/rainbow_index.html
rg -q 'id="achievements"' /tmp/rainbow_index.html
rg -q 'id="timingOffset"' /tmp/rainbow_index.html
rg -q 'id="judgeStatus"' /tmp/rainbow_index.html
rg -q 'id="missStatus"' /tmp/rainbow_index.html
rg -q 'id="bunnyDancer"' /tmp/rainbow_index.html
rg -q 'id="powerMove"' /tmp/rainbow_index.html
rg -q 'id="practiceLoop"' /tmp/rainbow_index.html
rg -q 'option value="storybook"' /tmp/rainbow_index.html
rg -q 'option value="sticker"' /tmp/rainbow_index.html
rg -q 'option value="voxel"' /tmp/rainbow_index.html

rg -q 'graphics-storybook' /tmp/rainbow_style.css
rg -q 'graphics-sticker' /tmp/rainbow_style.css
rg -q 'graphics-voxel' /tmp/rainbow_style.css
rg -q -- '--timing-offset' /tmp/rainbow_style.css
rg -q 'miss-caption' /tmp/rainbow_style.css

rg -q 'function styleEmojiForMode' /tmp/rainbow_game.js
rg -q 'function renderRanchFromState' /tmp/rainbow_game.js
rg -q 'function renderAchievements' /tmp/rainbow_game.js
rg -q 'function checkAchievements' /tmp/rainbow_game.js
rg -q 'function updateJudgeStatus' /tmp/rainbow_game.js
rg -q 'function usePowerMove' /tmp/rainbow_game.js
rg -q 'function updateActionButtons' /tmp/rainbow_game.js
rg -q "state\.practiceLoop = el\.practiceLoop\.checked" /tmp/rainbow_game.js
rg -q "state\.graphicsMode = el\.graphicsMode\.value" /tmp/rainbow_game.js
rg -q "state\.timingOffset = Number\(el\.timingOffset\.value\)" /tmp/rainbow_game.js
rg -q 'localStorage\.setItem' /tmp/rainbow_game.js

echo "Smoke test passed"
