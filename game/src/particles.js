// Bubbles and bursts. Pure visual feedback, no rules.

import { COLOR } from './config.js';

export class Particles {
  constructor() {
    this.items = [];
  }

  clear() {
    this.items.length = 0;
  }

  burst(x, y, color, count = 14, speed = 130, life = 0.6) {
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2;
      const velocity = speed * (0.4 + Math.random() * 0.6);
      this.items.push({
        x, y,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity - 18,
        life: life * (0.7 + Math.random() * 0.6),
        maxLife: life,
        size: 2 + Math.random() * 3,
        color,
        bubble: false,
      });
    }
    this.trim();
  }

  bubbles(x, y, count = 2, color = COLOR.eel) {
    for (let i = 0; i < count; i += 1) {
      this.items.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 16,
        vy: -24 - Math.random() * 30,
        life: 0.7 + Math.random() * 0.6,
        maxLife: 1.3,
        size: 1.5 + Math.random() * 2.5,
        color,
        bubble: true,
      });
    }
    this.trim();
  }

  trim() {
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
      p.vx *= Math.pow(0.96, dt * 60);
      p.vy *= Math.pow(p.bubble ? 0.99 : 0.94, dt * 60);
    }
  }

  draw(ctx) {
    ctx.save();
    for (const p of this.items) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      if (p.bubble) {
        ctx.strokeStyle = '#ffffff88';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }
    ctx.restore();
  }
}
