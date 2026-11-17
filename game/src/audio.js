// Procedural sound effects made with WebAudio: no sound files, no network request.

export class SoundBoard {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  // Browsers only allow audio after a gesture; the first call opens the context.
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

  tone(frequency, duration, type = 'sine', gain = 0.09, slide = 0) {
    if (this.muted || !this.ctx) return;
    const now = this.ctx.currentTime;
    const oscillator = this.ctx.createOscillator();
    const volume = this.ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    if (slide) oscillator.frequency.exponentialRampToValueAtTime(Math.max(40, frequency + slide), now + duration);
    volume.gain.setValueAtTime(gain, now);
    volume.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(volume).connect(this.ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);
  }

  collect(combo) {
    this.tone(520 + Math.min(combo, 12) * 48, 0.12, 'triangle', 0.08, 180);
  }

  dash() {
    this.tone(240, 0.18, 'sawtooth', 0.06, 420);
  }

  hit() {
    this.tone(180, 0.28, 'square', 0.1, -110);
  }

  breakShard() {
    this.tone(360, 0.14, 'square', 0.07, 260);
  }

  repair() {
    this.tone(440, 0.2, 'sine', 0.08, 320);
  }

  start() {
    this.tone(330, 0.14, 'triangle', 0.08, 220);
    this.tone(660, 0.2, 'sine', 0.06, 220);
  }

  finish(won) {
    const notes = won ? [523, 659, 784, 1046] : [392, 330, 262];
    notes.forEach((note, index) => {
      window.setTimeout(() => this.tone(note, 0.24, 'triangle', 0.08, 0), index * 110);
    });
  }
}
