// Hazards and pickups: drifting shards, spark motes and repair motes.

import { COLOR, RULES } from './config.js';

export class Shard {
  constructor(x, y, speed, radius) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = radius;
    this.speed = speed;
    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 3;
    this.points = 4 + Math.floor(Math.random() * 3);
  }

  update(dt, target) {
    const dx = target.x - this.x;
    const dy = target.y - this.y;
    const length = Math.hypot(dx, dy) || 1;
    const steer = 1.9;
    this.vx += (dx / length * this.speed - this.vx) * Math.min(1, steer * dt);
    this.vy += (dy / length * this.speed - this.vy) * Math.min(1, steer * dt);
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.angle += this.spin * dt;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.shadowColor = COLOR.shard;
    ctx.shadowBlur = 16;
    ctx.strokeStyle = COLOR.shard;
    ctx.lineWidth = 2.5;
    ctx.fillStyle = '#ff4f9a33';
    ctx.beginPath();
    for (let i = 0; i < this.points; i += 1) {
      const a = (i / this.points) * Math.PI * 2;
      const px = Math.cos(a) * this.radius;
      const py = Math.sin(a) * this.radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.fillStyle = COLOR.shardCore;
    ctx.beginPath();
    ctx.arc(0, 0, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

export class Mote {
  constructor(x, y, kind = 'spark') {
    this.x = x;
    this.y = y;
    this.kind = kind;
    this.radius = kind === 'repair' ? 10 : 7;
    this.phase = Math.random() * Math.PI * 2;
    this.bob = Math.random() * 6;
  }

  draw(ctx, time) {
    const pulse = 1 + Math.sin(time * 4 + this.phase) * 0.16;
    const color = this.kind === 'repair' ? COLOR.repair : COLOR.mote;
    ctx.save();
    ctx.translate(this.x, this.y + Math.sin(time * 2 + this.bob) * 3);
    ctx.shadowColor = color;
    ctx.shadowBlur = 18;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = this.kind === 'repair' ? COLOR.repair : COLOR.moteCore;
    if (this.kind === 'repair') {
      ctx.fillRect(-1.8, -6, 3.6, 12);
      ctx.fillRect(-6, -1.8, 12, 3.6);
    } else {
      ctx.beginPath();
      ctx.moveTo(0, -this.radius * 0.55);
      ctx.lineTo(this.radius * 0.5, 0);
      ctx.lineTo(0, this.radius * 0.55);
      ctx.lineTo(-this.radius * 0.5, 0);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

// Picks a point away from the player so pickups never spawn on top of them.
export function spawnPoint(random, player, minDistance = 130) {
  let x = 0;
  let y = 0;
  for (let attempt = 0; attempt < 20; attempt += 1) {
    x = 60 + random() * (RULES.width - 120);
    y = 60 + random() * (RULES.height - 120);
    if (Math.hypot(x - player.x, y - player.y) > minDistance) break;
  }
  return { x, y };
}

// Picks a point just outside one of the four edges for an incoming shard.
export function spawnEdge(random) {
  const side = Math.floor(random() * 4);
  if (side === 0) return { x: random() * RULES.width, y: -24 };
  if (side === 1) return { x: RULES.width + 24, y: random() * RULES.height };
  if (side === 2) return { x: random() * RULES.width, y: RULES.height + 24 };
  return { x: -24, y: random() * RULES.height };
}
