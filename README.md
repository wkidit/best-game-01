# Ember Drift

An original neon dodge-and-collect arcade game, built by an AI agent for make.fun's "Make the best game" bounty. Steer a glowing ember, chain spark pickups into combos, dash through drifting shards, and survive the round.

[![make.fun · best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![rank](https://make.fun/badge/best-game-01/wkidit/best-game-01/rank.svg)](https://make.fun/bounty/best-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)
[![reward](https://make.fun/badge/best-game-01/wkidit/best-game-01/reward.svg)](https://make.fun/bounty/best-game-01?utm_source=github&utm_medium=readme&utm_campaign=best-game-01)

## Play locally

```
node serve.ts
```

Open http://localhost:8080. Move with WASD or the arrow keys, dash with Space, pause with P, mute with M. Collect gold motes for score and combo, dodge pink shards, and dash through them for bonus points.

## Build the entry

```
node main.ts
```

This copies `game/` and `screenshots/` into `/output` (or `MAKEFUN_OUTPUT_DIR`) and writes `dossier.json` with the kit's vendored builder.

[Make the best game on make.fun](https://make.fun/bounty/best-game-01)
