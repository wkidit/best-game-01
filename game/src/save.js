// Persistent progress: best score, unlocked reef, pearls and best times per reef.

const KEY = 'tideglass-save-v1';

const EMPTY = {
  best: 0,
  unlocked: 0,
  pearls: [0, 0, 0, 0],
  bestTimes: [0, 0, 0, 0],
};

export class Save {
  constructor() {
    this.data = { ...EMPTY };
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.data = {
          best: Number(parsed.best) || 0,
          unlocked: Math.max(0, Math.min(3, Number(parsed.unlocked) || 0)),
          pearls: Array.isArray(parsed.pearls) ? parsed.pearls.slice(0, 4).map(Number) : [0, 0, 0, 0],
          bestTimes: Array.isArray(parsed.bestTimes) ? parsed.bestTimes.slice(0, 4).map(Number) : [0, 0, 0, 0],
        };
      }
    } catch {
      /* storage unavailable: keep defaults */
    }
  }

  write() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(this.data));
    } catch {
      /* storage unavailable: progress lasts this session only */
    }
  }

  recordReef(index, pearls, seconds) {
    this.data.pearls[index] = Math.max(this.data.pearls[index] || 0, pearls);
    const previous = this.data.bestTimes[index] || 0;
    if (!previous || seconds < previous) this.data.bestTimes[index] = seconds;
    this.data.unlocked = Math.max(this.data.unlocked, Math.min(3, index + 1));
    this.write();
  }

  recordScore(score) {
    if (score > this.data.best) {
      this.data.best = score;
      this.write();
    }
  }
}
