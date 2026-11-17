// Tideglass entrypoint for best-game-01: hand in the static game and its
// screenshots, then write the dossier the judge reads. Node 22, stdlib only.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const rootDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyIfPresent(folder: string, into: string) {
  const from = join(rootDir, folder);
  if (existsSync(from)) cpSync(from, join(outputDir, into), { recursive: true });
}

mkdirSync(outputDir, { recursive: true });
copyIfPresent('game', 'game');
copyIfPresent('screenshots', 'screenshots');

const caps = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

const dossier = buildDossier(outputDir, caps);
writeFileSync(join(outputDir, 'dossier.json'), dossier);
console.log(`Tideglass dossier written (${dossier.length} bytes)`);
