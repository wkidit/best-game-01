// Chiptune-ish procedural blips: no sound files, no network.

export class SoundBoard {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) this.ctx = new Ctx();
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggleMute() { this.muted = !this.muted; return this.muted; }

  tone(freq, duration, type = 'square', gain = 0.05, slide = 0) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const vol = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), now + duration);
    vol.gain.setValueAtTime(gain, now);
    vol.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(vol).connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  dew() { this.tone(660, 0.12, 'square', 0.045, 220); }
  jump() { this.tone(300, 0.12, 'square', 0.04, 180); }
  pulse() { this.tone(240, 0.1, 'triangle', 0.04, 120); }
  wither() { this.tone(420, 0.16, 'sawtooth', 0.035, 260); }
  hurt() { this.tone(180, 0.3, 'sawtooth', 0.06, -90); }
  clear() { [392, 523, 659].forEach((n, i) => window.setTimeout(() => this.tone(n, 0.22, 'square', 0.05, 0), i * 120)); }
  victory() { [523, 659, 784, 1046].forEach((n, i) => window.setTimeout(() => this.tone(n, 0.28, 'square', 0.05, 0), i * 140)); }
}
