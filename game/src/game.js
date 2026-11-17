// Game state machine: campaign, waves, collisions, scoring and demo scenes.

import { COLOR, RULES, clamp } from './config.js';
import { createRandom } from './random.js';
import { circleHit, drawText } from './geometry.js';
import { Player } from './player.js';
import { Pearl, Pulse, Spine, makeEnemy } from './entities.js';
import { Particles } from './particles.js';
import { Backdrop } from './backdrop.js';
import { Save } from './save.js';
import { REEFS } from './waves.js';
import { drawHUD } from './hud.js';
import { drawTitle, drawAtlas, drawPause, drawResults } from './screens.js';
import { createAttractWorld, updateAttract, drawAttract } from './autopilot.js';

export class Game {
  constructor(ctx, input, sound) {
    this.ctx = ctx;
    this.input = input;
    this.sound = sound;
    this.save = new Save();
    this.backdrop = new Backdrop();
    this.attract = createAttractWorld();
    this.random = createRandom(4242);
    this.time = 0;
    this.demo = null;
    this.muted = false;
    this.state = 'title';
    this.prepareRun();
  }

  prepareRun() {
    this.player = new Player(RULES.width / 2, RULES.height / 2);
    this.particles = new Particles();
    this.enemies = [];
    this.pearls = 0;
    this.pearlItems = [];
    this.pulses = [];
    this.spines = [];
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.totalKills = 0;
    this.reefIndex = 0;
    this.waveIndex = 0;
    this.pearls = [];
    this.pearlSpawnTimer = 1;
    this.elapsed = 0;
    this.hull = RULES.startHull;
    this.shake = 0;
    this.outcome = '';
    this.endReason = '';
  }

  get reef() {
    return REEFS[this.reefIndex];
  }

  startRun() {
    this.prepareRun();
    this.startReef(0);
  }

  startReef(index) {
    this.reefIndex = clamp(index, 0, 3);
    this.waveIndex = 0;
    this.pearls = 0;
    this.pearlItems = [];
    this.enemies = [];
    this.pulses = [];
    this.spines = [];
    this.particles.clear();
    this.player.x = RULES.width / 2;
    this.player.y = RULES.height / 2;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.invulnerable = 1;
    this.elapsed = 0;
    this.hull = RULES.startHull;
    this.spawnWave();
    this.state = 'playing';
    this.sound.wave();
  }

  spawnWave() {
    const kinds = this.reef.waves[this.waveIndex];
    kinds.forEach((kind, index) => {
      const edge = index % 4;
      const x = edge === 0 ? 60 : edge === 1 ? RULES.width - 60 : 100 + index * 170;
      const y = edge === 2 ? 70 : edge === 3 ? RULES.height - 70 : 110 + (index % 3) * 160;
      this.enemies.push(makeEnemy(kind, x, y, this.reefIndex + 1));
    });
  }

  handleKey(code) {
    if (code === 'KeyM') {
      this.muted = this.sound.toggleMute();
      return;
    }
    if (this.state === 'title') {
      if (code === 'Enter') this.startRun();
      if (code === 'KeyA') this.state = 'atlas';
      return;
    }
    if (this.state === 'atlas') {
      if (code === 'Enter') this.state = 'title';
      const digit = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }[code];
      if (digit !== undefined && digit <= this.save.data.unlocked) {
        this.prepareRun();
        this.startReef(digit);
      }
      return;
    }
    if (this.state === 'results') {
      if (code === 'KeyA') { this.state = 'atlas'; return; }
      if (code === 'Enter') {
        if (this.outcome === 'victory') this.startRun();
        else if (this.outcome === 'cleared') this.startReef(this.reefIndex + 1);
        else this.startReef(this.reefIndex);
      }
      return;
    }
    if (this.state === 'paused') {
      if (code === 'KeyP' || code === 'Escape') this.state = 'playing';
      return;
    }
    if (this.state !== 'playing') return;

    if (code === 'KeyP' || code === 'Escape') {
      this.state = 'paused';
      return;
    }
    if (code === 'Space') {
      if (this.player.tryDash(this.input)) {
        this.sound.dash();
        this.particles.burst(this.player.x, this.player.y, COLOR.eel, 16, 170);
      }
      return;
    }
    if (code === 'KeyJ' || code === 'MouseFire') {
      const angle = this.player.tryPulse(this.input.mouse);
      if (angle !== null) {
        this.pulses.push(new Pulse(this.player.x, this.player.y, angle, COLOR.eel));
        this.sound.pulse();
      }
    }
  }

  update(dt) {
    this.time += dt;
    this.backdrop.update(dt);
    if (this.state === 'title') {
      updateAttract(this.attract, dt);
      return;
    }
    if (this.state !== 'playing') return;

    this.elapsed += dt;
    this.shake = Math.max(0, this.shake - dt * 3);
    if (this.combo > 1) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) { this.combo = 1; this.comboTimer = 0; }
    }

    this.player.update(dt, this.input, this.particles);
    this.particles.update(dt);

    this.pearlSpawnTimer -= dt;
    if (this.pearlSpawnTimer <= 0 && this.pearls < this.reef.pearlGoal) {
      this.pearlSpawnTimer = 0.9;
      const x = 60 + Math.random() * (RULES.width - 120);
      const y = 60 + Math.random() * (RULES.height - 120);
      this.pearlItems.push(new Pearl(x, y));
    }

    for (const enemy of this.enemies) enemy.update(dt, this.player, this);
    for (const pulse of this.pulses) pulse.update(dt);
    for (const spine of this.spines) spine.update(dt);
    this.resolveCollisions();

    this.pulses = this.pulses.filter((p) => p.life > 0 && p.x > -30 && p.x < RULES.width + 30 && p.y > -30 && p.y < RULES.height + 30);
    this.spines = this.spines.filter((p) => p.life > 0);

    if (this.hull <= 0) {
      this.finish('defeat', 'Your hull gave out in the ' + this.reef.name + '.');
      return;
    }
    if (this.enemies.length === 0 && this.pearls >= this.reef.pearlGoal) {
      this.save.recordReef(this.reefIndex, this.pearls, this.elapsed);
      this.save.recordScore(this.score);
      if (this.reefIndex === 3) {
        this.finish('victory', 'All four reefs are lit. The deep remembers you.');
      } else {
        this.finish('cleared', this.reef.name + ' is clear. The next reef opens.');
      }
      this.sound.victory();
    }
  }

  resolveCollisions() {
    for (let i = this.pulses.length - 1; i >= 0; i -= 1) {
      const pulse = this.pulses[i];
      for (let j = this.enemies.length - 1; j >= 0; j -= 1) {
        const enemy = this.enemies[j];
        if (!circleHit(pulse, enemy)) continue;
        this.pulses.splice(i, 1);
        if (enemy.damage()) {
          this.enemies.splice(j, 1);
          this.score += RULES.killValue * this.combo;
          this.totalKills += 1;
          this.particles.burst(enemy.x, enemy.y, '#ffd9a0', 18, 150);
          this.sound.kill();
        }
        break;
      }
    }

    for (let i = this.enemies.length - 1; i >= 0; i -= 1) {
      const enemy = this.enemies[i];
      if (!circleHit(enemy, this.player)) continue;
      if (this.player.dashing) {
        this.enemies.splice(i, 1);
        this.score += RULES.killValue * this.combo;
        this.totalKills += 1;
        this.particles.burst(enemy.x, enemy.y, '#ffd9a0', 22, 180);
        this.sound.kill();
      } else if (this.player.takeHit()) {
        this.hull -= 1;
        this.combo = 1;
        this.comboTimer = 0;
        this.shake = 1;
        this.sound.hit();
        this.particles.burst(this.player.x, this.player.y, COLOR.danger, 26, 190);
      }
    }

    for (let i = this.spines.length - 1; i >= 0; i -= 1) {
      const spine = this.spines[i];
      if (!circleHit(spine, this.player)) continue;
      this.spines.splice(i, 1);
      if (this.player.takeHit()) {
        this.hull -= 1;
        this.combo = 1;
        this.comboTimer = 0;
        this.shake = 1;
        this.sound.hit();
        this.particles.burst(this.player.x, this.player.y, COLOR.danger, 20, 170);
      }
    }

    for (let i = this.pearlItems.length - 1; i >= 0; i -= 1) {
      const item = this.pearlItems[i];
      if (!circleHit(item, this.player)) continue;
      this.pearlItems.splice(i, 1);
      this.pearls += 1;
      this.combo = Math.min(99, this.combo + 1);
      this.comboTimer = RULES.comboWindow;
      this.score += RULES.pearlValue * this.combo;
      this.particles.burst(item.x, item.y, COLOR.pearl, 14, 130);
      this.sound.pearl(this.combo);
    }
  }

  finish(outcome, reason) {
    this.state = 'results';
    this.outcome = outcome;
    this.endReason = reason;
    this.save.recordScore(this.score);
  }

  // Fixed scenes for the maker's screenshots: real renders of this game's code.
  setDemo(kind) {
    this.demo = kind;
    if (kind === 'title') { this.state = 'title'; return; }
    if (kind === 'atlas') {
      this.state = 'atlas';
      this.save.data.unlocked = 2;
      this.save.data.pearls = [8, 6, 3, 0];
      this.save.data.bestTimes = [41.2, 58.7, 0, 0];
      return;
    }
    if (kind === 'victory') {
      this.state = 'results';
      this.outcome = 'victory';
      this.score = 8640;
      this.save.data.best = 8640;
      this.endReason = 'All four reefs are lit. The deep remembers you.';
      this.reefIndex = 3;
      this.waveIndex = 1;
      this.pearls = 14;
      this.totalKills = 47;
      this.elapsed = 214.6;
      return;
    }

    // Default: a busy mid-campaign dive in the Ember Vent.
    this.state = 'playing';
    this.save.data.unlocked = 3;
    this.reefIndex = 2;
    this.waveIndex = 1;
    this.hull = 3;
    this.score = 4360;
    this.combo = 6;
    this.comboTimer = RULES.comboWindow * 0.8;
    this.pearls = 9;
    this.totalKills = 23;
    this.elapsed = 86.4;
    this.player.x = 470;
    this.player.y = 320;
    this.player.facing = { x: 0.8, y: -0.4 };
    this.player.trail = [
      { x: 446, y: 332 }, { x: 458, y: 328 }, { x: 470, y: 320 },
    ];
    const spots = [
      ['drifter', 250, 200], ['spitter', 730, 170], ['brute', 720, 430],
      ['drifter', 330, 470], ['spitter', 180, 360],
    ];
    this.enemies = spots.map(([kind, x, y]) => makeEnemy(kind, x, y, 3));
    this.pearlItems = [
      new Pearl(560, 170), new Pearl(390, 260), new Pearl(600, 450), new Pearl(280, 520),
    ];
    this.pulses = [new Pulse(520, 300, -0.6, COLOR.eel), new Pulse(560, 275, -0.6, COLOR.eel)];
    for (let i = 0; i < 5; i += 1) {
      this.particles.burst(500 + i * 18, 300 + (i % 3) * 14, COLOR.pearl, 4, 90, 0.6);
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.save();
    if (this.shake > 0 && this.state === 'playing') {
      const amount = this.shake * 5;
      ctx.translate((Math.random() - 0.5) * amount, (Math.random() - 0.5) * amount);
    }
    this.backdrop.draw(ctx, this.state === 'playing' || this.state === 'results' ? this.reefIndex : 0);

    if (this.state === 'title') {
      drawAttract(ctx, this.attract);
      ctx.fillStyle = '#03101c99';
      ctx.fillRect(0, 0, RULES.width, RULES.height);
      drawTitle(ctx, this, this.time);
    } else if (this.state === 'atlas') {
      drawAtlas(ctx, this, this.time);
    } else {
      for (const item of this.pearlItems) item.draw(ctx, this.time);
      for (const enemy of this.enemies) enemy.draw(ctx);
      for (const spine of this.spines) spine.draw(ctx);
      for (const pulse of this.pulses) pulse.draw(ctx);
      this.particles.draw(ctx);
      if (this.state === 'playing' || this.state === 'paused') this.player.draw(ctx, this.time);
      if (this.state === 'playing' || this.state === 'paused') drawHUD(ctx, this);
      if (this.state === 'paused') drawPause(ctx);
      if (this.state === 'results') drawResults(ctx, this, this.time);
    }
    ctx.restore();
  }
}
