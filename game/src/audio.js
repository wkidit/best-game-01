// Underwater-flavoured procedural sound: no audio files, no network.

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

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(frequency, duration, type, gain, slide) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const oscillator = this.ctx.createOscillator();
    const volume = this.ctx.createGain();
    oscillator.type = type || 'sine';
    oscillator.frequency.setValueAtTime(frequency, now);
    if (slide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency + slide), now + duration);
    volume.gain.setValueAtTime(gain || 0.07, now);
    volume.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(volume).connect(this.ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  pearl(combo) {
    this.tone(440 + Math.min(combo, 14) * 42, 0.16, 'sine', 0.07, 160);
  }

  pulse() {
    this.tone(300, 0.1, 'triangle', 0.05, 260);
  }

  dash() {
    this.tone(200, 0.2, 'sine', 0.06, 380);
  }

  hit() {
    this.tone(150, 0.34, 'sawtooth', 0.08, -90);
  }

  kill() {
    this.tone(260, 0.14, 'triangle', 0.06, 200);
  }

  wave() {
    this.tone(520, 0.18, 'sine', 0.07, 180);
    window.setTimeout(() => this.tone(780, 0.22, 'sine', 0.06, 120), 130);
  }

  victory() {
    [392, 523, 659, 784].forEach((note, i) => {
      window.setTimeout(() => this.tone(note, 0.3, 'sine', 0.07, 0), i * 130);
    });
  }
}
