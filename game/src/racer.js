// A courier skiff: progress along the canal, steering, lamp, boost and lap timing.

import { RULES, clamp } from './config.js';
import { createRandom } from './random.js';

export class Racer {
  constructor(name, color, isPlayer, skill = 1) {
    this.name = name;
    this.color = color;
    this.isPlayer = isPlayer;
    this.skill = skill;
    this.s = 0;
    this.offset = 0;
    this.targetOffset = 0;
    this.speed = 0;
    this.lap = 1;
    this.lapStart = 0;
    this.bestLap = 0;
    this.lastLap = 0;
    this.finished = false;
    this.finishTime = 0;
    this.lamp = RULES.lampMax;
    this.flares = RULES.flareCharges;
    this.flareTime = 0;
    this.boostTime = 0;
    this.shining = false;
    this.random = createRandom(name.length * 7919 + Math.floor(skill * 1000));
    this.tune = { wick: 0, hull: 0, sail: 0 };
  }

  get total() {
    return (this.lap - 1) * 100000 + this.s;
  }

  reset(track, tune) {
    this.s = 0;
    this.offset = (this.isPlayer ? 0 : (this.random() - 0.5) * 60);
    this.targetOffset = this.offset;
    this.speed = 0;
    this.lap = 1;
    this.lapStart = 0;
    this.finished = false;
    this.lamp = RULES.lampMax;
    this.flares = RULES.flareCharges;
    this.flareTime = 0;
    this.boostTime = 0;
    if (tune) this.tune = { ...tune };
  }

  maxSpeed() {
    return (RULES.maxSpeed - 60) + this.tune.sail * 26 + (this.skill - 1) * 90;
  }

  drain() {
    return RULES.lampDrain * (1 - this.tune.wick * 0.16);
  }

  update(dt, track, control, world) {
    if (this.finished) return;

    // Steering toward a lateral target.
    const steer = control.steer;
    this.targetOffset = clamp(this.targetOffset + steer * RULES.steerRate * dt, -RULES.trackHalfWidth + 8, RULES.trackHalfWidth - 8);
    this.offset += (this.targetOffset - this.offset) * Math.min(1, dt * 4.5);

    // Throttle, brake and lamp-as-power: a dark canal slows the skiff.
    const lit = this.shining && this.lamp > 0;
    let target = control.throttle ? this.maxSpeed() : RULES.baseSpeed * 0.45;
    if (control.brake) target *= 0.4;
    if (!lit) target *= 0.82;
    if (this.boostTime > 0 || this.flareTime > 0) target = this.maxSpeed() * 1.35;
    this.speed += (target - this.speed) * Math.min(1, dt * 2.4);
    this.speed = clamp(this.speed, 0, RULES.maxSpeed * 1.4);

    this.s += this.speed * dt;

    // Lamp resource.
    if (this.shining) this.lamp = Math.max(0, this.lamp - this.drain() * dt);
    else this.lamp = Math.min(RULES.lampMax, this.lamp + this.drain() * 0.6 * dt);
    this.boostTime = Math.max(0, this.boostTime - dt);
    this.flareTime = Math.max(0, this.flareTime - dt);

    // Boost pads and dew cans.
    for (const pad of track.pads) {
      const diff = (this.s % track.length) - (pad % track.length);
      if (diff > -6 && diff < 12 && this.boostTime <= 0) {
        this.boostTime = 0.8;
        if (this.isPlayer) world.sound.boost();
      }
    }
    for (const item of world.pickups) {
      if (item.taken) continue;
      const diff = Math.abs(((this.s - item.s + track.length * 1.5) % track.length) - track.length * 0.5);
      if (diff < 14 && Math.abs(this.offset - item.offset) < 26) {
        item.taken = true;
        if (item.kind === 'dew') this.lamp = Math.min(RULES.lampMax, this.lamp + RULES.lampRefill);
        else this.flares = Math.min(5, this.flares + 1);
        if (this.isPlayer) world.sound.dew();
      }
    }

    // Laps.
    while (this.s >= track.length) {
      this.s -= track.length;
      const now = world.clock;
      const lapTime = now - this.lapStart;
      this.lastLap = lapTime;
      if (!this.bestLap || lapTime < this.bestLap) this.bestLap = lapTime;
      this.lapStart = now;
      if (this.isPlayer) world.sound.lap();
      this.lap += 1;
      if (this.lap > RULES.laps) {
        this.finished = true;
        this.finishTime = now;
        this.lap = RULES.laps;
      }
    }
  }

  draw(ctx, track, time) {
    const p = track.position(this.s, this.offset);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.angle);

    // Wake.
    ctx.fillStyle = '#ffffff22';
    ctx.fillRect(-28, -3, 18, 6);

    // Hull and lantern.
    ctx.fillStyle = this.color;
    ctx.fillRect(-16, -9, 30, 18);
    ctx.fillStyle = '#ffffff44';
    ctx.fillRect(-10, -6, 14, 5);
    ctx.fillStyle = '#1a1230';
    ctx.fillRect(8, -4, 6, 8);
    ctx.fillStyle = this.shining ? COLOR_LIGHT : '#a89a6a';
    ctx.fillRect(-20, -3, 5, 6);
    if (this.flareTime > 0) {
      ctx.fillStyle = '#ffd479aa';
      ctx.fillRect(-40, -2, 22, 4);
    }
    ctx.restore();

    // Lamp glow on the water.
    if (this.shining && this.lamp > 0) {
      const glow = ctx.createRadialGradient(p.x, p.y, 4, p.x, p.y, RULES.trackHalfWidth * 1.6);
      glow.addColorStop(0, 'rgba(255,242,176,0.35)');
      glow.addColorStop(1, 'rgba(255,242,176,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(p.x - 90, p.y - 90, 180, 180);
    }
  }
}

const COLOR_LIGHT = '#fff2b0';
