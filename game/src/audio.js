// Procedural engine hum, pickups and race calls. No audio files.

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

  tone(freq, duration, type = 'square', gain = 0.045, slide = 0) {
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

  start() { [330, 440, 660].forEach((n, i) => window.setTimeout(() => this.tone(n, 0.16, 'square', 0.05, 0), i * 90)); }
  dew() { this.tone(720, 0.12, 'sine', 0.05, 220); }
  boost() { this.tone(260, 0.22, 'sawtooth', 0.05, 380); }
  flare() { this.tone(420, 0.3, 'sawtooth', 0.05, 500); }
  lap() { [523, 659].forEach((n, i) => window.setTimeout(() => this.tone(n, 0.18, 'square', 0.05, 0), i * 110)); }
  crash() { this.tone(180, 0.28, 'sawtooth', 0.06, -90); }
  win() { [523, 659, 784, 1046].forEach((n, i) => window.setTimeout(() => this.tone(n, 0.26, 'square', 0.05, 0), i * 120)); }
}
