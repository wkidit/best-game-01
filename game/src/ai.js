// Rival decisions: pick a lane, manage the lamp and use flares to overtake.

import { RULES, clamp } from './config.js';

export function rivalControl(racer, track, world, dt) {
  racer.thinkTimer = (racer.thinkTimer || 0) - dt;
  if (racer.thinkTimer <= 0) {
    racer.thinkTimer = 0.5 + racer.random() * 0.7;
    // Prefer a lane away from the nearest rival, and aim for pickups.
    let target = racer.targetOffset;
    let nearest = 1e9;
    for (const other of world.racers) {
      if (other === racer) continue;
      const gap = Math.abs(other.s - racer.s);
      if (gap < nearest && gap < 90) {
        nearest = gap;
        target = other.offset + (other.offset > 0 ? -34 : 34);
      }
    }
    for (const item of world.pickups) {
      if (item.taken) continue;
      const diff = (item.s - racer.s + track.length) % track.length;
      if (diff < 140) target = item.offset;
    }
    racer.targetOffset = clamp(target, -RULES.trackHalfWidth + 10, RULES.trackHalfWidth - 10);
  }

  const steer = clamp((racer.targetOffset - racer.offset) / 26, -1, 1);
  racer.shining = racer.lamp > 18 || racer.random() > 0.9;
  if (racer.lamp < 12) racer.shining = false;

  // Use a flare when a rival is just ahead.
  if (racer.flares > 0 && racer.flareTime <= 0) {
    for (const other of world.racers) {
      if (other === racer) continue;
      const gap = (other.s - racer.s + track.length) % track.length;
      if (gap > 0 && gap < 70 && racer.random() > 0.985) {
        racer.flares -= 1;
        racer.flareTime = RULES.flareDuration;
        break;
      }
    }
  }

  return { steer, throttle: true, brake: false };
}
