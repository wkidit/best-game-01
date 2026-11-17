// Full-screen menus: title, pause and results. These are real game states, drawn by the game.

import { COLOR, RULES, formatScore } from './config.js';

function centerText(ctx, text, y, size, color, weight = 800) {
  ctx.font = `${weight} ${size}px "Trebuchet MS", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.fillText(text, RULES.width / 2, y);
}

function card(ctx, x, y, w, h, accent) {
  ctx.fillStyle = '#080d24e6';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
  ctx.stroke();
}

export function drawTitle(ctx, game, time) {
  const pulse = 0.75 + Math.sin(time * 3) * 0.25;

  ctx.save();
  ctx.shadowColor = COLOR.ember;
  ctx.shadowBlur = 28;
  centerText(ctx, 'EMBER', 178, 76, COLOR.ember);
  centerText(ctx, 'DRIFT', 256, 76, COLOR.mote);
  ctx.shadowBlur = 0;

  centerText(ctx, 'A NEON DODGE-AND-COLLECT RUN', 298, 17, COLOR.textDim, 600);

  card(ctx, 220, 330, 520, 148, '#2b3566');
  const rows = [
    ['MOVE', 'W A S D  /  ARROW KEYS'],
    ['DASH', 'SPACE  -  smash through shards'],
    ['PAUSE', 'P  /  ESC'],
    ['SOUND', 'M  -  mute or unmute'],
  ];
  rows.forEach((row, index) => {
    const y = 362 + index * 32;
    ctx.font = '700 15px "Trebuchet MS", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = COLOR.accent;
    ctx.fillText(row[0], 252, y);
    ctx.fillStyle = COLOR.text;
    ctx.fillText(row[1], 360, y);
  });

  ctx.globalAlpha = pulse;
  centerText(ctx, 'PRESS ENTER TO BEGIN', 528, 24, COLOR.text);
  ctx.globalAlpha = 1;
  centerText(ctx, `BEST  ${formatScore(game.best)}`, 566, 14, COLOR.textDim, 600);
  ctx.restore();
}

export function drawPause(ctx, time) {
  ctx.save();
  ctx.fillStyle = '#04060faa';
  ctx.fillRect(0, 0, RULES.width, RULES.height);
  ctx.shadowColor = COLOR.accent;
  ctx.shadowBlur = 20;
  centerText(ctx, 'PAUSED', 290, 58, COLOR.text);
  ctx.shadowBlur = 0;
  centerText(ctx, 'PRESS P TO RESUME', 348, 20, COLOR.textDim, 600);
  ctx.restore();
}

export function drawResults(ctx, game, time) {
  const won = game.outcome === 'won';
  const accent = won ? COLOR.mote : COLOR.danger;
  const pulse = 0.7 + Math.sin(time * 4) * 0.3;

  ctx.save();
  ctx.fillStyle = '#04060fbb';
  ctx.fillRect(0, 0, RULES.width, RULES.height);

  ctx.shadowColor = accent;
  ctx.shadowBlur = 26;
  centerText(ctx, won ? 'RUN COMPLETE' : 'EMBER LOST', 168, 54, accent);
  ctx.shadowBlur = 0;
  centerText(ctx, won ? 'You carried the light through.' : game.endReason, 204, 17, COLOR.textDim, 600);

  card(ctx, 270, 232, 420, 186, accent);
  centerText(ctx, 'FINAL SCORE', 270, 18, COLOR.textDim, 600);
  ctx.shadowColor = accent;
  ctx.shadowBlur = 18;
  centerText(ctx, formatScore(game.score), 332, 56, accent);
  ctx.shadowBlur = 0;
  centerText(ctx, `BEST ${formatScore(game.best)}`, 372, 18, COLOR.textDim, 600);
  centerText(ctx, `SURVIVED ${game.elapsed.toFixed(1)}s   -   LEVEL ${game.level}`, 404, 15, COLOR.textDim, 600);

  ctx.globalAlpha = pulse;
  centerText(ctx, 'PRESS ENTER TO RUN AGAIN', 486, 24, COLOR.text);
  ctx.globalAlpha = 1;
  centerText(ctx, 'Thanks for playing Ember Drift', 552, 14, COLOR.accent, 600);
  ctx.restore();
}
