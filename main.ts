// Nightcourier entrypoint: hand in the static game and its screenshots, then
// write the judge dossier with the kit's vendored builder. Node 22, stdlib only.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const target = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function place(folder: string, into: string) {
  const source = join(here, folder);
  if (existsSync(source)) cpSync(source, join(target, into), { recursive: true });
}

mkdirSync(target, { recursive: true });
place('game', 'game');
place('screenshots', 'screenshots');

const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

const dossier = buildDossier(target, caps);
writeFileSync(join(target, 'dossier.json'), dossier);
console.log(`Nightcourier dossier: ${dossier.length} bytes`);
