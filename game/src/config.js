// Palette and tuning for Moonthorn: a pixel-art journey through four night gardens.

export const COLOR = {
  night: '#0c0a1e',
  ink: '#1a1230',
  cream: '#f7e9c8',
  dim: '#a89bc4',
  gold: '#ffd479',
  light: '#fff2b0',
  glow: '#ffe27a',
  dew: '#8ff0e0',
  heart: '#ff7a9c',
  thorn: '#8b3f6b',
  bloom: '#c08cff',
  shade: '#49356e',
  wisp: '#7ab8ff',
  danger: '#ff6b7d',
};

export const RULES = {
  width: 960,
  height: 600,
  tile: 32,
  cols: 30,
  rows: 19,
  moveSpeed: 210,
  jumpSpeed: 430,
  gravity: 1500,
  lightMax: 100,
  lightDrain: 6.5,
  lightRefill: 24,
  lightRadius: 165,
  maxHearts: 5,
  spawnHearts: 3,
  coyote: 0.1,
};

export const GARDENS = [
  {
    name: 'DEW COURT',
    note: 'Where the moon first touches the thorns.',
    skyTop: '#2b2352', skyBottom: '#100e28',
    hill: '#2a2148', near: '#3a2a5c', accent: '#8ff0e0',
    moon: '#fff2c8',
  },
  {
    name: 'THORN GALLERY',
    note: 'Walk only where your lantern has been.',
    skyTop: '#3a1f46', skyBottom: '#150b20',
    hill: '#3c1f42', near: '#572a54', accent: '#ff9ec4',
    moon: '#ffd0e0',
  },
  {
    name: 'MOON ORCHARD',
    note: 'Blooms open to the light and close in dark.',
    skyTop: '#1e3557', skyBottom: '#0a142c',
    hill: '#1d3454', near: '#2a4a70', accent: '#9fd6ff',
    moon: '#e8f4ff',
  },
  {
    name: 'GLASS CONSERVATORY',
    note: 'The last garden, under a broken moon.',
    skyTop: '#2a2a5e', skyBottom: '#0c0b24',
    hill: '#2a2a5a', near: '#3d3d7a', accent: '#c0b0ff',
    moon: '#ffffff',
  },
];

export function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

export function formatScore(value) {
  return String(value).padStart(5, '0');
}
