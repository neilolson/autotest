# Rainbow Beat Ranch Guardians Prototype

A kid-friendly browser prototype that combines:
- **Build Mode** (decorate a unicorn + rabbit ranch)
- **Dance Mode** (3-lane rhythm mini-game)

## Run

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html`.

## Controls

- Build Mode: click/tap the ranch to place the selected item.
- Dance Mode keyboard: press `A`, `S`, `D` as notes reach the hit line.
- Dance Mode touch: use the large `A`, `S`, `D` buttons.
- Chill Mode: toggles slower/easier note timing.

## Progression

- You earn Star Notes, Friend Hearts, and Rainbow Keys while playing.
- More songs unlock from successful dance sessions.
- Build items unlock with in-game Star Notes only.
- The **Gloom Meter** tracks ranch danger; dance/build actions can restore joy.
- Progress is saved in your browser (`localStorage`).

## Testing

Run the smoke test:

```bash
./scripts/smoke_test.sh
```

## Monetization Policy

All unlockables are earned in game through play. There are no payments, no premium pass, and no microtransactions.
