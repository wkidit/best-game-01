// Menus: title, garage tuning tree, circuit select, pause and results.

import { COLOR, RULES, formatTime } from './config.js';
import { CIRCUITS } from './config.js';
import { RIVALS } from './config.js';
import { drawText, roundedRect } from './geometry.js';
import { drawPixelText } from './font.js';
import { PARTS, costFor } from './tuning.js';

function card(ctx, x, y, w, h, accent) {
  ctx.fillStyle = '#080a1ef5';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  roundedRect(ctx, x, y, w, h, 7);
  ctx.fill();
  ctx.stroke();
}

export function drawTitle(ctx, game, time) {
  const pulse = 0.7 + Math.sin(time * 3) * 0.3;
  ctx.save();
  ctx.shadowColor = COLOR.gold;
  ctx.shadowBlur = 16;
  drawPixelText(ctx, 'NIGHTCOURIER', RULES.width / 2, 116, 6, COLOR.cream, 'center');
  ctx.shadowBlur = 0;
  drawPixelText(ctx, 'FOUR CANALS  SIX RIVALS  ONE LANTERN', RULES.width / 2, 184, 2, COLOR.gold, 'center');

  card(ctx, 40, 218, 420, 226, '#6a5a9a');
  drawText(ctx, 'THE CIRCUIT', 62, 248, 15, COLOR.gold);
  const rules = [
    'Race six named couriers over three laps.',
    'Your lamp lights the canal; dark water is slow.',
    'Dew cans refill the lamp, flares overtake.',
    'Earn points, then tune your skiff in the garage.',
    'Win the four-circuit league to take the crown.',
  ];
  rules.forEach((line, i) => drawText(ctx, line, 62, 280 + i * 28, 13, i === 4 ? COLOR.dew : COLOR.cream, 'left', 500));

  card(ctx, 500, 218, 420, 226, '#6a5a9a');
  drawText(ctx, 'THE FIELD', 522, 248, 15, COLOR.gold);
  RIVALS.forEach((rival, i) => {
    const y = 276 + i * 25;
    ctx.fillStyle = rival.color;
    ctx.fillRect(522, y - 9, 8, 8);
    drawText(ctx, rival.name, 540, y, 13, COLOR.cream, 'left', 500);
    drawText(ctx, `SKILL ${Math.round(rival.skill * 100)}`, 900, y, 11, COLOR.dim, 'right');
  });

  ctx.globalAlpha = pulse;
  drawPixelText(ctx, 'PRESS ENTER TO RACE', RULES.width / 2, 496, 3, COLOR.cream, 'center');
  ctx.globalAlpha = 1;
  drawText(ctx, 'A - garage   C - circuit select   G - league', RULES.width / 2, 536, 14, COLOR.gold, 'center');
  ctx.restore();
}

export function drawGarage(ctx, game, time) {
  ctx.save();
  drawPixelText(ctx, 'THE GARAGE', RULES.width / 2, 62, 5, COLOR.cream, 'center');
  drawText(ctx, `TUNING POINTS  ${game.save.data.points}`, RULES.width / 2, 102, 16, COLOR.gold, 'center');

  PARTS.forEach((part, index) => {
    const x = 40 + index * 300;
    const y = 132;
    card(ctx, x, y, 280, 300, '#6a5a9a');
    drawPixelText(ctx, part.name, x + 16, y + 28, 2, COLOR.cream);
    drawText(ctx, part.desc, x + 16, y + 58, 13, COLOR.dim);

    // Tuning tree: four nodes connected by a vertical line.
    ctx.strokeStyle = '#4a3f70';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 28, y + 90);
    ctx.lineTo(x + 28, y + 210);
    ctx.stroke();
    part.levels.forEach((label, level) => {
      const ny = y + 90 + level * 40;
      const owned = (game.save.data.tuning[part.key] || 0) >= level;
      ctx.fillStyle = owned ? COLOR.gold : '#2a2444';
      ctx.fillRect(x + 20, ny - 8, 16, 16);
      drawText(ctx, label, x + 48, ny + 4, 13, owned ? COLOR.cream : COLOR.dim, 'left', owned ? 700 : 500);
    });
    const level = game.save.data.tuning[part.key] || 0;
    if (level < 3) {
      drawText(ctx, `PRESS ${index + 1} TO BUY - ${costFor(level)} PTS`, x + 16, y + 266, 12, game.save.data.points >= costFor(level) ? COLOR.dew : COLOR.danger);
    } else {
      drawText(ctx, 'MAXED', x + 16, y + 266, 13, COLOR.gold);
    }
  });

  ctx.globalAlpha = 0.7 + Math.sin(time * 3) * 0.3;
  drawText(ctx, 'ENTER - title   L - league table', RULES.width / 2, 498, 18, COLOR.cream, 'center');
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawCircuitSelect(ctx, game, time) {
  ctx.save();
  drawPixelText(ctx, 'FOUR CANALS', RULES.width / 2, 62, 5, COLOR.cream, 'center');
  drawText(ctx, 'Clear a canal to unlock the next', RULES.width / 2, 100, 14, COLOR.dim, 'center');

  CIRCUITS.forEach((circuit, index) => {
    const x = 28 + index * 232;
    const y = 128;
    const open = index <= game.save.data.unlocked;
    card(ctx, x, y, 214, 316, open ? circuit.hue : COLOR.dim);
    ctx.globalAlpha = open ? 1 : 0.5;
    drawPixelText(ctx, `CANAL ${index + 1}`, x + 14, y + 26, 2, circuit.hue);
    drawPixelText(ctx, circuit.name, x + 14, y + 60, 2, COLOR.cream);
    drawText(ctx, circuit.note, x + 14, y + 94, 11, COLOR.dim, 'left', 500);

    ctx.fillStyle = circuit.hue;
    ctx.globalAlpha = open ? 0.4 : 0.15;
    ctx.beginPath();
    circuit.waypoints.forEach(([px, py], i) => {
      const sx = x + 14 + px * 0.19;
      const sy = y + 108 + py * 0.14;
      if (i === 0) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    });
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = open ? 1 : 0.5;

    const best = game.save.data.bestLaps[index] || 0;
    drawText(ctx, best ? `BEST ${formatTime(best)}` : 'BEST --', x + 14, y + 230, 13, COLOR.gold);
    drawText(ctx, '3 LAPS - 6 RIVALS', x + 14, y + 256, 12, COLOR.dim);
    if (open) drawPixelText(ctx, `PRESS ${index + 1}`, x + 14, y + 288, 2, COLOR.dew);
    else drawPixelText(ctx, 'LOCKED', x + 14, y + 288, 2, COLOR.heart || COLOR.danger);
  });

  ctx.globalAlpha = 0.7 + Math.sin(time * 3) * 0.3;
  drawText(ctx, 'ENTER - title   A - garage', RULES.width / 2, 504, 18, COLOR.cream, 'center');
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawLeague(ctx, game, time) {
  ctx.save();
  drawPixelText(ctx, 'THE DUSK BELT', RULES.width / 2, 66, 5, COLOR.gold, 'center');
  drawText(ctx, 'League points after each canal', RULES.width / 2, 106, 14, COLOR.dim, 'center');
  card(ctx, 200, 130, 560, 350, '#6a5a9a');
  const names = ['YOU', ...RIVALS.map((r) => r.name)];
  const pts = game.save.data.standings;
  names.forEach((name, i) => {
    const y = 166 + i * 40;
    const color = i === 0 ? COLOR.gold : RIVALS[i - 1].color;
    ctx.fillStyle = color;
    ctx.fillRect(230, y - 12, 10, 10);
    drawText(ctx, `${i + 1}.  ${name}`, 254, y, 15, i === 0 ? COLOR.gold : COLOR.cream, 'left', i === 0 ? 800 : 500);
    drawText(ctx, String(pts[i] || 0), 730, y, 16, COLOR.cream, 'right');
  });
  ctx.globalAlpha = 0.7 + Math.sin(time * 3) * 0.3;
  drawText(ctx, 'ENTER - title', RULES.width / 2, 528, 18, COLOR.cream, 'center');
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawPause(ctx) {
  ctx.save();
  ctx.fillStyle = '#05040fbb';
  ctx.fillRect(0, 0, RULES.width, RULES.height);
  drawPixelText(ctx, 'PAUSED', RULES.width / 2, 280, 5, COLOR.cream, 'center');
  drawText(ctx, 'P to resume', RULES.width / 2, 328, 17, COLOR.dim, 'center');
  ctx.restore();
}

export function drawResults(ctx, game, time) {
  const results = game.results;
  const you = results.you;
  const won = you.place === 1;
  const accent = won ? COLOR.gold : COLOR.dew;
  const pulse = 0.7 + Math.sin(time * 4) * 0.3;

  ctx.save();
  ctx.fillStyle = '#05040fe0';
  ctx.fillRect(0, 0, RULES.width, RULES.height);
  ctx.shadowColor = accent;
  ctx.shadowBlur = 14;
  drawPixelText(ctx, won ? 'CANAL WON' : 'RACE COMPLETE', RULES.width / 2, 106, 5, accent, 'center');
  ctx.shadowBlur = 0;
  drawText(ctx, `${you.name} placed #${you.place} - ${you.points} league points`, RULES.width / 2, 142, 16, COLOR.cream, 'center');

  card(ctx, 190, 166, 580, 300, accent);
  drawText(ctx, 'FINISH ORDER', 220, 194, 13, COLOR.gold);
  results.rows.forEach((row, i) => {
    const y = 222 + i * 31;
    ctx.fillStyle = row.color;
    ctx.fillRect(220, y - 10, 8, 8);
    drawText(ctx, `${row.place}. ${row.name}`, 238, y, 14, row.you ? COLOR.gold : COLOR.cream, 'left', row.you ? 800 : 500);
    drawText(ctx, row.bestLap ? formatTime(row.bestLap) : '--', 560, y, 13, COLOR.dim, 'right');
    drawText(ctx, `+${row.points} pts`, 740, y, 13, COLOR.dew, 'right');
  });

  ctx.globalAlpha = pulse;
  drawPixelText(ctx, 'ENTER - next canal', RULES.width / 2, 516, 3, COLOR.cream, 'center');
  ctx.globalAlpha = 1;
  drawText(ctx, 'A - garage   C - circuits   L - league', RULES.width / 2, 556, 14, COLOR.dim, 'center');
  ctx.restore();
}
