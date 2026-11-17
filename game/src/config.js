// Shared palette and tuning numbers for Ember Drift.
// Every module imports its colours and speeds from here so the look stays consistent.

export const COLOR = {
  voidTop: '#0a0d24',
  voidBottom: '#05060f',
  grid: '#1b2350',
  gridGlow: '#26347a',
  ember: '#7df9ff',
  emberCore: '#ffffff',
  emberTrail: '#3ba8ff',
  shard: '#ff4f9a',
  shardCore: '#ffd0e8',
  mote: '#ffd166',
  moteCore: '#fff6d8',
  repair: '#6dffb0',
  text: '#e8ecff',
  textDim: '#8e9ad0',
  danger: '#ff5d73',
  accent: '#b388ff',
};

// All gameplay numbers in one place: pixels and seconds.
export const RULES = {
  width: 960,
  height: 600,
  playerSpeed: 268,
  dashSpeed: 660,
  dashSeconds: 0.16,
  dashCooldown: 1.5,
  hitInvulnerable: 1.3,
  startShields: 3,
  maxShields: 3,
  goalScore: 2200,
  roundSeconds: 60,
  comboWindow: 2.6,
  moteValue: 25,
  shardValue: 60,
  repairValue: 15,
  levelSeconds: 12,
};

// Small deterministic PRNG so demo scenes and spawns can be reproduced.
export function createRandom(seed) {
  let state = seed >>> 0 || 1;
  return function random() {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
}

export function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

export function formatScore(value) {
  return String(value).padStart(5, '0');
}
