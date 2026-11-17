// Persistent progress: unlocked gardens, best dew and best times.

const KEY = 'moonthorn-save-v1';

export class Save {
  constructor() {
    this.data = { best: 0, unlocked: 0, dew: [0, 0, 0, 0], times: [0, 0, 0, 0] };
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const p = JSON.parse(raw);
        this.data = {
          best: Number(p.best) || 0,
          unlocked: Math.max(0, Math.min(3, Number(p.unlocked) || 0)),
          dew: Array.isArray(p.dew) ? p.dew.slice(0, 4).map(Number) : [0, 0, 0, 0],
          times: Array.isArray(p.times) ? p.times.slice(0, 4).map(Number) : [0, 0, 0, 0],
        };
      }
    } catch { /* keep defaults */ }
  }

  write() {
    try { window.localStorage.setItem(KEY, JSON.stringify(this.data)); } catch { /* optional */ }
  }

  record(index, dew, seconds, score) {
    this.data.dew[index] = Math.max(this.data.dew[index] || 0, dew);
    const prev = this.data.times[index] || 0;
    if (!prev || seconds < prev) this.data.times[index] = seconds;
    this.data.unlocked = Math.max(this.data.unlocked, Math.min(3, index + 1));
    if (score > this.data.best) this.data.best = score;
    this.write();
  }
}
