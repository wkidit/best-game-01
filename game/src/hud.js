// Race HUD: standings with gaps, lap timing, minimap, speedo, lamp and flares.

import { COLOR, RULES, formatTime } from './config.js';
import { drawText, roundedRect } from './geometry.js';
import { drawPixelText } from './font.js';
import { drawMinimap } from './minimap.js';

function panel(ctx, x, y, w, h, accent, fill = '#080a1eee') {
  ctx.fillStyle = fill;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  roundedRect(ctx, x, y, w, h, 6);
  ctx.fill();
  ctx.stroke();
}

function bar(ctx, x, y, w, h, value, color) {
  ctx.fillStyle = '#1d2340';
  ctx.fillRect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fillRect(x, y, Math.max(3, w * Math.max(0, Math.min(1, value))), h);
}

export function drawHUD(ctx, game) {
  ctx.save();
  const w = RULES.width;
  const h = RULES.height;
  const order = game.order;
  const you = game.player;
  const place = game.playerPlace;

  panel(ctx, 12, 10, 248, 86, '#6a5a9a');
  drawPixelText(ctx, game.circuit.name, 26, 22, 2, COLOR.cream);
  drawText(ctx, `LAP ${Math.min(you.lap, RULES.laps)} / ${RULES.laps}`, 26, 56, 14, COLOR.gold);
  drawText(ctx, `${formatTime(game.clock)}`, 26, 80, 15, COLOR.cream);

  panel(ctx, w / 2 - 130, 10, 260, 62, '#6a5a9a');
  drawPixelText(ctx, `P${place} / ${game.racers.length}`, w / 2, 26, 3, place === 1 ? COLOR.gold : COLOR.cream, 'center');
  drawText(ctx, `BEST LAP ${you.bestLap ? formatTime(you.bestLap) : '--:--.--'}`, w / 2, 60, 13, COLOR.dim, 'center');

  panel(ctx, w - 260, 10, 248, 86, '#6a5a9a');
  drawText(ctx, 'LANTERN', w - 248, 32, 12, COLOR.dim);
  bar(ctx, w - 248, 40, 222, 13, you.lamp / RULES.lampMax, you.lamp > 25 ? COLOR.gold : COLOR.danger);
  drawText(ctx, `${Math.round(you.lamp)}%`, w - 18, 32, 12, COLOR.cream, 'right');
  drawText(ctx, 'FLARE', w - 248, 72, 12, COLOR.dim);
  for (let i = 0; i < 5; i += 1) {
    ctx.fillStyle = i < you.flares ? COLOR.boost : '#2a2444';
    ctx.fillRect(w - 200 + i * 16, 63, 11, 11);
  }

  // Live standings with time gaps.
  panel(ctx, 12, 108, 248, 214, '#6a5a9a', '#080a1ee8');
  drawText(ctx, 'STANDINGS', 26, 132, 13, COLOR.gold);
  order.slice(0, 7).forEach((row, i) => {
    const y = 154 + i * 23;
    ctx.fillStyle = row.racer.color;
    ctx.fillRect(26, y - 9, 7, 7);
    drawText(ctx, `${row.place}.`, 40, y, 12, COLOR.dim);
    drawText(ctx, row.racer.name, 62, y, 12, row.racer.isPlayer ? COLOR.gold : COLOR.cream, 'left', row.racer.isPlayer ? 800 : 500);
    drawText(ctx, row.place === 1 ? 'LEADER' : `+${row.gap.toFixed(1)}s`, 250, y, 11, COLOR.dim, 'right');
  });

  // Minimap and speedo.
  panel(ctx, w - 260, 108, 248, 214, '#6a5a9a', '#080a1ee8');
  drawText(ctx, 'CIRCUIT MAP', w - 248, 132, 13, COLOR.gold);
  drawMinimap(ctx, game.track, game.racers, w - 248, 142, 224, 146);
  drawText(ctx, `${Math.round(you.speed)} km/h`, w - 20, 316, 13, COLOR.cream, 'right');

  panel(ctx, 266, 86, 428, 44, '#8a6a3a', '#1a1430ee');
  drawText(ctx, 'WIN  finish ahead of the field', 480, 104, 12, COLOR.gold, 'center');
  drawText(ctx, 'LOSE  last place, or run out of light in the dark', 480, 121, 11, COLOR.danger, 'center');

  panel(ctx, 12, h - 88, 320, 76, '#6a5a9a');
  drawText(ctx, 'CONTROLS', 26, h - 64, 12, COLOR.gold);
  drawText(ctx, 'WASD / ARROWS steer + throttle', 26, h - 42, 12, COLOR.cream, 'left', 500);
  drawText(ctx, 'SHIFT shine   SPACE boost   F flare', 26, h - 22, 12, COLOR.dew, 'left', 500);

  panel(ctx, w - 332, h - 88, 320, 76, '#6a5a9a');
  drawText(ctx, `SPLIT  ${formatTime(you.lastLap || 0)}`, w - 318, h - 64, 12, COLOR.gold);
  drawText(ctx, `CIRCUIT ${game.circuitIndex + 1} / 4   P pause`, w - 318, h - 42, 12, COLOR.cream, 'left', 500);
  drawText(ctx, 'A garage   M mute   R restart', w - 318, h - 22, 12, COLOR.dim, 'left', 500);

  if (game.muted) drawText(ctx, 'MUTED', w / 2, h - 16, 12, COLOR.dim, 'center');
  ctx.restore();
}
