// Nightcourier state machine: races, rivals, career meta and demo scenes.

import { COLOR, RULES, CIRCUITS, RIVALS, clamp } from './config.js';
import { drawText } from './geometry.js';
import { Track } from './track.js';
import { Racer } from './racer.js';
import { RIVALS as FIELD } from './config.js';
import { rivalControl } from './ai.js';
import { standings } from './standings.js';
import { buildResults } from './results.js';
import { spawnPickups } from './pickups.js';
import { Particles } from './particles.js';
import { Backdrop } from './backdrop.js';
import { Save } from './save.js';
import { SoundBoard } from './audio.js';
import { drawHUD } from './hud.js';
import { drawTitle, drawGarage, drawCircuitSelect, drawLeague, drawPause, drawResults } from './screens.js';

export class Game {
  constructor(ctx, input) {
    this.ctx = ctx;
    this.input = input;
    this.sound = new SoundBoard();
    this.save = new Save();
    this.backdrop = new Backdrop();
    this.particles = new Particles();
    this.time = 0;
    this.demo = null;
    this.muted = false;
    this.state = 'title';
    this.circuitIndex = 0;
    this.clock = 0;
    this.results = null;
    this.order = [];
    this.playerPlace = 1;
    this.startRace(0, true);
    this.state = 'title';
  }

  makeRace(index, attract = false) {
    this.circuitIndex = index;
    this.circuit = CIRCUITS[index];
    this.track = new Track(index);
    this.pickups = spawnPickups(this.track, index);
    this.racers = [
      new Racer('YOU', COLOR.gold, true, 1.03),
      ...FIELD.map((rival) => new Racer(rival.name, rival.color, false, rival.skill)),
    ];
    this.player = this.racers[0];
    this.player.reset(this.track, this.save.data.tuning);
    this.racers.slice(1).forEach((racer) => racer.reset(this.track));
    this.clock = 0;
    this.results = null;
    this.attract = attract;
    this.particles.clear();
    this.updateOrder();
  }

  startRace(index) {
    this.makeRace(index, false);
    this.state = 'playing';
    this.sound.start();
  }

  updateOrder() {
    this.order = standings(this.racers);
    const row = this.order.find((entry) => entry.racer.isPlayer);
    this.playerPlace = row ? row.place : this.racers.length;
  }

  handleKey(code) {
    if (code === 'KeyM') { this.muted = this.sound.toggleMute(); return; }
    if (this.state === 'title') {
      if (code === 'Enter') this.startRace(0);
      if (code === 'KeyA') this.state = 'garage';
      if (code === 'KeyC') this.state = 'circuits';
      if (code === 'KeyG') this.state = 'league';
      return;
    }
    if (this.state === 'garage') {
      const keys = { Digit1: 'wick', Digit2: 'hull', Digit3: 'sail' };
      if (keys[code]) this.save.buy(keys[code]);
      if (code === 'Enter') this.state = 'title';
      if (code === 'KeyL') this.state = 'league';
      return;
    }
    if (this.state === 'circuits') {
      const index = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }[code];
      if (index !== undefined && index <= this.save.data.unlocked) this.startRace(index);
      if (code === 'Enter') this.state = 'title';
      if (code === 'KeyA') this.state = 'garage';
      return;
    }
    if (this.state === 'league') { if (code === 'Enter') this.state = 'title'; return; }
    if (this.state === 'results') {
      if (code === 'Enter') this.startRace(Math.min(3, this.circuitIndex + 1));
      if (code === 'KeyA') this.state = 'garage';
      if (code === 'KeyC') this.state = 'circuits';
      if (code === 'KeyL') this.state = 'league';
      return;
    }
    if (this.state === 'paused') {
      if (code === 'KeyP' || code === 'Escape') this.state = 'playing';
      return;
    }
    if (this.state === 'playing') {
      if (code === 'KeyP' || code === 'Escape') this.state = 'paused';
      if (code === 'KeyR') this.startRace(this.circuitIndex);
      if (code === 'KeyF' && this.player.flares > 0 && this.player.flareTime <= 0) {
        this.player.flares -= 1;
        this.player.flareTime = RULES.flareDuration;
        this.sound.flare();
      }
      if (code === 'Space' && this.player.boostTime <= 0) {
        this.player.boostTime = 0.7;
        const p = this.track.position(this.player.s, this.player.offset);
        this.particles.burst(p.x, p.y, COLOR.boost, 16, 120);
      }
    }
  }

  update(dt) {
    this.time += dt;
    this.backdrop.update(dt);
    this.particles.update(dt);

    if (this.state === 'title') {
      this.updateRace(dt, true);
      if (this.results) this.makeRace(0, true);
      return;
    }
    if (this.state !== 'playing') return;

    this.updateRace(dt, false);
    if (this.player.finished || this.racers.every((r) => r.finished)) {
      const built = buildResults(this.racers, 0);
      this.results = built;
      this.save.recordRace(this.circuitIndex, this.player.bestLap || 0, built.you.points, built.rows.map((row) => row.points));
      this.state = 'results';
      if (built.you.place === 1) this.sound.win();
    }
  }

  updateRace(dt, attract) {
    this.clock += dt;
    const playerControl = attract
      ? { steer: Math.sin(this.clock * 0.6) * 0.5, throttle: true, brake: false, shine: true }
      : {
          steer: this.input.steer(),
          throttle: this.input.throttle(),
          brake: this.input.brake(),
          shine: this.input.held.has('ShiftLeft') || this.input.held.has('ShiftRight') || this.input.held.has('MouseFire'),
        };

    this.player.shining = attract ? this.player.lamp > 12 : playerControl.shine && this.player.lamp > 0;

    const world = { sound: this.sound, clock: this.clock, racers: this.racers, pickups: this.pickups };
    for (const racer of this.racers) {
      const control = racer.isPlayer ? playerControl : rivalControl(racer, this.track, world, dt);
      racer.update(dt, this.track, control, world);
    }
    this.updateOrder();

    // Respawn spent pickups so a long race stays supplied.
    if (this.pickups.every((item) => item.taken)) {
      const fresh = spawnPickups(this.track, this.circuitIndex);
      fresh.forEach((item, i) => { item.s = (item.s + this.clock * 13 + i * 5) % this.track.length; });
      this.pickups = fresh;
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.save();
    this.backdrop.draw(ctx, this.circuitIndex);
    this.track.draw(ctx, this.time);

    for (const item of this.pickups) {
      if (item.taken) continue;
      const p = this.track.position(item.s, item.offset);
      ctx.save();
      ctx.globalAlpha = 0.7 + Math.sin(this.time * 4 + item.phase) * 0.2;
      ctx.fillStyle = item.kind === 'dew' ? COLOR.dew : COLOR.boost;
      ctx.fillRect(Math.round(p.x) - 6, Math.round(p.y) - 6, 12, 12);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(Math.round(p.x) - 2, Math.round(p.y) - 2, 4, 4);
      ctx.restore();
    }

    const ordered = [...this.racers].sort((a, b) => a.offset - b.offset);
    for (const racer of ordered) racer.draw(ctx, this.track, this.time);
    this.particles.draw(ctx);

    if (this.state === 'title') {
      ctx.fillStyle = '#05040faa';
      ctx.fillRect(0, 0, RULES.width, RULES.height);
      drawTitle(ctx, this, this.time);
    } else if (this.state === 'garage') {
      drawGarage(ctx, this, this.time);
    } else if (this.state === 'circuits') {
      drawCircuitSelect(ctx, this, this.time);
    } else if (this.state === 'league') {
      drawLeague(ctx, this, this.time);
    } else if (this.state === 'playing') {
      drawHUD(ctx, this);
    } else if (this.state === 'paused') {
      drawHUD(ctx, this);
      drawPause(ctx);
    } else if (this.state === 'results') {
      drawResults(ctx, this, this.time);
    }
    ctx.restore();
  }

  setDemo(kind) {
    this.demo = kind;
    if (kind === 'title') { this.makeRace(0, true); this.state = 'title'; return; }
    if (kind === 'garage') {
      this.makeRace(0, true);
      this.save.data.points = 64;
      this.save.data.tuning = { wick: 2, hull: 1, sail: 1 };
      this.state = 'garage';
      return;
    }
    if (kind === 'circuits') {
      this.makeRace(0, true);
      this.save.data.unlocked = 2;
      this.save.data.bestLaps = [64.2, 71.8, 0, 0];
      this.state = 'circuits';
      return;
    }
    if (kind === 'results') {
      this.makeRace(0, false);
      this.results = {
        rows: FIELD.map((rival, i) => ({
          name: rival.name, color: rival.color, place: i + 2,
          bestLap: 66.4 + i * 1.3, points: [10, 8, 6, 5, 4, 3][i], you: false,
        })),
        you: { name: 'YOU', place: 1, points: 10, bestLap: 64.2 },
      };
      this.results.rows.unshift({ name: 'YOU', color: COLOR.gold, place: 1, bestLap: 64.2, points: 10, you: true });
      this.state = 'results';
      return;
    }

    // Cover: a mid-race moment in Emberlock, lamp lit, field close.
    this.makeRace(2, false);
    this.state = 'playing';
    this.player.s = this.track.length * 0.45;
    this.player.offset = -14;
    this.player.speed = 380;
    this.player.lamp = 68;
    this.player.shining = true;
    this.player.bestLap = 66.4;
    this.player.lastLap = 67.1;
    this.player.flares = 3;
    this.racers.slice(1).forEach((racer, i) => {
      const gaps = [70, 38, -46, -96, -160, -240];
      racer.s = (this.player.s + gaps[i] + this.track.length) % this.track.length;
      racer.offset = (i % 2 ? 1 : -1) * (18 + i * 5);
      racer.speed = 350;
      racer.bestLap = 67.8 + i * 0.9;
      racer.shining = true;
    });
    this.clock = 142.6;
    this.player.lap = 2;
    this.racers.slice(1).forEach((racer, i) => { racer.lap = i < 3 ? 2 : 1; });
    this.updateOrder();
    const p = this.track.position(this.player.s, this.player.offset);
    this.particles.burst(p.x, p.y, COLOR.gold, 24, 130);
  }
}
