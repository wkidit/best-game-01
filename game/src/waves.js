// The four-reef campaign: each reef has waves, a pearl quota and its own name.

export const REEFS = [
  {
    name: 'SUNLIT SHOAL',
    note: 'Bright water. Learn the currents.',
    pearlGoal: 8,
    waves: [
      ['drifter', 'drifter', 'drifter'],
      ['drifter', 'drifter', 'spitter'],
    ],
  },
  {
    name: 'KELP CATHEDRAL',
    note: 'Spitters hide in the towers.',
    pearlGoal: 10,
    waves: [
      ['drifter', 'spitter', 'spitter'],
      ['drifter', 'drifter', 'spitter', 'brute'],
    ],
  },
  {
    name: 'EMBER VENT',
    note: 'Brutes charge. Read their tell.',
    pearlGoal: 12,
    waves: [
      ['spitter', 'brute', 'drifter'],
      ['brute', 'brute', 'spitter', 'spitter'],
    ],
  },
  {
    name: 'GLASS ABYSS',
    note: 'Everything at once. Survive.',
    pearlGoal: 14,
    waves: [
      ['drifter', 'spitter', 'brute', 'drifter'],
      ['brute', 'spitter', 'spitter', 'drifter', 'brute'],
    ],
  },
];

export const ENEMY_LEGEND = [
  { key: 'drifter', name: 'DRIFTER', text: 'A slow jelly that follows. Dash through it.' },
  { key: 'spitter', name: 'SPITTER', text: 'Keeps its distance and fires spines. Close in.' },
  { key: 'brute', name: 'BRUTE', text: 'Rings before a charge. Sidestep the rush.' },
];
