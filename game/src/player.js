// The glass eel: a segmented swimmer with a dash and a hull.

import { COLOR, RULES, clamp } from './config.js';
import { angleTo } from './geometry.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 12;
    this.vx = 0;
    this.vy = 0;
    this.facing = { x: 1, y: 0 };
    this.dashTime = 0;
    this.dashCooldown = 0;
    this.pulseCooldown = 0;
    this.invulnerable = 0;
    this.trail = [];
  }

  get dashing() {
    return this.dashTime > 0;
  }

  tryDash(input) {
    if (this.dashCooldown > 0 || this.dashTime > 0) return false;
    const dir = input.direction();
    if (dir.x || dir.y) this.facing = dir;
    this.dashTime = RULES.dashSeconds;
    this.dashCooldown = RULES.dashCooldown;
    return true;
  }

  tryPulse(target) {
    if (this.pulseCooldown > 0) return null;
    this.pulseCooldown = RULES.pulseCooldown;
    const angle = angleTo(this, target);
    this.facing = { x: Math.cos(angle), y: Math.sin(angle) };
    return angle;
  }

  takeHit() {
    if (this.invulnerable > 0) return false;
    this.invulnerable = RULES.hitInvulnerable;
    return true;
  }

  update(dt, input, particles) {
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.pulseCooldown = Math.max(0, this.pulseCooldown - dt);
    this.invulnerable = Math.max(0, this.invulnerable - dt);

    const dir = input ? input.direction() : { x: 0, y: 0 };
    if (dir.x || dir.y) this.facing = dir;

    const speed = this.dashing ? RULES.dashSpeed : RULES.playerSpeed;
    const blend = this.dashing ? 1 : 1 - Math.pow(0.0004, dt);
    this.vx += (dir.x * speed - this.vx) * blend;
    this.vy += (dir.y * speed - this.vy) * blend;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const m = this.radius + 4;
    this.x = clamp(this.x, m, RULES.width - m);
    this.y = clamp(this.y, m, RULES.height - m);

    if (this.dashTime > 0) this.dashTime = Math.max(0, this.dashTime - dt);

    this.trail.unshift({ x: this.x, y: this.y });
    if (this.trail.length > 12) this.trail.pop();

    if (particles) {
      particles.bubbles(this.x - this.vx * 0.02, this.y - this.vy * 0.02, this.dashing ? 3 : 1);
    }
  }

  draw(ctx, time) {
    const blink = this.invulnerable > 0 && Math.floor(this.invulnerable * 12) % 2 === 0;
    ctx.save();
    if (blink) ctx.globalAlpha = 0.4;

    // A chain of shrinking segments gives the eel a living silhouette.
    for (let i = this.trail.length - 1; i >= 0; i -= 1) {
      const point = this.trail[i];
      const t = 1 - i / this.trail.length;
      const radius = 3 + t * 8;
      ctx.fillStyle = i % 2 === 0 ? '#5fd9c0' : COLOR.eel;
      ctx.globalAlpha = (blink ? 0.3 : 0.55) * t;
      ctx.beginPath();
      ctx.arc(point.x, point.y + Math.sin(time * 6 - i * 0.6) * 2, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = blink ? 0.4 : 1;

    const angle = angleTo({ x: 0, y: 0 }, this.facing);
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);
    ctx.shadowColor = COLOR.eel;
    ctx.shadowBlur = this.dashing ? 30 : 18;
    ctx.fillStyle = COLOR.eel;
    ctx.beginPath();
    ctx.moveTo(18, 0);
    ctx.bezierCurveTo(8, -11, -10, -9, -14, 0);
    ctx.bezierCurveTo(-10, 9, 8, 11, 18, 0);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = COLOR.eelCore;
    ctx.beginPath();
    ctx.arc(7, -2, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0c2b2a';
    ctx.beginPath();
    ctx.arc(8, -2, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
