// Closed canal path: sampling, drawing and boost-pad positions.

import { RULES, CIRCUITS } from './config.js';

export class Track {
  constructor(index) {
    this.index = index;
    this.circuit = CIRCUITS[index];
    this.points = this.circuit.waypoints.map(([x, y]) => ({ x, y }));
    this.segments = [];
    this.length = 0;
    for (let i = 0; i < this.points.length; i += 1) {
      const a = this.points[i];
      const b = this.points[(i + 1) % this.points.length];
      const len = Math.hypot(b.x - a.x, b.y - a.y);
      this.segments.push({ a, b, len, start: this.length });
      this.length += len;
    }
    this.pads = [];
    for (let i = 0; i < 4; i += 1) {
      this.pads.push(this.length * (0.12 + i * 0.23));
    }
  }

  sample(s) {
    const distance = ((s % this.length) + this.length) % this.length;
    let segment = this.segments[0];
    for (const candidate of this.segments) {
      if (distance >= candidate.start && distance <= candidate.start + candidate.len) {
        segment = candidate;
        break;
      }
    }
    const t = segment.len ? (distance - segment.start) / segment.len : 0;
    const x = segment.a.x + (segment.b.x - segment.a.x) * t;
    const y = segment.a.y + (segment.b.y - segment.a.y) * t;
    const angle = Math.atan2(segment.b.y - segment.a.y, segment.b.x - segment.a.x);
    return { x, y, angle, nx: -Math.sin(angle), ny: Math.cos(angle), distance };
  }

  position(s, offset) {
    const p = this.sample(s);
    return {
      x: p.x + p.nx * offset,
      y: p.y + p.ny * offset,
      angle: p.angle,
    };
  }

  draw(ctx, time) {
    const hue = this.circuit.hue;
    ctx.save();

    // Outer bank and water ribbon.
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#2a2148';
    ctx.lineWidth = RULES.trackHalfWidth * 2 + 18;
    this.path(ctx);
    ctx.stroke();
    ctx.strokeStyle = '#141d3c';
    ctx.lineWidth = RULES.trackHalfWidth * 2 + 8;
    this.path(ctx);
    ctx.stroke();
    ctx.strokeStyle = '#101d38';
    ctx.lineWidth = RULES.trackHalfWidth * 2;
    this.path(ctx);
    ctx.stroke();

    // Lantern posts along both banks.
    for (let s = 0; s < this.length; s += 74) {
      const p = this.sample(s);
      for (const side of [-1, 1]) {
        const x = p.x + p.nx * side * (RULES.trackHalfWidth + 6);
        const y = p.y + p.ny * side * (RULES.trackHalfWidth + 6);
        const pulse = 0.6 + Math.sin(time * 3 + s * 0.01) * 0.25;
        ctx.globalAlpha = pulse;
        ctx.fillStyle = hue;
        ctx.fillRect(x - 3, y - 3, 6, 6);
        ctx.globalAlpha = 1;
      }
    }

    // Dashed centre line and direction chevrons.
    for (let s = 0; s < this.length; s += 34) {
      const p = this.sample(s);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = '#ffffff22';
      ctx.fillRect(-8, -2, 16, 4);
      if (s % 136 < 34) {
        ctx.fillStyle = hue + '55';
        ctx.beginPath();
        ctx.moveTo(0, -12);
        ctx.lineTo(10, 0);
        ctx.lineTo(0, 12);
        ctx.lineTo(4, 0);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    // Boost pads.
    for (const s of this.pads) {
      const p = this.sample(s);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = '#ff9e6b66';
      ctx.fillRect(-18, -18, 36, 36);
      ctx.fillStyle = '#ffd479';
      for (let i = 0; i < 3; i += 1) ctx.fillRect(-12 + i * 10, -8, 5, 16);
      ctx.restore();
    }

    // Start line.
    const start = this.sample(0);
    ctx.save();
    ctx.translate(start.x, start.y);
    ctx.rotate(start.angle);
    for (let x = -RULES.trackHalfWidth; x < RULES.trackHalfWidth; x += 12) {
      ctx.fillStyle = (Math.floor(x / 12) % 2 === 0) ? '#ffffff' : '#1a1230';
      ctx.fillRect(x, -RULES.trackHalfWidth, 12, 8);
    }
    ctx.restore();
    ctx.restore();
  }

  path(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i += 1) ctx.lineTo(this.points[i].x, this.points[i].y);
    ctx.closePath();
  }
}
