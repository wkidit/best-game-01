// Persistent career: unlocked circuits, points, best laps and garage tuning.

const KEY = 'nightcourier-save-v1';

export class Save {
  constructor() {
    this.data = {
      points: 0,
      unlocked: 0,
      bestLaps: [0, 0, 0, 0],
      tuning: { wick: 0, hull: 0, sail: 0 },
      standings: [0, 0, 0, 0, 0, 0, 0],
    };
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        this.data.points = Number(p.points) || 0;
        this.data.unlocked = Math.max(0, Math.min(3, Number(p.unlocked) || 0));
        this.data.bestLaps = Array.isArray(p.bestLaps) ? p.bestLaps.slice(0, 4).map(Number) : this.data.bestLaps;
        this.data.tuning = { ...this.data.tuning, ...(p.tuning || {}) };
        this.data.standings = Array.isArray(p.standings) ? p.standings.slice(0, 7).map(Number) : this.data.standings;
      }
    } catch { /* defaults */ }
  }

  write() {
    try { window.localStorage.setItem(KEY, JSON.stringify(this.data)); } catch { /* optional */ }
  }

  buy(part) {
    const level = this.data.tuning[part] || 0;
    if (level >= 3) return false;
    const cost = (level + 1) * 20;
    if (this.data.points < cost) return false;
    this.data.points -= cost;
    this.data.tuning[part] = level + 1;
    this.write();
    return true;
  }

  recordRace(circuit, lap, points, standings) {
    const prev = this.data.bestLaps[circuit] || 0;
    if (!prev || lap < prev) this.data.bestLaps[circuit] = lap;
    this.data.points += points;
    this.data.unlocked = Math.max(this.data.unlocked, Math.min(3, circuit + 1));
    this.data.standings = standings;
    this.write();
  }
}
