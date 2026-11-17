// A compact circuit map with live rival dots.

import { RULES } from './config.js';

export function drawMinimap(ctx, track, racers, x, y, w, h) {
  ctx.save();
  ctx.fillStyle = '#0a0a20e8';
  ctx.strokeStyle = '#5a4a8a';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.fill();
  ctx.stroke();

  let minX = 1e9; let maxX = -1e9; let minY = 1e9; let maxY = -1e9;
  for (const p of track.points) {
    minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
  }
  const scale = Math.min((w - 16) / (maxX - minX || 1), (h - 16) / (maxY - minY || 1));
  const ox = x + (w - (maxX - minX) * scale) / 2 - minX * scale;
  const oy = y + (h - (maxY - minY) * scale) / 2 - minY * scale;

  ctx.beginPath();
  track.points.forEach((p, i) => {
    const px = ox + p.x * scale;
    const py = oy + p.y * scale;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();
  ctx.strokeStyle = '#6a5a9a';
  ctx.lineWidth = 3;
  ctx.stroke();

  for (const racer of racers) {
    const p = track.position(racer.s, racer.offset);
    ctx.fillStyle = racer.color;
    ctx.fillRect(Math.round(ox + p.x * scale) - 2, Math.round(oy + p.y * scale) - 2, racer.isPlayer ? 6 : 4, racer.isPlayer ? 6 : 4);
  }
  ctx.restore();
}
