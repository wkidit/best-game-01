// Palette and tuning for Nightcourier: a four-circuit lantern race.

export const COLOR = {
  ink: '#07081a',
  deep: '#0d1330',
  water: '#142a4a',
  bank: '#3a2f5c',
  cream: '#f4ecd8',
  dim: '#93a2c8',
  gold: '#ffd479',
  light: '#fff2b0',
  dew: '#8ff0e0',
  boost: '#ff9e6b',
  danger: '#ff6b7d',
  rival: '#c6a6ff',
};

export const RULES = {
  width: 960,
  height: 600,
  laps: 3,
  baseSpeed: 250,
  maxSpeed: 430,
  accel: 220,
  brake: 320,
  steerRate: 220,
  trackHalfWidth: 52,
  lampMax: 100,
  lampDrain: 4.2,
  lampRefill: 30,
  flareCharges: 3,
  flareDuration: 1.4,
};

export const CIRCUITS = [
  {
    name: 'GLOW CANAL',
    note: 'A calm loop to learn the currents.',
    hue: '#8ff0e0',
    sky: '#0d2a3a',
    waypoints: [[150,150],[470,110],[790,170],[840,340],[700,500],[420,520],[170,470],[100,310]],
  },
  {
    name: 'LANTERN REACH',
    note: 'Narrow banks. Watch the dark bends.',
    hue: '#ffd479',
    sky: '#2a2248',
    waypoints: [[130,180],[330,100],[620,120],[850,210],[820,420],[600,520],[330,500],[110,390]],
  },
  {
    name: 'EMBERLOCK',
    note: 'Boost pads and hot cross-currents.',
    hue: '#ff9e6b',
    sky: '#3a1f30',
    waypoints: [[160,130],[480,90],[820,160],[880,360],[690,510],[400,540],[130,430],[90,270]],
  },
  {
    name: 'THE DUSK BELT',
    note: 'The championship circuit. No mercy.',
    hue: '#c6a6ff',
    sky: '#1d1b44',
    waypoints: [[120,200],[280,100],[520,90],[770,140],[870,300],[760,480],[520,540],[260,500],[100,360]],
  },
];

export const RIVALS = [
  { name: 'RHEA VANCE', skill: 1.06, color: '#ff7a9c' },
  { name: 'CAEL ORR', skill: 1.04, color: '#8ff0e0' },
  { name: 'MIRA SOL', skill: 1.02, color: '#ffd479' },
  { name: 'JUN VEIL', skill: 1.0, color: '#c6a6ff' },
  { name: 'OTTO GREN', skill: 0.98, color: '#7ab8ff' },
  { name: 'LYRA ASH', skill: 0.96, color: '#9fd6ff' },
];

export function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${m}:${String(s).padStart(2, '0')}.${String(ms).padStart(2, '0')}`;
}
