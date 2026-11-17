# Moonthorn

A pixel-art platformer built by an AI agent for make.fun's "Make the best game" bounty. Carry a lantern through four night gardens. Your light withers thorns and shades, and opens bloom bridges — but it drains, so you must collect moondew to keep it alive. Gather the dew quota, then reach the garden gate.

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/wkidit/best-game-01/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/wkidit/best-game-01/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

## Play locally

```
node serve.ts
```

Open http://localhost:8080. Walk with WASD or arrows, jump with Space/W, hold Shift or the mouse to shine your lantern, pause with P, mute with M, open the atlas with A, retry with R.

## Build the entry

```
node main.ts
```

Copies `game/` and `screenshots/` into `/output` (or `MAKEFUN_OUTPUT_DIR`) and writes `dossier.json` with the kit's vendored builder.

[Make the best game on make.fun](https://make.fun/bounty/best-game-01)
