// The lantern-bearer: pixel movement, jumping, and a light resource that drains.

import { COLOR, RULES, clamp } from './config.js';
import { pixel } from './tiles.js';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 20;
    this.h = 28;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.facing = 1;
    this.light = RULES.lightMax;
    this.shining = false;
    this.hearts = RULES.spawnHearts;
    this.invulnerable = 0;
    this.coyote = 0;
    this.step = 0;
  }

  update(dt, input, world) {
    const dir = input.direction();
    this.vx = dir.x * RULES.moveSpeed;
    if (dir.x) this.facing = dir.x > 0 ? 1 : -1;

    const jumpPressed = input.pressed.has('Space') || input.pressed.has('KeyW') || input.pressed.has('ArrowUp');
    if (this.onGround) this.coyote = RULES.coyote;
    else this.coyote = Math.max(0, this.coyote - dt);
    if (jumpPressed && this.coyote > 0) {
      this.vy = -RULES.jumpSpeed;
      this.coyote = 0;
      this.onGround = false;
      world.sound.pulse();
    }

    this.shining = input.held.has('ShiftLeft') || input.held.has('ShiftRight') || input.held.has('MouseFire');
    if (this.shining) this.light = Math.max(0, this.light - RULES.lightDrain * dt);
    else this.light = Math.min(RULES.lightMax, this.light + RULES.lightDrain * 0.45 * dt);

    this.invulnerable = Math.max(0, this.invulnerable - dt);
    this.vy = Math.min(700, this.vy + RULES.gravity * dt);

    // Horizontal move and collision.
    this.x += this.vx * dt;
    this.resolveAxis('x', world);
    this.y += this.vy * dt;
    this.onGround = false;
    this.resolveAxis('y', world);
    this.step += Math.abs(this.vx) * dt;
  }

  resolveAxis(axis, world) {
    const T = RULES.tile;
    const left = Math.floor(this.x / T);
    const right = Math.floor((this.x + this.w - 1) / T);
    const top = Math.floor(this.y / T);
    const bottom = Math.floor((this.y + this.h - 1) / T);
    for (let cx = left; cx <= right; cx += 1) {
      for (let cy = top; cy <= bottom; cy += 1) {
        const tile = world.tileAt(cx, cy);
        if (!world.isSolid(cx, cy, tile)) continue;
        if (axis === 'x') {
          if (this.vx > 0) this.x = cx * T - this.w;
          else if (this.vx < 0) this.x = (cx + 1) * T;
          this.vx = 0;
        } else {
          if (this.vy > 0) {
            this.y = cy * T - this.h;
            this.onGround = true;
          } else if (this.vy < 0) this.y = (cy + 1) * T;
          this.vy = 0;
        }
      }
    }
    this.x = clamp(this.x, 0, RULES.width - this.w);
  }

  draw(ctx, time) {
    const blink = this.invulnerable > 0 && Math.floor(this.invulnerable * 12) % 2 === 0;
    ctx.save();
    if (blink) ctx.globalAlpha = 0.45;
    const x = Math.round(this.x);
    const y = Math.round(this.y + (this.onGround && Math.abs(this.vx) > 10 ? Math.sin(this.step * 0.12) * 1 : 0));

    pixel(ctx, x + 4, y + 8, '#3b2a58', 13, 16);
    pixel(ctx, x + 5, y + 4, '#d8b8ff', 11, 8);
    pixel(ctx, x + (this.facing > 0 ? 13 : 5), y + 7, '#1a1230', 3, 3);
    pixel(ctx, x + 2, y + 14, '#cf9cff', 5, 10);
    pixel(ctx, x + 14, y + 14, '#cf9cff', 5, 10);
    pixel(ctx, x + 6, y + 24, '#2a1f42', 4, 4);
    pixel(ctx, x + 11, y + 24, '#2a1f42', 4, 4);
    pixel(ctx, x + 17, y + 6, COLOR.gold, 4, 6);
    pixel(ctx, x + 17, y + 5, COLOR.light, 2, 3);
    ctx.restore();
  }

  drawLight(ctx) {
    if (!this.shining || this.light <= 0) return;
    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2;
    const radius = RULES.lightRadius * (0.85 + this.light / RULES.lightMax * 0.45);
    const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, radius);
    glow.addColorStop(0, 'rgba(255,242,176,0.7)');
    glow.addColorStop(0.45, 'rgba(255,210,120,0.24)');
    glow.addColorStop(1, 'rgba(255,210,120,0)');
    ctx.save();
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
