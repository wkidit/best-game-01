// Tile kinds and their hand-pixeled art. The map uses one character per tile.

import { COLOR, RULES } from './config.js';

export const TILE = {
  EMPTY: '.',
  SOLID: '#',
  PLATFORM: '=',
  THORN: 'T',
  BLOOM: 'B',
  DEW: 'o',
  SHADE: 'S',
  WISP: 'W',
  EXIT: 'X',
};

const T = RULES.tile;

export function pixel(ctx, x, y, color, w = 4, h = 4) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

export function drawSolid(ctx, x, y, accent) {
  pixel(ctx, x, y, '#2b2348', T, T);
  pixel(ctx, x, y, '#4a3c72', T, 6);
  pixel(ctx, x + 4, y + 10, '#362c5a', T - 8, 4);
  pixel(ctx, x + 8, y + 20, accent, 6, 3);
  pixel(ctx, x, y + T - 4, '#171229', T, 4);
}

export function drawPlatform(ctx, x, y, accent) {
  pixel(ctx, x, y, '#e6d7a8', T, 7);
  pixel(ctx, x, y + 7, '#8b6f5a', T, 5);
  pixel(ctx, x + 3, y + 2, accent, 5, 3);
  pixel(ctx, x + 18, y + 3, '#fff2c8', 4, 3);
}

export function drawThorn(ctx, x, y, withered, time) {
  if (withered) {
    pixel(ctx, x + 4, y + T - 10, '#3c6b58', 8, 10);
    pixel(ctx, x + 6, y + T - 14, '#7bd6a0', 4, 5);
    return;
  }
  const sway = Math.sin(time * 3 + x) * 2;
  pixel(ctx, x + 12 + sway, y + 8, '#3a1b36', 7, T - 8);
  pixel(ctx, x + 8 + sway, y + 12, COLOR.thorn, 6, 12);
  pixel(ctx, x + 16 + sway, y + 16, '#c76b9a', 5, 9);
  pixel(ctx, x + 5 + sway, y + 20, '#8b3f6b', 6, 6);
  pixel(ctx, x + 21 + sway, y + 22, '#5c2a4a', 6, 6);
}

export function drawBloom(ctx, x, y, lit, time) {
  const open = lit ? 1 : 0.45;
  ctx.save();
  ctx.globalAlpha = open;
  pixel(ctx, x + 12, y + 14, '#3c2a5c', 8, 18);
  const petals = lit ? COLOR.bloom : '#5a4478';
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2 + time * 0.3;
    const px = x + 16 + Math.cos(a) * 10;
    const py = y + 10 + Math.sin(a) * 8;
    pixel(ctx, px, py, petals, 8, 6);
  }
  pixel(ctx, x + 13, y + 7, COLOR.gold, 7, 7);
  ctx.restore();
}

export function drawDew(ctx, x, y, time) {
  const bob = Math.sin(time * 3 + x * 0.05) * 3;
  ctx.save();
  ctx.shadowColor = COLOR.dew;
  ctx.shadowBlur = 12;
  pixel(ctx, x + 11, y + 6 + bob, COLOR.dew, 10, 12);
  ctx.shadowBlur = 0;
  pixel(ctx, x + 13, y + 8 + bob, '#ffffff', 4, 4);
  ctx.restore();
}

export function drawExit(ctx, x, y, time) {
  pixel(ctx, x + 4, y + 2, '#3c2a5c', 24, T - 2);
  pixel(ctx, x + 8, y + 8, '#1a1230', 16, T - 10);
  const glow = 0.5 + Math.sin(time * 4) * 0.3;
  ctx.save();
  ctx.globalAlpha = glow;
  pixel(ctx, x + 12, y + 10, COLOR.gold, 8, 14);
  ctx.restore();
  pixel(ctx, x + 2, y, '#c9b6ff', 28, 4);
}

export function drawTileAt(ctx, tile, x, y, accent, time, flag = false) {
  if (tile === TILE.SOLID) drawSolid(ctx, x, y, accent);
  else if (tile === TILE.PLATFORM) drawPlatform(ctx, x, y, accent);
  else if (tile === TILE.THORN) drawThorn(ctx, x, y, flag, time);
  else if (tile === TILE.BLOOM) drawBloom(ctx, x, y, flag, time);
  else if (tile === TILE.DEW) drawDew(ctx, x, y, time);
  else if (tile === TILE.EXIT) drawExit(ctx, x, y, time);
}
