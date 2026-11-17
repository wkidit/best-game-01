// Seeded attract-mode demo: a self-playing dive runs behind the title screen.

import { RULES } from './config.js';
import { createRandom } from './random.js';
import { Player } from './player.js';
import { Pearl } from './entities.js';
import { makeEnemy } from './entities.js';
import { Particles } from './particles.js';
import { Pulse } from './entities.js';
import { angleTo } from './geometry.js';

export function createAttractWorld() {
  const random = createRandom(20261117);
  const world = {
    player: new Player(430, 320),
    pearls: [],
    enemies: [],
    pulses: [],
    particles: new Particles(),
    time: 0,
    fireTimer: 0,
  };

  for (let i = 0; i < 9; i += 1) {
    world.pearls.push(new Pearl(80 + random() * 800, 80 + random() * 440));
  }
  ['drifter', 'spitter', 'brute', 'drifter'].forEach((kind) => {
    world.enemies.push(makeEnemy(kind, 120 + random() * 720, 100 + random() * 400, 1));
  });
  return world;
}

export function updateAttract(world, dt) {
  world.time += dt;
  const player = world.player;
  const t = world.time;

  // A smooth patrol that sweeps the reef without needing a human.
  const target = {
    x: RULES.width / 2 + Math.cos(t * 0.62) * 280,
    y: RULES.height / 2 + Math.sin(t * 0.91) * 170,
  };
  const nearestPearl = world.pearls[Math.floor(t * 0.8) % world.pearls.length];
  if (nearestPearl) {
    target.x = target.x * 0.45 + nearestPearl.x * 0.55;
    target.y = target.y * 0.45 + nearestPearl.y * 0.55;
  }

  const angle = angleTo(player, target);
  const fakeInput = {
    direction: () => ({ x: Math.cos(angle), y: Math.sin(angle) }),
  };
  player.update(dt, fakeInput, world.particles);

  world.fireTimer -= dt;
  if (world.fireTimer <= 0) {
    world.fireTimer = 0.55;
    const aim = world.enemies[Math.floor(t) % world.enemies.length];
    if (aim) world.pulses.push(new Pulse(player.x, player.y, angleTo(player, aim), '#8ff5d8'));
  }

  for (const pulse of world.pulses) pulse.update(dt);
  world.pulses = world.pulses.filter((p) => p.life > 0);
  for (const enemy of world.enemies) enemy.update(dt, player, world);
  world.particles.update(dt);

  // Recycle collected pearls so the demo never runs dry.
  world.pearls = world.pearls.filter((p) => Math.hypot(p.x - player.x, p.y - player.y) > 26);
  while (world.pearls.length < 9) {
    world.pearls.push(new Pearl(80 + Math.random() * 800, 80 + Math.random() * 440));
  }
}

export function drawAttract(ctx, world) {
  world.particles.draw(ctx);
  for (const pearl of world.pearls) pearl.draw(ctx, world.time);
  for (const enemy of world.enemies) enemy.draw(ctx);
  for (const pulse of world.pulses) pulse.draw(ctx);
  world.player.draw(ctx, world.time);
}
