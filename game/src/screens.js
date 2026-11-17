// Storybook menus: title, four-garden atlas, pause and stats-rich results.

import { COLOR, RULES, formatScore } from './config.js';
import { LEVELS } from './levels.js';
import { drawText, roundedRect } from './geometry.js';
import { drawPixelText } from './font.js';

function card(ctx, x, y, w, h, accent) {
  ctx.fillStyle = '#0d0a20f2';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  roundedRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.stroke();
}

export function drawTitle(ctx, game, time) {
  const pulse = 0.7 + Math.sin(time * 3) * 0.3;
  ctx.save();
  ctx.shadowColor = COLOR.gold;
  ctx.shadowBlur = 18;
  drawPixelText(ctx, 'MOONTHORN', RULES.width / 2, 120, 7, COLOR.cream, 'center');
  ctx.shadowBlur = 0;
  drawPixelText(ctx, 'FOUR GARDENS  ONE LANTERN', RULES.width / 2, 196, 2, COLOR.gold, 'center');

  card(ctx, 40, 228, 420, 224, '#c0b0ff');
  drawText(ctx, 'THE RULE OF LIGHT', 62, 258, 15, COLOR.gold);
  const rows = [
    'Hold SHIFT or the mouse to shine.',
    'Light withers thorns and shades.',
    'Light opens bloom bridges.',
    'But the lantern drains. Collect dew.',
    'Fill the dew quota, then reach the gate.',
  ];
  rows.forEach((row, i) => drawText(ctx, row, 62, 290 + i * 28, 13, i === 4 ? COLOR.dew : COLOR.cream, 'left', 500));

  card(ctx, 500, 228, 420, 224, '#c0b0ff');
  drawText(ctx, 'MEET THE DARK', 522, 258, 15, COLOR.gold);
  const foes = [
    ['SHADE MOTH', 'patrols the ground; burn it with light', COLOR.shade],
    ['WISP', 'drifts toward you; a glance dispels it', COLOR.wisp],
    ['THORN', 'hurts on touch; light clears the way', COLOR.thorn],
  ];
  foes.forEach((foe, i) => {
    const y = 292 + i * 48;
    ctx.fillStyle = foe[2];
    ctx.fillRect(522, y - 11, 9, 9);
    drawText(ctx, foe[0], 542, y, 14, COLOR.cream);
    drawText(ctx, foe[1], 542, y + 16, 11, COLOR.dim, 'left', 500);
  });

  ctx.globalAlpha = pulse;
  drawPixelText(ctx, 'PRESS ENTER TO BEGIN', RULES.width / 2, 506, 3, COLOR.cream, 'center');
  ctx.globalAlpha = 1;
  drawText(ctx, 'A - garden atlas     BEST ' + formatScore(game.save.data.best), RULES.width / 2, 544, 14, COLOR.gold, 'center');
  drawText(ctx, 'The first garden plays itself behind this page', RULES.width / 2, 572, 11, COLOR.dim, 'center');
  ctx.restore();
}

export function drawAtlas(ctx, game, time) {
  ctx.save();
  drawPixelText(ctx, 'THE FOUR GARDENS', RULES.width / 2, 62, 4, COLOR.cream, 'center');
  drawText(ctx, 'Clear a garden to open the next', RULES.width / 2, 100, 14, COLOR.dim, 'center');

  LEVELS.forEach((level, index) => {
    const x = 28 + index * 232;
    const y = 128;
    const open = index <= game.save.data.unlocked;
    const accent = open ? [COLOR.dew, COLOR.heart, COLOR.wisp, COLOR.bloom][index] : COLOR.dim;
    card(ctx, x, y, 214, 316, accent);
    ctx.globalAlpha = open ? 1 : 0.5;
    drawPixelText(ctx, `GARDEN ${index + 1}`, x + 14, y + 26, 2, accent);
    drawPixelText(ctx, level.name, x + 14, y + 60, 2, COLOR.cream);
    drawText(ctx, level.note, x + 14, y + 94, 11, COLOR.dim, 'left', 500);

    // A tiny hand-pixeled vignette for each garden.
    ctx.fillStyle = ['#2b2352', '#3a1f46', '#1e3557', '#2a2a5e'][index];
    ctx.fillRect(x + 14, y + 108, 186, 92);
    ctx.fillStyle = accent;
    ctx.globalAlpha = open ? 0.6 : 0.2;
    for (let i = 0; i < 6; i += 1) {
      ctx.fillRect(x + 26 + i * 28, y + 170 - (i % 3) * 20, 10, 10);
      ctx.fillRect(x + 30 + i * 28, y + 180 - (i % 3) * 20, 4, 18);
    }
    ctx.globalAlpha = open ? 1 : 0.5;

    drawText(ctx, `DEW ${game.save.data.dew[index] || 0} / ${level.dewGoal}`, x + 14, y + 226, 14, COLOR.dew);
    const best = game.save.data.times[index] || 0;
    drawText(ctx, best ? `BEST ${best.toFixed(1)}s` : 'BEST --', x + 14, y + 252, 13, COLOR.dim);
    if (open) drawPixelText(ctx, `PRESS ${index + 1}`, x + 14, y + 284, 2, COLOR.gold);
    else drawPixelText(ctx, 'LOCKED', x + 14, y + 284, 2, COLOR.heart);
  });

  const pulse = 0.7 + Math.sin(time * 3) * 0.3;
  ctx.globalAlpha = pulse;
  drawText(ctx, 'ENTER - back to title', RULES.width / 2, 504, 18, COLOR.cream, 'center');
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawPause(ctx) {
  ctx.save();
  ctx.fillStyle = '#050412bb';
  ctx.fillRect(0, 0, RULES.width, RULES.height);
  drawPixelText(ctx, 'PAUSED', RULES.width / 2, 270, 5, COLOR.cream, 'center');
  drawText(ctx, 'P to resume', RULES.width / 2, 316, 17, COLOR.dim, 'center');
  ctx.restore();
}

export function drawResults(ctx, game, time) {
  const victory = game.outcome === 'victory';
  const cleared = game.outcome === 'cleared';
  const accent = victory ? COLOR.gold : cleared ? COLOR.dew : COLOR.heart;
  const pulse = 0.7 + Math.sin(time * 4) * 0.3;

  ctx.save();
  ctx.fillStyle = '#050412d8';
  ctx.fillRect(0, 0, RULES.width, RULES.height);
  ctx.shadowColor = accent;
  ctx.shadowBlur = 16;
  drawPixelText(ctx, victory ? 'THE GARDENS REMEMBER' : cleared ? 'GARDEN CLEARED' : 'THE LIGHT WENT OUT', RULES.width / 2, 118, 4, accent, 'center');
  ctx.shadowBlur = 0;
  drawText(ctx, game.endReason, RULES.width / 2, 154, 15, COLOR.dim, 'center', 500);

  card(ctx, 190, 184, 580, 258, accent);
  const stats = [
    ['SCORE', formatScore(game.score)],
    ['BEST', formatScore(game.save.data.best)],
    ['GARDEN', `${game.levelIndex + 1} / 4  ${game.level.name}`],
    ['DEW GATHERED', `${game.dew} / ${game.level.dewGoal}`],
    ['SHADES & WISPS WITHERED', String(game.withered)],
    ['FALLS', String(game.falls)],
    ['TIME', `${game.elapsed.toFixed(1)}s`],
  ];
  stats.forEach((row, i) => {
    const y = 222 + i * 30;
    drawText(ctx, row[0], 220, y, 14, COLOR.dim);
    drawText(ctx, row[1], 740, y, 15, COLOR.cream, 'right');
  });

  ctx.globalAlpha = pulse;
  drawPixelText(ctx, cleared || victory ? 'ENTER - next garden' : 'ENTER - try again', RULES.width / 2, 490, 3, COLOR.cream, 'center');
  ctx.globalAlpha = 1;
  drawText(ctx, 'A - atlas', RULES.width / 2, 532, 15, COLOR.dim, 'center', 500);
  ctx.restore();
}
