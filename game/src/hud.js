// A dense, readable HUD: objective, threat queue, relics, hull, dash and controls.

import { COLOR, RULES, formatScore } from './config.js';
import { drawText, roundedRect } from './geometry.js';

function panel(ctx, x, y, w, h, accent, fill = '#04141ef0') {
  ctx.fillStyle = fill;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  roundedRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.stroke();
}

function bar(ctx, x, y, w, h, value, color, back = '#173a40') {
  ctx.fillStyle = back;
  roundedRect(ctx, x, y, w, h, 4);
  ctx.fill();
  ctx.fillStyle = color;
  roundedRect(ctx, x, y, Math.max(4, w * Math.max(0, Math.min(1, value))), h, 4);
  ctx.fill();
}

export function drawHUD(ctx, game) {
  ctx.save();
  const reef = game.reef;
  const w = RULES.width;
  const h = RULES.height;

  // Objective and progress.
  panel(ctx, 14, 12, 250, 86, '#3c7b74');
  drawText(ctx, `REEF ${game.reefIndex + 1} / 4  -  ${reef.name}`, 28, 36, 15, COLOR.eel);
  drawText(ctx, `WAVE ${game.waveIndex + 1} / ${reef.waves.length}`, 28, 58, 13, COLOR.dim);
  drawText(ctx, 'PEARLS', 28, 80, 12, COLOR.dim);
  bar(ctx, 86, 70, 120, 9, game.pearls / reef.pearlGoal, COLOR.pearl);
  drawText(ctx, `${game.pearls}/${reef.pearlGoal}`, 212, 80, 13, COLOR.gold, 'right');

  // Score and combo.
  panel(ctx, w - 264, 12, 250, 86, '#3c7b74');
  drawText(ctx, 'SCORE', w - 250, 36, 12, COLOR.dim);
  drawText(ctx, formatScore(game.score), w - 250, 70, 29, COLOR.text);
  drawText(ctx, `BEST ${formatScore(game.save.data.best)}`, w - 22, 36, 12, COLOR.dim, 'right');
  if (game.combo > 1) drawText(ctx, `x${game.combo}`, w - 24, 76, 24, COLOR.gold, 'right');

  // Round status.
  panel(ctx, w / 2 - 108, 12, 216, 60, '#3c7b74');
  drawText(ctx, game.waveIndex === reef.waves.length - 1 ? 'FINAL WAVE' : 'DIVE IN PROGRESS', w / 2, 36, 13, COLOR.gold, 'center');
  drawText(ctx, `${game.elapsed.toFixed(1)}s`, w / 2, 58, 15, COLOR.text, 'center');

  // Threat queue: what is on the field and how to answer it.
  panel(ctx, 14, 112, 250, 126, '#3c7b74', '#04141ed8');
  drawText(ctx, 'THREAT QUEUE', 28, 136, 13, COLOR.gold);
  const threats = [
    ['DRIFTER', COLOR.drifter, 'follows  -  dash through'],
    ['SPITTER', COLOR.spitter, 'keeps range  -  close in'],
    ['BRUTE', COLOR.brute, 'rings, then charges'],
  ];
  threats.forEach((row, index) => {
    const y = 160 + index * 25;
    ctx.fillStyle = row[1];
    ctx.beginPath();
    ctx.arc(34, y - 4, 5, 0, Math.PI * 2);
    ctx.fill();
    drawText(ctx, row[0], 48, y, 13, COLOR.text);
    drawText(ctx, row[2], 48, y + 11, 10, COLOR.dim, 'left', 500);
  });

  // Relics: persistent upgrades that signal a deeper build.
  panel(ctx, w - 264, 112, 250, 126, '#3c7b74', '#04141ed8');
  drawText(ctx, 'RELICS HELD', w - 250, 136, 13, COLOR.gold);
  const relics = [
    ['Twin Gill', 'dash recharges faster'],
    ['Pearl Lens', 'pearls shine farther'],
    ['Tide Ward', '+1 hull on reef clear'],
    ['Ember Shard', 'pulse breaks one more'],
  ];
  relics.forEach((row, index) => {
    const y = 160 + index * 25;
    ctx.fillStyle = index % 2 ? COLOR.brute : COLOR.eel;
    ctx.beginPath();
    ctx.arc(w - 246, y - 4, 4, 0, Math.PI * 2);
    ctx.fill();
    drawText(ctx, row[0], w - 234, y, 12, COLOR.text);
    drawText(ctx, row[1], w - 234, y + 11, 10, COLOR.dim, 'left', 500);
  });

  // Win and lose conditions spelled out in the screenshot.
  panel(ctx, 266, 84, 428, 44, '#7a5c2e', '#1a1608e8');
  drawText(ctx, 'WIN  clear every foe and fill the pearl quota', 480, 103, 12, COLOR.gold, 'center');
  drawText(ctx, 'LOSE  hull reaches zero', 480, 120, 12, COLOR.danger, 'center');

  // Hull and abilities.
  panel(ctx, 14, h - 92, 290, 78, '#3c7b74');
  drawText(ctx, 'HULL', 28, h - 70, 12, COLOR.dim);
  drawText(ctx, `${game.hull}/${RULES.maxHull}`, 290, h - 70, 13, COLOR.eel, 'right');
  bar(ctx, 28, h - 62, 262, 12, game.hull / RULES.maxHull, COLOR.eel);
  drawText(ctx, 'DASH', 28, h - 34, 12, COLOR.dim);
  bar(ctx, 70, h - 44, 100, 8, 1 - game.player.dashCooldown / RULES.dashCooldown, COLOR.gold);
  drawText(ctx, 'PULSE', 194, h - 34, 12, COLOR.dim);
  bar(ctx, 236, h - 44, 54, 8, 1 - game.player.pulseCooldown / RULES.pulseCooldown, COLOR.brute);

  panel(ctx, w - 304, h - 92, 290, 78, '#3c7b74');
  drawText(ctx, 'CONTROLS', w - 290, h - 70, 12, COLOR.gold);
  drawText(ctx, 'WASD move   SPACE dash   CLICK pulse', w - 290, h - 50, 12, COLOR.text, 'left', 500);
  drawText(ctx, 'P pause   M mute   A atlas', w - 290, h - 32, 12, COLOR.dim, 'left', 500);
  drawText(ctx, `FOES ${game.enemies.length}`, w - 20, h - 70, 12, COLOR.brute, 'right');

  if (game.muted) drawText(ctx, 'MUTED', w / 2, h - 18, 12, COLOR.dim, 'center');
  ctx.restore();
}
