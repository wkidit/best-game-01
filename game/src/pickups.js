// Dew cans and flare crates placed along each canal.

import { createRandom } from './random.js';

export function spawnPickups(track, circuitIndex) {
  const random = createRandom(4100 + circuitIndex * 97);
  const items = [];
  for (let i = 0; i < 16; i += 1) {
    items.push({
      kind: i % 3 === 0 ? 'flare' : 'dew',
      s: track.length * ((i + 0.5) / 16),
      offset: (random() - 0.5) * RULES_HALF * 1.4,
      taken: false,
      phase: random() * 6,
    });
  }
  return items;
}

const RULES_HALF = 52;
