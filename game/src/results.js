// Race results: finishing order, points earned and unlocks.

import { pointsFor } from './standings.js';

export function buildResults(racers, playerIndex) {
  const order = [...racers].sort((a, b) => {
    if (a.finished && b.finished) return a.finishTime - b.finishTime;
    if (a.finished) return -1;
    if (b.finished) return 1;
    return b.total - a.total;
  });
  const rows = order.map((racer, index) => ({
    name: racer.name,
    color: racer.color,
    place: index + 1,
    time: racer.finishTime || 0,
    bestLap: racer.bestLap || 0,
    points: pointsFor(index + 1),
    you: racer.isPlayer,
  }));
  const you = rows.find((row) => row.you) || rows[playerIndex] || rows[0];
  return { rows, you };
}
