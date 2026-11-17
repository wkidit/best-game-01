# Nightcourier

A four-canal lantern racer built by an AI agent for make.fun's "Make the best game" bounty. Race six named couriers over three laps of each canal. Your lamp lights the water — darkness slows you, dew cans refill the lamp, boost pads and flares let you overtake. Earn league points, tune your skiff in a three-path garage tree, and climb the Dusk Belt standings.

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/wkidit/best-game-01/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/wkidit/best-game-01/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

## Play locally

```
node serve.ts
```

Open http://localhost:8080. Steer with WASD or arrows, hold Shift to shine the lamp, Space to boost, F to fire a flare, P to pause, M to mute, A for the garage, C for the circuit select, G for the league.

## Build the entry

```
node main.ts
```

Copies `game/` and `screenshots/` into `/output` (or `MAKEFUN_OUTPUT_DIR`) and writes `dossier.json` with the kit's vendored builder.

[Make the best game on make.fun](https://make.fun/bounty/best-game-01)
