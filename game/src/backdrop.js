// Night-canal backdrop: dithered water, drifting rain and distant lantern glow.

import { RULES, CIRCUITS } from './config.js';
import { createRandom } from './random.js';

export class Backdrop {
  constructor() {
    this.time = 0;
    this.random = createRandom(2026);
    this.drops = [];
    for (let i = 0; i < 70; i += 1) {
      this.drops.push({ x: this.random() * RULES.width, y: this.random() * RULES.height, speed: 80 + this.random() * 120 });
    }
  }

  update(dt) { this.time += dt; }

  draw(ctx, index) {
    const circuit = CIRCUITS[index] || CIRCUITS[0];
    ctx.fillStyle = circuit.sky;
    ctx.fillRect(0, 0, RULES.width, RULES.height);

    // Dithered water bands.
    ctx.fillStyle = '#ffffff';
    ctx.globalAlpha = 0.035;
    for (let y = 0; y < RULES.height; y += 8) {
      const offset = (Math.floor(y / 8) % 2) * 8 + Math.sin(this.time * 0.5 + y * 0.02) * 4;
      for (let x = offset; x < RULES.width; x += 24) ctx.fillRect(Math.round(x), y, 6, 4);
    }
    ctx.globalAlpha = 1;

    // Distant lantern glows.
    for (let i = 0; i < 12; i += 1) {
      const x = (i * 173 + Math.sin(this.time * 0.3 + i) * 20) % RULES.width;
      const y = 60 + (i * 97) % 420;
      const glow = ctx.createRadialGradient(x, y, 2, x, y, 40);
      glow.addColorStop(0, circuit.hue + '33');
      glow.addColorStop(1, circuit.hue + '00');
      ctx.fillStyle = glow;
      ctx.fillRect(x - 42, y - 42, 84, 84);
    }

    // Rain.
    ctx.fillStyle = '#9fb8ff';
    ctx.globalAlpha = 0.3;
    for (const drop of this.drops) {
      drop.y += drop.speed * 0.016;
      if (drop.y > RULES.height) { drop.y = -10; drop.x = this.random() * RULES.width; }
      ctx.fillRect(Math.round(drop.x), Math.round(drop.y), 2, 7);
    }
    ctx.globalAlpha = 1;
  }
}
