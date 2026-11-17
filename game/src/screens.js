// Menus: title with enemy legend, four-reef atlas, pause and stats-rich results.

import { COLOR, RULES, formatScore } from './config.js';
import { ENEMY_LEGEND, REEFS } from './waves.js';
import { drawText, roundedRect } from './geometry.js';

function card(ctx, x, y, w, h, accent) {
  ctx.fillStyle = '#04121eee';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  roundedRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.stroke();
}

function legendColor(key) {
  return key === 'drifter' ? COLOR.drifter : key === 'spitter' ? COLOR.spitter : COLOR.brute;
}

export function drawTitle(ctx, game, time) {
  const pulse = 0.72 + Math.sin(time * 3) * 0.28;
  ctx.save();

  ctx.shadowColor = COLOR.eel;
  ctx.shadowBlur = 26;
  drawText(ctx, 'TIDEGLASS', RULES.width / 2, 132, 66, COLOR.eel, 'center', 800);
  ctx.shadowBlur = 0;
  drawText(ctx, 'FOUR REEFS  -  ONE LIGHT', RULES.width / 2, 164, 16, COLOR.dim, 'center', 600);

  card(ctx, 46, 196, 420, 212, '#2c5a63');
  drawText(ctx, 'MEET THE DEEP', 70, 224, 14, COLOR.gold);
  ENEMY_LEGEND.forEach((entry, index) => {
    const y = 258 + index * 50;
    ctx.fillStyle = legendColor(entry.key);
    ctx.beginPath();
    ctx.arc(82, y - 5, 8, 0, Math.PI * 2);
    ctx.fill();
    drawText(ctx, entry.name, 102, y, 15, COLOR.text);
    drawText(ctx, entry.text, 102, y + 17, 12, COLOR.dim, 'left', 500);
  });

  card(ctx, 494, 196, 420, 212, '#2c5a63');
  drawText(ctx, 'HOW TO DIVE', 518, 224, 14, COLOR.gold);
  const rows = [
    ['MOVE', 'W A S D  /  ARROWS'],
    ['DASH', 'SPACE  -  break through foes'],
    ['PULSE', 'CLICK / J  -  fire toward cursor'],
    ['MENU', 'P pause   M mute'],
  ];
  rows.forEach((row, index) => {
    const y = 262 + index * 34;
    drawText(ctx, row[0], 518, y, 13, COLOR.eel);
    drawText(ctx, row[1], 600, y, 13, COLOR.text, 'left', 500);
  });

  ctx.globalAlpha = pulse;
  drawText(ctx, 'PRESS ENTER TO DIVE', RULES.width / 2, 458, 23, COLOR.text, 'center');
  ctx.globalAlpha = 1;
  drawText(ctx, 'ENTER - atlas    A - four-reef atlas', RULES.width / 2, 490, 14, COLOR.dim, 'center', 500);
  drawText(ctx, `BEST ${formatScore(game.save.data.best)}`, RULES.width / 2, 530, 15, COLOR.gold, 'center');
  drawText(ctx, 'Autopilot demo plays behind this menu', RULES.width / 2, 566, 12, COLOR.dim, 'center', 500);
  ctx.restore();
}

export function drawAtlas(ctx, game, time) {
  ctx.save();
  drawText(ctx, 'THE FOUR REEFS', RULES.width / 2, 76, 40, COLOR.eel, 'center', 800);
  drawText(ctx, 'Clear a reef to open the next', RULES.width / 2, 106, 15, COLOR.dim, 'center', 500);

  REEFS.forEach((reef, index) => {
    const x = 34 + index * 232;
    const y = 150;
    const open = index <= game.save.data.unlocked;
    const accent = open ? [COLOR.eel, '#7bf0b0', '#ff9a6b', '#b3a4ff'][index] : COLOR.lock;
    card(ctx, x, y, 212, 292, accent);
    ctx.globalAlpha = open ? 1 : 0.55;
    drawText(ctx, `REEF ${index + 1}`, x + 16, y + 32, 14, accent);
    drawText(ctx, reef.name, x + 16, y + 60, 17, COLOR.text, 'left', 800);
    drawText(ctx, reef.note, x + 16, y + 88, 12, COLOR.dim, 'left', 500);

    // A small illustrated scene for each reef.
    ctx.fillStyle = ['#11505a', '#155044', '#5a2927', '#2b255c'][index];
    roundedRect(ctx, x + 14, y + 104, 184, 92, 8);
    ctx.fill();
    ctx.fillStyle = ['#6fe0c8', '#7bf0b0', '#ff9a6b', '#a99bff'][index];
    ctx.globalAlpha = open ? 0.5 : 0.2;
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.arc(x + 34 + i * 34, y + 170 - (i % 3) * 24, 8 + (i % 2) * 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = open ? 1 : 0.55;

    drawText(ctx, `PEARLS  ${game.save.data.pearls[index] || 0} / ${reef.pearlGoal}`, x + 16, y + 222, 13, COLOR.pearl);
    const bestTime = game.save.data.bestTimes[index] || 0;
    drawText(ctx, bestTime ? `BEST ${bestTime.toFixed(1)}s` : 'BEST  --', x + 16, y + 246, 13, COLOR.dim);
    if (open) {
      drawText(ctx, `PRESS ${index + 1} TO DIVE`, x + 16, y + 276, 13, COLOR.gold);
    } else {
      drawText(ctx, 'LOCKED', x + 16, y + 276, 14, COLOR.danger);
    }
  });

  const pulse = 0.7 + Math.sin(time * 3) * 0.3;
  ctx.globalAlpha = pulse;
  drawText(ctx, 'ENTER - back to title', RULES.width / 2, 490, 18, COLOR.text, 'center');
  ctx.globalAlpha = 1;
  ctx.restore();
}

export function drawPause(ctx) {
  ctx.save();
  ctx.fillStyle = '#030d16aa';
  ctx.fillRect(0, 0, RULES.width, RULES.height);
  drawText(ctx, 'PAUSED', RULES.width / 2, 290, 54, COLOR.text, 'center', 800);
  drawText(ctx, 'P to resume', RULES.width / 2, 330, 18, COLOR.dim, 'center', 500);
  ctx.restore();
}

export function drawResults(ctx, game, time) {
  const won = game.outcome === 'victory';
  const cleared = game.outcome === 'cleared';
  const accent = won ? COLOR.gold : cleared ? COLOR.eel : COLOR.danger;
  const pulse = 0.7 + Math.sin(time * 4) * 0.3;

  ctx.save();
  ctx.fillStyle = '#030d16c8';
  ctx.fillRect(0, 0, RULES.width, RULES.height);

  ctx.shadowColor = accent;
  ctx.shadowBlur = 22;
  drawText(ctx, won ? 'THE ABYSS REMEMBERS YOU' : cleared ? 'REEF CLEARED' : 'LIGHT EXTINGUISHED', RULES.width / 2, 122, 42, accent, 'center', 800);
  ctx.shadowBlur = 0;
  drawText(ctx, game.endReason, RULES.width / 2, 154, 15, COLOR.dim, 'center', 500);

  card(ctx, 200, 184, 560, 250, accent);
  const stats = [
    ['SCORE', formatScore(game.score)],
    ['BEST', formatScore(game.save.data.best)],
    ['REEF REACHED', `${game.reefIndex + 1} / 4  ${game.reef.name}`],
    ['WAVE', `${game.waveIndex + 1} / ${game.reef.waves.length}`],
    ['PEARLS', `${game.pearls} / ${game.reef.pearlGoal}`],
    ['FOES BROKEN', String(game.totalKills)],
    ['TIME', `${game.elapsed.toFixed(1)}s`],
  ];
  stats.forEach((row, index) => {
    const y = 220 + index * 29;
    drawText(ctx, row[0], 230, y, 14, COLOR.dim);
    drawText(ctx, row[1], 730, y, 15, COLOR.text, 'right', 700);
  });

  ctx.globalAlpha = pulse;
  drawText(ctx, cleared || won ? 'ENTER - next reef' : 'ENTER - dive again', RULES.width / 2, 486, 22, COLOR.text, 'center');
  ctx.globalAlpha = 1;
  drawText(ctx, 'A - atlas', RULES.width / 2, 520, 15, COLOR.dim, 'center', 500);
  ctx.restore();
}
