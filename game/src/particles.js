// Square pixel sparks for light hits, dew pickups and damage.

export class Particles {
  constructor() {
    this.items = [];
  }

  clear() { this.items.length = 0; }

  burst(x, y, color, count = 12, speed = 120) {
    for (let i = 0; i < count; i += 1) {
      const a = Math.random() * Math.PI * 2;
      const v = speed * (0.3 + Math.random() * 0.7);
      this.items.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 30,
        life: 0.4 + Math.random() * 0.4,
        max: 0.8,
        size: Math.random() > 0.5 ? 4 : 3,
        color,
      });
    }
    if (this.items.length > 400) this.items.splice(0, this.items.length - 400);
  }

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i -= 1) {
      const p = this.items[i];
      p.life -= dt;
      if (p.life <= 0) { this.items.splice(i, 1); continue; }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 320 * dt;
    }
  }

  draw(ctx) {
    ctx.save();
    for (const p of this.items) {
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life / p.max));
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.restore();
  }
}
