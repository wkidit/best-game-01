// The in-reef HUD: zone, wave, pearl quota, hull, score, combo and dash.

import { COLOR, RULES, formatScore } from './config.js';
import { drawText, roundedRect } from './geometry.js';

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = '#04141ee0';
  ctx.strokeStyle = '#2c5a63';
  ctx.lineWidth = 1;
  roundedRect(ctx, x, y, w, h, 8);
  ctx.fill();
  ctx.stroke();
}

export function drawHUD(ctx, game) {
  ctx.save();
  const zone = game.reef;

  panel(ctx, 16, 14, 232, 74);
  drawText(ctx, zone.name, 30, 38, 15, COLOR.eel);
  drawText(ctx, `WAVE ${game.waveIndex + 1}/${zone.waves.length}`, 30, 62, 13, COLOR.dim);
  drawText(ctx, `PEARLS ${game.pearls}/${zone.pearlGoal}`, 30, 80, 14, game.pearls >= zone.pearlGoal ? COLOR.gold : COLOR.pearl);

  panel(ctx, RULES.width - 224, 14, 208, 74);
  drawText(ctx, 'SCORE', RULES.width - 210, 38, 12, COLOR.dim);
  drawText(ctx, formatScore(game.score), RULES.width - 210, 70, 28, COLOR.text);
  if (game.combo > 1) {
    drawText(ctx, `x${game.combo}`, RULES.width - 24, 66, 22, COLOR.gold, 'right');
  }

  panel(ctx, RULES.width / 2 - 90, 14, 180, 50);
  drawText(ctx, `REEF ${game.reefIndex + 1} / 4`, RULES.width / 2, 38, 14, COLOR.dim, 'center');
  drawText(ctx, `${game.elapsed.toFixed(1)}s`, RULES.width / 2, 57, 15, COLOR.text, 'center');

  panel(ctx, 16, RULES.height - 66, 230, 50);
  drawText(ctx, 'HULL', 30, RULES.height - 46, 12, COLOR.dim);
  for (let i = 0; i < RULES.maxHull; i += 1) {
    const x = 34 + i * 30;
    const y = RULES.height - 30;
    ctx.fillStyle = i < game.hull ? '#5fd9c088' : '#22404444';
    ctx.strokeStyle = i < game.hull ? COLOR.eel : '#2c4a50';
    ctx.lineWidth = 1.5;
    roundedRect(ctx, x, y - 9, 22, 16, 5);
    ctx.fill();
    ctx.stroke();
  }

  panel(ctx, RULES.width - 222, RULES.height - 66, 206, 50);
  drawText(ctx, 'DASH', RULES.width - 208, RULES.height - 46, 12, COLOR.dim);
  const ready = 1 - game.player.dashCooldown / RULES.dashCooldown;
  ctx.fillStyle = '#1a3a40';
  ctx.fillRect(RULES.width - 208, RULES.height - 36, 178, 8);
  ctx.fillStyle = ready >= 1 ? COLOR.gold : COLOR.eel;
  ctx.fillRect(RULES.width - 208, RULES.height - 36, 178 * Math.max(0, ready), 8);
  drawText(ctx, ready >= 1 ? 'READY' : 'CHARGING', RULES.width - 30, RULES.height - 46, 12, ready >= 1 ? COLOR.gold : COLOR.dim, 'right');

  drawText(ctx, `FOES ${game.enemies.length}`, RULES.width / 2, RULES.height - 30, 13, COLOR.dim, 'center');
  if (game.muted) drawText(ctx, 'MUTED', RULES.width - 24, RULES.height - 84, 12, COLOR.dim, 'right');

  ctx.restore();
}
