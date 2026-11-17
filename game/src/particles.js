// Particle system: glowing sparks, trails and bursts. Pure drawing, no game rules.

import { COLOR } from './config.js';

export class Particles {
  constructor() {
    this.items = [];
  }

  clear() {
    this.items.length = 0;
  }

  spawn(x, y, options = {}) {
    const {
      count = 1,
      color = COLOR.ember,
      speed = 70,
      life = 0.5,
      size = 2.5,
      angle = null,
      spread = Math.PI * 2,
      drag = 0.94,
    } = options;
    for (let i = 0; i < count; i += 1) {
      const direction = angle === null ? Math.random() * Math.PI * 2 : angle + (Math.random() - 0.5) * spread;
      const velocity = speed * (0.4 + Math.random() * 0.6);
      this.items.push({
        x, y,
        vx: Math.cos(direction) * velocity,
        vy: Math.sin(direction) * velocity,
        life: life * (0.7 + Math.random() * 0.6),
        maxLife: life,
        size: size * (0.6 + Math.random() * 0.8),
        color,
        drag,
      });
    }
    if (this.items.length > 600) this.items.splice(0, this.items.length - 600);
  }

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i -= 1) {
      const p = this.items[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.items.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.pow(p.drag, dt * 60);
      p.vy *= Math.pow(p.drag, dt * 60);
    }
  }

  draw(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const p of this.items) {
      const alpha = Math.max(0, p.life / p.maxLife);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (0.5 + alpha * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}
