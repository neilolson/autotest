# Rainbow Beat Ranch Guardians Prototype

A kid-friendly browser prototype that combines:
- **Build Mode** (decorate a unicorn + rabbit ranch)
- **Dance Mode** (3-lane rhythm mini-game)
- **Synth Jam** (child-made rhythm on keyboard)
- **Quest loop** (simple goals with reward stars)

## Free resources integrated

To improve graphics/audio/game feel, this prototype uses:
- **Tone.js** (free, open-source): richer synth sound.
- **canvas-confetti** (free, open-source): celebration effects.
- **Google Fonts** (`Nunito` + `Press Start 2P`) for kid-friendly + voxel UI modes.

## Art direction recommendation (voxel vs other free styles)

For a 5-year-old, **storybook/sticker** is usually best as the default.

- **Storybook**: soft, clear, calm.
- **Sticker**: bold and playful.
- **Voxel**: fun alternative, more blocky retro look.

This build has a real **Art** selector and all three modes are fully implemented in CSS + gameplay rendering (no placeholder art mode logic).

## New improvements in this version

- Achievements + milestone star rewards (real gameplay unlock logic).
- Real Storybook / Sticker / Voxel visual modes.
- Art mode changes also re-render existing placed ranch items.
- Persistent art settings in local save.
- Combo + best combo + accuracy HUD.
- Timing Offset slider for per-device rhythm calibration.
- Live timing judgement feedback (Perfect/Great/Good) and bonus stars on Perfect hits.
- Hit line now moves visually with Timing Offset so calibration is visible and accurate.
- Bunny dancer now reacts with the unicorn for richer stage feel.
- New **Power Move** button in Dance Mode that spends a Rainbow Key to clear up to 5 nearby notes.
- New **Practice Loop** toggle to auto-restart the current song for repeated rhythm practice.
- Live miss feedback now appears during songs to help kids recover quickly.
- Pause/Resume and Auto-Assist options.

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
- Pause/Resume: `Space` (or Pause button)
- Power Move: button in Dance Mode (costs 1 Rainbow Key)
- Toggles: Chill, Auto-Assist, Big Buttons, Mute, Practice Loop, Art Mode

## Local testing

### Manual test
1. Start server and open URL.
2. Place a few decorations.
3. Switch Art mode between Storybook, Sticker, Voxel and verify ranch items + UI style update each time.
4. Start a song; test rhythm, synth, and pause.
5. Refresh page and verify settings/progress persist.
6. Move **Timing Offset** slider if hits feel early/late and verify the readout updates.

### Smoke test

```bash
./scripts/smoke_test.sh
```

## Monetization policy

All unlockables are earned in-game through play. No payments, premium pass, or microtransactions.
