// Dense storybook HUD: objective, incoming foes, relics, light, hearts and controls.

import { COLOR, RULES, formatScore } from './config.js';
import { drawText, roundedRect } from './geometry.js';
import { drawPixelText } from './font.js';

function panel(ctx, x, y, w, h, accent, fill = '#0d0a20ee') {
  ctx.fillStyle = fill;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  roundedRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.stroke();
}

function bar(ctx, x, y, w, h, value, color) {
  ctx.fillStyle = '#241b38';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, Math.max(3, w * Math.max(0, Math.min(1, value))), h);
}

export function drawHUD(ctx, game) {
  ctx.save();
  const w = RULES.width;
  const h = RULES.height;
  const level = game.level;

  panel(ctx, 12, 10, 262, 90, '#c0b0ff');
  drawPixelText(ctx, level.name, 26, 22, 2, COLOR.cream);
  drawText(ctx, `DEW ${game.dew}/${level.dewGoal}`, 26, 58, 14, COLOR.dew);
  bar(ctx, 100, 48, 150, 8, game.dew / level.dewGoal, COLOR.dew);
  drawText(ctx, 'HEARTS', 26, 82, 12, COLOR.dim);
  for (let i = 0; i < RULES.maxHearts; i += 1) {
    ctx.fillStyle = i < game.player.hearts ? COLOR.heart : '#3a2c50';
    ctx.fillRect(84 + i * 22, 72, 15, 12);
    ctx.fillStyle = i < game.player.hearts ? '#ffb3c8' : '#3a2c50';
    ctx.fillRect(87 + i * 22, 69, 4, 4);
  }

  panel(ctx, w / 2 - 118, 10, 236, 66, '#c0b0ff');
  drawPixelText(ctx, `GARDEN ${game.levelIndex + 1} / 4`, w / 2, 24, 2, COLOR.gold, 'center');
  drawText(ctx, `${game.elapsed.toFixed(1)}s`, w / 2, 62, 15, COLOR.cream, 'center');

  panel(ctx, w - 274, 10, 262, 90, '#c0b0ff');
  drawText(ctx, 'SCORE', w - 262, 32, 12, COLOR.dim);
  drawText(ctx, formatScore(game.score), w - 262, 68, 27, COLOR.cream);
  drawText(ctx, `BEST ${formatScore(game.save.data.best)}`, w - 18, 32, 12, COLOR.dim, 'right');
  if (game.combo > 1) drawPixelText(ctx, `x${game.combo}`, w - 28, 54, 2, COLOR.gold, 'right');

  // Incoming threats with the counter for each species.
  panel(ctx, 12, 114, 262, 132, '#c0b0ff', '#0d0a20e0');
  drawText(ctx, 'INCOMING', 26, 138, 13, COLOR.gold);
  const threats = [
    ['SHADE MOTHS', COLOR.shade, 'shine to wither', game.enemies.filter((e) => e.constructor.name === 'Shade' && !e.dead).length],
    ['WISPS', COLOR.wisp, 'shine to banish', game.enemies.filter((e) => e.constructor.name === 'Wisp' && !e.dead).length],
    ['THORNS', COLOR.thorn, 'light clears a path', game.thornsLeft],
  ];
  threats.forEach((row, i) => {
    const y = 162 + i * 27;
    ctx.fillStyle = row[1];
    ctx.fillRect(26, y - 9, 8, 8);
    drawText(ctx, row[0], 42, y, 12, COLOR.cream);
    drawText(ctx, row[2], 42, y + 12, 10, COLOR.dim, 'left', 500);
    drawText(ctx, String(row[3]), 264, y, 13, COLOR.gold, 'right');
  });

  // Relics: a visible loadout that changes the run.
  panel(ctx, w - 274, 114, 262, 132, '#c0b0ff', '#0d0a20e0');
  drawText(ctx, 'RELICS', w - 262, 138, 13, COLOR.gold);
  const relics = [
    ['Long Wick', 'light lasts longer'],
    ['Dew Lens', 'dew shines brighter'],
    ['Tide Ward', 'spare heart'],
    ['Moon Shard', 'thorns wither faster'],
  ];
  relics.forEach((row, i) => {
    const y = 162 + i * 27;
    ctx.fillStyle = i % 2 ? COLOR.bloom : COLOR.gold;
    ctx.fillRect(w - 262, y - 9, 6, 6);
    drawText(ctx, row[0], w - 250, y, 12, COLOR.cream);
    drawText(ctx, row[1], w - 250, y + 12, 10, COLOR.dim, 'left', 500);
  });

  panel(ctx, 266, 86, 428, 44, '#8a6a3a', '#1a1430ee');
  drawText(ctx, 'WIN  gather all dew and reach the gate', 480, 104, 12, COLOR.gold, 'center');
  drawText(ctx, 'LOSE  hearts reach zero, or light runs dry in the dark', 480, 122, 11, COLOR.danger, 'center');

  panel(ctx, 12, h - 88, 320, 76, '#c0b0ff');
  drawText(ctx, 'LANTERN', 26, h - 64, 12, COLOR.dim);
  bar(ctx, 96, h - 74, 222, 14, game.player.light / RULES.lightMax, game.player.light > 20 ? COLOR.gold : COLOR.danger);
  drawText(ctx, `${Math.round(game.player.light)}%`, 318, h - 62, 12, COLOR.cream, 'right');
  drawText(ctx, 'WASD walk   SPACE/W jump', 26, h - 36, 12, COLOR.cream, 'left', 500);
  drawText(ctx, 'HOLD SHIFT or CLICK to shine', 26, h - 20, 12, COLOR.gold, 'left', 500);

  panel(ctx, w - 332, h - 88, 320, 76, '#c0b0ff');
  drawText(ctx, 'CONTROLS', w - 318, h - 64, 12, COLOR.gold);
  drawText(ctx, 'P pause   M mute   A atlas   R retry', w - 318, h - 42, 12, COLOR.cream, 'left', 500);
  drawText(ctx, 'Light reveals bloom bridges and withers thorns', w - 318, h - 22, 11, COLOR.dim, 'left', 500);

  if (game.muted) drawText(ctx, 'MUTED', w / 2, h - 16, 12, COLOR.dim, 'center');
  ctx.restore();
}
