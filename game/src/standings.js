// Live order, positions and time gaps for the race feed.

export function standings(racers) {
  const order = [...racers].sort((a, b) => {
    if (a.finished && b.finished) return a.finishTime - b.finishTime;
    if (a.finished) return -1;
    if (b.finished) return 1;
    return b.total - a.total;
  });
  const leader = order[0];
  return order.map((racer, index) => ({
    racer,
    place: index + 1,
    gap: racer === leader ? 0 : (leader.total - racer.total) / Math.max(80, racer.speed || 80),
  }));
}

export function pointsFor(place) {
  return [10, 8, 6, 5, 4, 3, 2][place - 1] || 1;
}
