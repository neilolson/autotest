# Rainbow Beat Ranch Guardians Prototype

A kid-friendly browser prototype that combines:
- **Build Mode** (decorate a unicorn + rabbit ranch)
- **Dance Mode** (3-lane rhythm mini-game)
- **Synth Jam** (child-made rhythm on keyboard)
- **Quest loop** (simple goals with reward stars)

## Files you need on your PC

To **run the game**, keep these in the same folder:
- `index.html`
- `style.css`
- `game.js`

Optional but recommended:
- `README.md` (instructions)
- `scripts/smoke_test.sh` (quick automated check)
- `unicorn_game_ideas.md` (design notes only)

## Run locally

```bash
python3 -m http.server 8000
```

Open in browser:

`http://localhost:8000/index.html`

## Controls

- Build Mode: click/tap the ranch to place the selected item.
- Dance Mode keys: `A`, `S`, `D`.
- Synth Jam keys: `J`, `K`, `L`.
- Touch: use on-screen rhythm and synth buttons.
- Chill Mode: easier timing.

## Smooth gameplay notes

- The rhythm track uses `requestAnimationFrame` for smoother movement.
- Synth notes are generated in-browser with Web Audio (no external files).
- Unicorn dancer reacts to rhythm/synth hits with visual animations.

## Local testing

### 1) Manual playtest
1. Start server and open the game URL.
2. Place a few decorations and verify quest progress changes.
3. Start a song and hit `A/S/D` on beat.
4. Press `J/K/L` to play synth notes and watch unicorn dance feedback.
5. Confirm stars/hearts/gloom update and saves persist on refresh.

### 2) Smoke test

```bash
./scripts/smoke_test.sh
```

## Monetization policy

All unlockables are earned in game through play. There are no payments, no premium pass, and no microtransactions.
