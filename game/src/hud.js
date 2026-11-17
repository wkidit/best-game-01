// Heads-up display: score, combo, shields, dash readiness and the round clock.

import { COLOR, RULES, formatScore } from './config.js';

function label(ctx, text, x, y, size, color, align = 'left') {
  ctx.font = `700 ${size}px "Trebuchet MS", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = '#0a0f2acc';
  ctx.strokeStyle = '#2b3566';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 8);
  ctx.fill();
  ctx.stroke();
}

export function drawHUD(ctx, game) {
  ctx.save();

  panel(ctx, 18, 16, 214, 66);
  label(ctx, 'SCORE', 32, 40, 13, COLOR.textDim);
  label(ctx, formatScore(game.score), 32, 70, 30, COLOR.text);

  if (game.combo > 1) {
    const intensity = Math.min(1, game.comboTimer / RULES.comboWindow);
    label(ctx, `x${game.combo} COMBO`, 232, 46, 18, COLOR.mote);
    ctx.fillStyle = '#ffd16644';
    ctx.fillRect(232, 54, 96 * intensity, 4);
  }

  const remaining = Math.max(0, RULES.roundSeconds - game.elapsed);
  panel(ctx, RULES.width - 150, 16, 132, 66);
  label(ctx, game.score >= RULES.goalScore ? 'GOAL MET' : 'TIME', RULES.width - 138, 40, 13, COLOR.textDim);
  label(ctx, `${remaining.toFixed(1)}s`, RULES.width - 134, 70, 28, remaining < 10 ? COLOR.danger : COLOR.text);

  panel(ctx, 18, RULES.height - 70, 214, 54);
  label(ctx, 'SHIELDS', 32, RULES.height - 46, 12, COLOR.textDim);
  for (let i = 0; i < RULES.maxShields; i += 1) {
    const x = 34 + i * 28;
    const y = RULES.height - 30;
    ctx.strokeStyle = i < game.shields ? COLOR.ember : '#33406f';
    ctx.fillStyle = i < game.shields ? '#7df9ff55' : '#33406f22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, y - 9);
    ctx.lineTo(x + 8, y - 5);
    ctx.lineTo(x + 8, y + 3);
    ctx.lineTo(x, y + 10);
    ctx.lineTo(x - 8, y + 3);
    ctx.lineTo(x - 8, y - 5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  panel(ctx, RULES.width - 190, RULES.height - 70, 172, 54);
  label(ctx, 'DASH', RULES.width - 176, RULES.height - 47, 12, COLOR.textDim);
  const ready = 1 - game.player.dashCooldown / RULES.dashCooldown;
  ctx.fillStyle = '#2b3566';
  ctx.fillRect(RULES.width - 176, RULES.height - 38, 144, 9);
  ctx.fillStyle = ready >= 1 ? COLOR.mote : COLOR.accent;
  ctx.fillRect(RULES.width - 176, RULES.height - 38, 144 * Math.max(0, ready), 9);
  label(ctx, ready >= 1 ? 'READY' : 'CHARGING', RULES.width - 32, RULES.height - 47, 12, ready >= 1 ? COLOR.mote : COLOR.textDim, 'right');

  label(ctx, `LEVEL ${game.level}`, RULES.width / 2, 34, 14, COLOR.textDim, 'center');
  if (game.muted) label(ctx, 'MUTED', RULES.width - 24, RULES.height - 86, 12, COLOR.textDim, 'right');

  ctx.restore();
}
