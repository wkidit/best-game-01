// Garage tuning: three upgrade paths that change how the skiff handles.

export const PARTS = [
  { key: 'wick', name: 'LONG WICK', desc: 'Lamp drains slower', levels: ['standard', 'slow burn', 'deep wick', 'eternal flame'] },
  { key: 'hull', name: 'REINFORCED HULL', desc: 'More reserves', levels: ['standard', 'reinforced', 'braced', 'ironclad'] },
  { key: 'sail', name: 'TRIM SAIL', desc: 'Higher top speed', levels: ['standard', 'trimmed', 'racing', 'storm sail'] },
];

export function costFor(level) {
  return (level + 1) * 20;
}
