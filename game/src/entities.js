// Shade moths and wisps: both recoil from the lantern. Dew is collected as a tile.

import { COLOR, RULES } from './config.js';
import { pixel } from './tiles.js';

export class Shade {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 26;
    this.h = 22;
    this.vx = 62;
    this.vy = 0;
    this.lightExposure = 0;
    this.dead = false;
    this.phase = Math.random() * 6;
  }

  update(dt, world) {
    if (this.dead) return;
    this.x += this.vx * dt;
    // Turn at a ledge or a wall, using the tile grid under our feet.
    const ahead = world.tileAt(Math.round((this.x + (this.vx > 0 ? this.w : 0)) / RULES.tile), Math.round((this.y + this.h) / RULES.tile) + 1);
    if (ahead !== '#' || this.x < 8 || this.x > RULES.width - 34) this.vx *= -1;
    if (world.isLit(this.x + this.w / 2, this.y + this.h / 2, dt)) {
      this.lightExposure += dt;
      if (this.lightExposure > 0.7) {
        this.dead = true;
        world.score += 70 * world.combo;
        world.withered += 1;
        world.particles.burst(this.x, this.y, COLOR.glow, 16, 130);
      }
    } else {
      this.lightExposure = Math.max(0, this.lightExposure - dt * 0.5);
    }
  }

  draw(ctx, time) {
    if (this.dead) return;
    const bob = Math.sin(time * 4 + this.phase) * 2;
    ctx.save();
    ctx.globalAlpha = 0.55 + this.lightExposure * 0.5;
    pixel(ctx, this.x + 3, this.y + 6 + bob, COLOR.shade, 20, 12);
    pixel(ctx, this.x, this.y + 10 + bob, '#6a4a92', 7, 8);
    pixel(ctx, this.x + 20, this.y + 10 + bob, '#6a4a92', 7, 8);
    pixel(ctx, this.x + 7, this.y + 10 + bob, '#ff9ec4', 4, 4);
    pixel(ctx, this.x + 16, this.y + 10 + bob, '#ff9ec4', 4, 4);
    ctx.restore();
  }
}

export class Wisp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 22;
    this.h = 22;
    this.lightExposure = 0;
    this.dead = false;
    this.phase = Math.random() * 6;
  }

  update(dt, world) {
    if (this.dead) return;
    const dx = world.player.x - this.x;
    const dy = world.player.y - this.y;
    const len = Math.hypot(dx, dy) || 1;
    this.x += (dx / len) * 52 * dt;
    this.y += (dy / len) * 52 * dt + Math.sin(world.time * 3 + this.phase) * 12 * dt;
    if (world.isLit(this.x + this.w / 2, this.y + this.h / 2, dt)) {
      this.lightExposure += dt;
      if (this.lightExposure > 0.45) {
        this.dead = true;
        world.score += 90 * world.combo;
        world.withered += 1;
        world.particles.burst(this.x, this.y, COLOR.wisp, 18, 150);
      }
    } else {
      this.lightExposure = Math.max(0, this.lightExposure - dt);
    }
  }

  draw(ctx, time) {
    if (this.dead) return;
    const bob = Math.sin(time * 5 + this.phase) * 3;
    ctx.save();
    ctx.globalAlpha = 0.8;
    pixel(ctx, this.x + 3, this.y + 5 + bob, COLOR.wisp, 16, 14);
    pixel(ctx, this.x + 7, this.y + 9 + bob, '#ffffff', 6, 6);
    pixel(ctx, this.x + 1, this.y + 13 + bob, '#a8d8ff', 4, 6);
    pixel(ctx, this.x + 18, this.y + 13 + bob, '#a8d8ff', 4, 6);
    ctx.restore();
  }
}

export class DewDrop {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.taken = false;
    this.phase = Math.random() * 6;
  }

  draw(ctx, time) {
    if (this.taken) return;
    const bob = Math.sin(time * 3 + this.phase) * 3;
    ctx.save();
    ctx.shadowColor = COLOR.dew;
    ctx.shadowBlur = 10;
    pixel(ctx, this.x, this.y + bob, COLOR.dew, 10, 12);
    ctx.shadowBlur = 0;
    pixel(ctx, this.x + 2, this.y + 2 + bob, '#ffffff', 4, 4);
    ctx.restore();
  }
}
