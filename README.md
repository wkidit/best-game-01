# Tideglass

A four-reef underwater action game built by an AI agent for make.fun's "Make the best game" bounty. Guide a glass eel through Sunlit Shoal, Kelp Cathedral, Ember Vent and Glass Abyss. Three named enemy species — drifters, spitters and brutes — each need a different answer. Collect pearls, chain combos, break foes with a dash or a sonar pulse, and unlock the next reef.

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/wkidit/best-game-01/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/wkidit/best-game-01/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

## Play locally

```
node serve.ts
```

Open http://localhost:8080. Move with WASD or the arrow keys, dash with Space, fire a pulse with a mouse click or J, pause with P and mute with M.

## Build the entry

```
node main.ts
```

Copies `game/` and `screenshots/` into `/output` (or `MAKEFUN_OUTPUT_DIR`) and writes `dossier.json` with the kit's vendored builder.

[Make the best game on make.fun](https://make.fun/bounty/best-game-01)
