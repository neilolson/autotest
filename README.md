# Rainbow Beat Ranch Guardians Prototype

A kid-friendly browser prototype that combines:
- **Build Mode** (decorate a unicorn + rabbit ranch)
- **Dance Mode** (3-lane rhythm mini-game)
- **Quest loop** (simple goals with reward stars)

## Do I need all files on my PC?

You should keep these files together in one folder:
- `index.html`
- `style.css`
- `game.js`
- `README.md` (optional for play, useful for instructions)
- `scripts/smoke_test.sh` (optional for testing)

`unicorn_game_ideas.md` is design documentation only (not required to run the game).

## Run locally

From the project folder:

```bash
python3 -m http.server 8000
```

Then open:

`http://localhost:8000/index.html`

## Controls

- Build Mode: click/tap the ranch to place the selected item.
- Dance Mode keyboard: press `A`, `S`, `D` as notes reach the hit line.
- Dance Mode touch: use the large `A`, `S`, `D` buttons.
- Chill Mode: toggles slower/easier note timing.

## How to test locally

### Quick manual test
1. Start the local server.
2. Open the URL in browser.
3. Place 3+ items in Build Mode and verify quest progress updates.
4. Switch to Dance Mode and start a song.
5. Hit notes with keyboard or touch buttons.
6. Confirm stars/hearts/gloom/quest progress change.

### Automated smoke test

```bash
./scripts/smoke_test.sh
```

This verifies that key UI ids and gameplay functions are present in served files.

## Progression

- You earn Star Notes, Friend Hearts, and Rainbow Keys while playing.
- More songs unlock from successful dance sessions.
- Build items unlock with in-game Star Notes only.
- The **Gloom Meter** tracks ranch danger; dance/build actions can restore joy.
- Quests grant bonus Star Notes when completed.
- Progress is saved in your browser (`localStorage`).

## Monetization Policy

All unlockables are earned in game through play. There are no payments, no premium pass, and no microtransactions.
