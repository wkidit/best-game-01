// Palette and tuning for Tideglass: a four-reef underwater action game.

export const COLOR = {
  deep: '#04121f',
  shallow: '#0a2a3a',
  ink: '#061a26',
  foam: '#dff8ef',
  text: '#e6fbf4',
  dim: '#84a8a8',
  eel: '#8ff5d8',
  eelCore: '#ffffff',
  pearl: '#ffd98a',
  drifter: '#7bd5ff',
  spitter: '#ff9a7a',
  brute: '#c79bff',
  danger: '#ff6b7d',
  gold: '#ffd166',
  lock: '#5d7480',
};

export const RULES = {
  width: 960,
  height: 600,
  playerSpeed: 250,
  dashSpeed: 640,
  dashSeconds: 0.18,
  dashCooldown: 1.6,
  hitInvulnerable: 1.4,
  startHull: 4,
  maxHull: 4,
  pearlValue: 20,
  killValue: 55,
  comboWindow: 3,
  pulseCooldown: 0.45,
  pulseSpeed: 430,
  spineSpeed: 190,
};

export const ZONE_THEMES = [
  { top: '#0d3b4a', bottom: '#04141f', ray: '#6fe0c8', coral: '#1d6b66', name: 'SUNLIT SHOAL' },
  { top: '#0a3d3a', bottom: '#03171a', ray: '#7bf0b0', coral: '#1c5c4a', name: 'KELP CATHEDRAL' },
  { top: '#4a1f24', bottom: '#1a0a12', ray: '#ff9a6b', coral: '#7a2f30', name: 'EMBER VENT' },
  { top: '#1e1b4a', bottom: '#08071c', ray: '#a99bff', coral: '#3b3175', name: 'GLASS ABYSS' },
];

export function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

export function formatScore(value) {
  return String(value).padStart(5, '0');
}
