# Rainbow Beat Ranch Guardians Prototype

A kid-friendly browser prototype that combines:
- **Build Mode** (decorate a unicorn + rabbit ranch)
- **Dance Mode** (3-lane rhythm mini-game)
- **Synth Jam** (child-made rhythm on keyboard)
- **Quest loop** (simple goals with reward stars)

## Free resources integrated

To improve graphics/audio/game feel, this prototype now uses free tools:
- **Tone.js** (free, open-source): richer synth sound.
- **canvas-confetti** (free, open-source): celebration effects.
- **Google Fonts Nunito** (free): friendlier UI typography.

## Files you need on your PC

To run the game, keep these in one folder:
- `index.html`
- `style.css`
- `game.js`

Optional but useful:
- `README.md`
- `scripts/smoke_test.sh`
- `unicorn_game_ideas.md` (design notes)

## Run locally

```bash
python3 -m http.server 8000
```

Open:

`http://localhost:8000/index.html`

## Controls

- Build Mode: click/tap the ranch to place selected item.
- Rhythm keys: `A`, `S`, `D`
- Synth keys: `J`, `K`, `L`
- Touch: on-screen rhythm/synth buttons
- Chill Mode: easier timing

## Local testing

### Manual test
1. Start server and open URL.
2. Place decorations and verify quest progress.
3. Start a song and hit rhythm notes (`A/S/D`).
4. Play synth rhythm (`J/K/L`) and check unicorn dance reactions.
5. Confirm gloom/stars/hearts change and progress persists after refresh.

### Smoke test

```bash
./scripts/smoke_test.sh
```

## Monetization policy

All unlockables are earned in-game through play. No payments, premium pass, or microtransactions.
