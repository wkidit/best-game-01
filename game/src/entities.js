// Three enemy species with named behaviours, collectible pearls and projectiles.

import { COLOR, RULES, clamp } from './config.js';
import { angleTo, distance, blob, glowDot } from './geometry.js';

class Enemy {
  constructor(x, y, radius, hp, color) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = radius;
    this.hp = hp;
    this.color = color;
    this.phase = Math.random() * Math.PI * 2;
    this.hitFlash = 0;
  }

  damage() {
    this.hp -= 1;
    this.hitFlash = 0.14;
    return this.hp <= 0;
  }

  baseDraw(ctx, phase) {
    const flash = this.hitFlash > 0;
    ctx.save();
    ctx.globalAlpha = flash ? 1 : 0.92;
    blob(ctx, this.x, this.y, this.radius, flash ? '#ffffff' : this.color, 7, 0.12, phase);
    ctx.restore();
  }

  tickFlash(dt) {
    this.hitFlash = Math.max(0, this.hitFlash - dt);
  }
}

// DRIFTER: a slow jelly that bobs toward the player. The baseline threat.
export class Drifter extends Enemy {
  constructor(x, y, speed) {
    super(x, y, 15, 2, COLOR.drifter);
    this.speed = speed;
    this.label = 'DRIFTER';
  }

  update(dt, target) {
    this.tickFlash(dt);
    const angle = angleTo(this, target);
    const sway = Math.sin(this.phase + performance.now() * 0.0016) * 0.7;
    this.vx += (Math.cos(angle + sway) * this.speed - this.vx) * Math.min(1, dt * 1.4);
    this.vy += (Math.sin(angle + sway) * this.speed - this.vy) * Math.min(1, dt * 1.4);
    this.x += this.vx * dt;
    this.y += this.vy * dt;
  }

  draw(ctx) {
    this.baseDraw(ctx, this.phase);
    ctx.save();
    ctx.strokeStyle = '#d6f4ff88';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i += 1) {
      const ox = -12 + i * 8;
      ctx.beginPath();
      ctx.moveTo(this.x + ox, this.y + this.radius * 0.6);
      ctx.quadraticCurveTo(this.x + ox + 5, this.y + 26, this.x + ox, this.y + 34);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// SPITTER: an urchin that holds its distance and fires spines at the player.
export class Spitter extends Enemy {
  constructor(x, y, speed) {
    super(x, y, 17, 2, COLOR.spitter);
    this.speed = speed;
    this.fireTimer = 1 + Math.random();
    this.label = 'SPITTER';
  }

  update(dt, target, world) {
    this.tickFlash(dt);
    const dist = distance(this, target);
    const angle = angleTo(this, target);
    const desired = dist > 250 ? 1 : dist < 170 ? -1 : 0;
    this.vx += (Math.cos(angle) * this.speed * desired - this.vx) * Math.min(1, dt * 1.8);
    this.vy += (Math.sin(angle) * this.speed * desired - this.vy) * Math.min(1, dt * 1.8);
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.fireTimer -= dt;
    if (this.fireTimer <= 0) {
      this.fireTimer = 2.1;
      world.spines.push(new Spine(this.x, this.y, angle, COLOR.spitter));
    }
  }

  draw(ctx) {
    this.baseDraw(ctx, this.phase);
    ctx.save();
    ctx.strokeStyle = '#ffd0bd';
    ctx.lineWidth = 2;
    for (let i = 0; i < 9; i += 1) {
      const angle = (i / 9) * Math.PI * 2 + this.phase;
      ctx.beginPath();
      ctx.moveTo(this.x + Math.cos(angle) * 12, this.y + Math.sin(angle) * 12);
      ctx.lineTo(this.x + Math.cos(angle) * 25, this.y + Math.sin(angle) * 25);
      ctx.stroke();
    }
    ctx.restore();
  }
}

// BRUTE: a crab that telegraphs, then charges in a straight line.
export class Brute extends Enemy {
  constructor(x, y, speed) {
    super(x, y, 22, 4, COLOR.brute);
    this.speed = speed;
    this.state = 'stalk';
    this.timer = 1.1;
    this.charge = { x: 0, y: 0 };
    this.label = 'BRUTE';
  }

  update(dt, target) {
    this.tickFlash(dt);
    this.timer -= dt;
    if (this.state === 'stalk') {
      const angle = angleTo(this, target);
      this.vx += (Math.cos(angle) * this.speed * 0.35 - this.vx) * Math.min(1, dt * 1.2);
      this.vy += (Math.sin(angle) * this.speed * 0.35 - this.vy) * Math.min(1, dt * 1.2);
      if (this.timer <= 0) {
        this.state = 'windup';
        this.timer = 0.55;
        this.charge = { x: Math.cos(angleTo(this, target)), y: Math.sin(angleTo(this, target)) };
      }
    } else if (this.state === 'windup') {
      this.vx *= Math.pow(0.8, dt * 60);
      this.vy *= Math.pow(0.8, dt * 60);
      if (this.timer <= 0) {
        this.state = 'charge';
        this.timer = 0.7;
      }
    } else {
      this.vx = this.charge.x * this.speed * 3;
      this.vy = this.charge.y * this.speed * 3;
      if (this.timer <= 0) {
        this.state = 'stalk';
        this.timer = 1.2;
      }
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.x = clamp(this.x, 24, RULES.width - 24);
    this.y = clamp(this.y, 24, RULES.height - 24);
  }

  draw(ctx) {
    this.baseDraw(ctx, this.phase);
    ctx.save();
    ctx.strokeStyle = '#e8d4ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(this.x - 20, this.y + 10);
    ctx.lineTo(this.x - 34, this.y + 24);
    ctx.moveTo(this.x + 20, this.y + 10);
    ctx.lineTo(this.x + 34, this.y + 24);
    ctx.stroke();
    if (this.state === 'windup') {
      ctx.strokeStyle = COLOR.danger;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius + 12, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

export class Pearl {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.radius = 8;
    this.phase = Math.random() * Math.PI * 2;
  }

  draw(ctx, time) {
    const pulse = 1 + Math.sin(time * 3 + this.phase) * 0.12;
    ctx.save();
    ctx.shadowColor = COLOR.pearl;
    ctx.shadowBlur = 20;
    ctx.fillStyle = COLOR.pearl;
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.radius * 0.8 * pulse, this.radius * pulse, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fffaf0';
    ctx.beginPath();
    ctx.arc(this.x - 2, this.y - 3, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class Pulse {
  constructor(x, y, angle, color) {
    this.x = x;
    this.y = y;
    this.radius = 5;
    this.vx = Math.cos(angle) * RULES.pulseSpeed;
    this.vy = Math.sin(angle) * RULES.pulseSpeed;
    this.color = color;
    this.life = 1.2;
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = this.color;
    ctx.globalAlpha = 0.55;
    ctx.lineWidth = this.radius * 1.4;
    ctx.lineCap = 'round';
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.moveTo(this.x - this.vx * 0.055, this.y - this.vy * 0.055);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();
    ctx.restore();
    glowDot(ctx, this.x, this.y, this.radius, this.color, 14);
  }
}

export class Spine extends Pulse {
  constructor(x, y, angle, color) {
    super(x, y, angle, color);
    this.vx = Math.cos(angle) * RULES.spineSpeed;
    this.vy = Math.sin(angle) * RULES.spineSpeed;
    this.radius = 4;
    this.life = 3;
  }
}

export function makeEnemy(kind, x, y, level) {
  if (kind === 'spitter') return new Spitter(x, y, 66 + level * 6);
  if (kind === 'brute') return new Brute(x, y, 52 + level * 5);
  return new Drifter(x, y, 58 + level * 6);
}
