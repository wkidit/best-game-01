// Ember Drift entrypoint. Copies the finished static game and its real browser
// screenshots into the grader's output directory, then writes the judge dossier
// with the kit's vendored builder. Standard library only; no build step.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const target = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function place(folder: string, destination: string) {
  const source = join(here, folder);
  if (!existsSync(source)) return;
  cpSync(source, join(target, destination), { recursive: true });
}

mkdirSync(target, { recursive: true });
place('game', 'game');
place('screenshots', 'screenshots');

const limits = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

writeFileSync(join(target, 'dossier.json'), buildDossier(target, limits));
console.log(`Ember Drift handed in at ${target}`);
