// Attract mode: the first garden plays itself behind the title screen.

import { RULES } from './config.js';
import { Player } from './player.js';
import { Shade } from './entities.js';
import { Particles } from './particles.js';

const fakeInput = {
  held: new Set(),
  pressed: new Set(),
  direction() { return { x: 1 }; },
};

export function createAttract() {
  return {
    player: new Player(80, 15 * RULES.tile),
    shades: [new Shade(11 * RULES.tile, 15 * RULES.tile), new Shade(20 * RULES.tile, 15 * RULES.tile)],
    particles: new Particles(),
    time: 0,
  };
}

export function updateAttract(attract, dt, tileAt, isSolid) {
  attract.time += dt;
  const p = attract.player;
  fakeInput.held.add('ShiftLeft');
  if (attract.time % 4 < 0.1) fakeInput.pressed.add('Space');
  p.update(dt, fakeInput, { sound: { pulse() {} }, tileAt, isSolid });
  fakeInput.pressed.clear();
  if (p.x > RULES.width - 120) { p.x = 80; p.vx = 0; }
  for (const shade of attract.shades) {
    shade.x += shade.vx * dt;
    if (shade.x < 40 || shade.x > RULES.width - 60) shade.vx *= -1;
  }
  attract.particles.update(dt);
}
