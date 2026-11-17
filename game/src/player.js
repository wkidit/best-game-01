// The player's ember: movement, dash, invulnerability and rendering.

import { COLOR, RULES, clamp } from './config.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = 12;
    this.dashTime = 0;
    this.dashCooldown = 0;
    this.invulnerable = 0;
    this.facing = { x: 1, y: 0 };
    this.trailClock = 0;
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

  takeHit() {
    if (this.invulnerable > 0) return false;
    this.invulnerable = RULES.hitInvulnerable;
    return true;
  }

  update(dt, input, particles) {
    this.dashCooldown = Math.max(0, this.dashCooldown - dt);
    this.invulnerable = Math.max(0, this.invulnerable - dt);

    const dir = input ? input.direction() : { x: 0, y: 0 };
    if (dir.x || dir.y) this.facing = dir;

    const speed = this.dashing ? RULES.dashSpeed : RULES.playerSpeed;
    const targetVx = dir.x * speed;
    const targetVy = dir.y * speed;
    const blend = this.dashing ? 1 : 1 - Math.pow(0.0001, dt);
    this.vx += (targetVx - this.vx) * blend;
    this.vy += (targetVy - this.vy) * blend;

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const margin = this.radius + 4;
    this.x = clamp(this.x, margin, RULES.width - margin);
    this.y = clamp(this.y, margin, RULES.height - margin);

    if (this.dashTime > 0) this.dashTime = Math.max(0, this.dashTime - dt);

    this.trailClock += dt;
    const interval = this.dashing ? 0.012 : 0.028;
    while (this.trailClock >= interval) {
      this.trailClock -= interval;
      particles.spawn(this.x - this.vx * 0.02, this.y - this.vy * 0.02, {
        count: 1,
        color: this.dashing ? COLOR.mote : COLOR.emberTrail,
        speed: 24,
        life: this.dashing ? 0.45 : 0.35,
        size: this.dashing ? 3.6 : 2.8,
        drag: 0.9,
      });
    }
  }

  draw(ctx, time) {
    const flicker = 0.85 + Math.sin(time * 18) * 0.15;
    const blink = this.invulnerable > 0 && Math.floor(this.invulnerable * 12) % 2 === 0;

    ctx.save();
    if (blink) ctx.globalAlpha = 0.35;

    const glow = ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, this.radius * 3.4);
    glow.addColorStop(0, this.dashing ? '#ffffffcc' : '#7df9ff99');
    glow.addColorStop(1, '#7df9ff00');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 3.4, 0, Math.PI * 2);
    ctx.fill();

    const angle = Math.atan2(this.facing.y, this.facing.x);
    ctx.translate(this.x, this.y);
    ctx.rotate(angle);
    ctx.fillStyle = COLOR.ember;
    ctx.shadowColor = COLOR.ember;
    ctx.shadowBlur = 18 * flicker;
    ctx.beginPath();
    ctx.moveTo(this.radius * 1.7, 0);
    ctx.lineTo(-this.radius * 0.9, this.radius * 0.85);
    ctx.lineTo(-this.radius * 0.4, 0);
    ctx.lineTo(-this.radius * 0.9, -this.radius * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = COLOR.emberCore;
    ctx.beginPath();
    ctx.arc(0, 0, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
