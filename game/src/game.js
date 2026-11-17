// Game state machine: the loop, spawning, collisions, scoring and demo scenes for screenshots.

import { COLOR, RULES, createRandom, clamp } from './config.js';
import { Player } from './player.js';
import { Shard, Mote, spawnPoint, spawnEdge } from './entities.js';
import { Particles } from './particles.js';
import { drawHUD } from './hud.js';
import { drawTitle, drawPause, drawResults } from './screens.js';

function readBest() {
  try {
    return Number(window.localStorage.getItem('ember-drift-best')) || 0;
  } catch {
    return 0;
  }
}

function writeBest(value) {
  try {
    window.localStorage.setItem('ember-drift-best', String(value));
  } catch {
    /* storage is optional */
  }
}

export class Game {
  constructor(ctx, input, sound) {
    this.ctx = ctx;
    this.input = input;
    this.sound = sound;
    this.best = readBest();
    this.time = 0;
    this.demo = null;
    this.reset();
    this.state = 'title';
  }

  reset() {
    this.random = createRandom(Date.now() ^ 0x9e3779b9);
    this.player = new Player(RULES.width / 2, RULES.height / 2);
    this.particles = new Particles();
    this.shards = [];
    this.motes = [];
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.shields = RULES.startShields;
    this.elapsed = 0;
    this.level = 1;
    this.outcome = 'lost';
    this.endReason = '';
    this.shardTimer = 1.1;
    this.moteTimer = 0.4;
    this.shake = 0;
  }

  start() {
    this.reset();
    this.state = 'playing';
    this.sound.start();
  }

  get level() {
    return this._level;
  }

  set level(value) {
    this._level = Math.max(1, value);
  }

  // Sets a fixed, reproducible scene so screenshots are real renders of the game code.
  setDemo(kind) {
    this.demo = kind;
    if (kind === 'title') {
      this.state = 'title';
      return;
    }
    if (kind === 'over') {
      this.state = 'over';
      this.outcome = 'lost';
      this.score = 1240;
      this.best = 1680;
      this.elapsed = 38.4;
      this.level = 4;
      this.endReason = 'The shards overwhelmed your ember.';
      return;
    }

    this.state = 'playing';
    this.random = createRandom(kind === 'combo' ? 7717 : 4412);
    this.player.x = kind === 'combo' ? 560 : 430;
    this.player.y = kind === 'combo' ? 250 : 310;
    this.player.facing = { x: 0.9, y: -0.3 };
    this.elapsed = kind === 'combo' ? 38.4 : 18.2;
    this.level = kind === 'combo' ? 4 : 2;
    this.score = kind === 'combo' ? 1240 : 480;
    this.combo = kind === 'combo' ? 9 : 3;
    this.comboTimer = RULES.comboWindow * 0.7;
    this.shields = kind === 'combo' ? 2 : 3;

    const shardPositions = kind === 'combo'
      ? [[700, 150], [770, 360], [470, 470], [250, 170], [860, 250], [600, 520]]
      : [[700, 220], [250, 440], [620, 120], [820, 400], [200, 160]];
    for (const [x, y] of shardPositions) {
      const shard = new Shard(x, y, 90 + this.level * 14, 12 + (this.level % 3) * 2);
      shard.angle = this.random() * Math.PI;
      this.shards.push(shard);
    }

    const motePositions = kind === 'combo'
      ? [[390, 180], [660, 330], [500, 420], [280, 300]]
      : [[560, 230], [330, 300], [640, 440]];
    motePositions.forEach(([x, y], index) => {
      this.motes.push(new Mote(x, y, index === 1 && kind === 'combo' ? 'repair' : 'spark'));
    });

    for (let i = 0; i < 40; i += 1) {
      this.particles.spawn(this.player.x + (this.random() - 0.5) * 140, this.player.y + (this.random() - 0.5) * 120, {
        count: 1,
        color: this.random() > 0.7 ? COLOR.mote : COLOR.emberTrail,
        speed: 40 + this.random() * 60,
        life: 0.4 + this.random() * 0.4,
        size: 2 + this.random() * 2,
      });
    }
  }

  handleKey(code) {
    if (code === 'KeyM') {
      this.muted = this.sound.toggleMute();
      return;
    }
    if (this.state === 'title' && code === 'Enter') {
      this.start();
      return;
    }
    if (this.state === 'over' && code === 'Enter') {
      this.start();
      return;
    }
    if ((this.state === 'playing' || this.state === 'paused') && (code === 'KeyP' || code === 'Escape')) {
      this.state = this.state === 'playing' ? 'paused' : 'playing';
      return;
    }
    if (this.state === 'playing' && code === 'Space' && this.input.consumePress('Space')) {
      if (this.player.tryDash(this.input)) {
        this.sound.dash();
        this.particles.spawn(this.player.x, this.player.y, {
          count: 18, color: COLOR.mote, speed: 180, life: 0.4, size: 3,
        });
      }
    }
  }

  update(dt) {
    this.time += dt;
    if (this.state !== 'playing') return;

    this.elapsed += dt;
    this.level = 1 + Math.floor(this.elapsed / RULES.levelSeconds);
    this.shake = Math.max(0, this.shake - dt * 3);

    if (this.combo > 1) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 1;
        this.comboTimer = 0;
      }
    }

    this.player.update(dt, this.input, this.particles);
    this.particles.update(dt);

    this.shardTimer -= dt;
    if (this.shardTimer <= 0) {
      this.shardTimer = Math.max(0.34, 1.5 - this.level * 0.16) * (0.7 + this.random() * 0.6);
      const point = spawnEdge(this.random);
      const shard = new Shard(point.x, point.y, 58 + this.level * 13, 11 + Math.floor(this.random() * 5));
      this.shards.push(shard);
      // Keep the arena readable: a long run never drowns the player in shards.
      if (this.shards.length > 26) this.shards.shift();
    }

    this.moteTimer -= dt;
    if (this.moteTimer <= 0) {
      this.moteTimer = 0.9 + this.random() * 0.7;
      const point = spawnPoint(this.random, this.player);
      const kind = this.shields < RULES.maxShields && this.random() > 0.55 ? 'repair' : 'spark';
      this.motes.push(new Mote(point.x, point.y, kind));
    }

    for (const shard of this.shards) shard.update(dt, this.player);
    this.resolveCollisions();

    if (this.shields <= 0) {
      this.finish(false, 'The shards overwhelmed your ember.');
    } else if (this.score >= RULES.goalScore) {
      this.finish(true, 'You reached the light goal.');
    } else if (this.elapsed >= RULES.roundSeconds) {
      this.finish(true, 'You survived the full drift.');
    }
  }

  resolveCollisions() {
    for (let i = this.shards.length - 1; i >= 0; i -= 1) {
      const shard = this.shards[i];
      const distance = Math.hypot(shard.x - this.player.x, shard.y - this.player.y);
      if (distance > shard.radius + this.player.radius) continue;

      if (this.player.dashing) {
        this.shards.splice(i, 1);
        this.score += RULES.shardValue * this.combo;
        this.particles.spawn(shard.x, shard.y, {
          count: 22, color: COLOR.shard, speed: 190, life: 0.5, size: 3,
        });
        this.sound.breakShard();
      } else if (this.player.takeHit()) {
        this.shields -= 1;
        this.combo = 1;
        this.comboTimer = 0;
        this.shake = 1;
        this.sound.hit();
        this.particles.spawn(this.player.x, this.player.y, {
          count: 28, color: COLOR.danger, speed: 210, life: 0.6, size: 3.5,
        });
      }
    }

    for (let i = this.motes.length - 1; i >= 0; i -= 1) {
      const mote = this.motes[i];
      const distance = Math.hypot(mote.x - this.player.x, mote.y - this.player.y);
      if (distance > mote.radius + this.player.radius) continue;

      this.motes.splice(i, 1);
      if (mote.kind === 'repair') {
        this.shields = clamp(this.shields + 1, 0, RULES.maxShields);
        this.score += RULES.repairValue;
        this.sound.repair();
        this.particles.spawn(mote.x, mote.y, {
          count: 16, color: COLOR.repair, speed: 140, life: 0.5, size: 3,
        });
      } else {
        this.combo = Math.min(99, this.combo + 1);
        this.comboTimer = RULES.comboWindow;
        this.score += RULES.moteValue * this.combo;
        this.sound.collect(this.combo);
        this.particles.spawn(mote.x, mote.y, {
          count: 14, color: COLOR.mote, speed: 150, life: 0.45, size: 2.8,
        });
      }
    }
  }

  finish(won, reason) {
    this.state = 'over';
    this.outcome = won ? 'won' : 'lost';
    this.endReason = reason;
    if (this.score > this.best) {
      this.best = this.score;
      writeBest(this.best);
    }
    this.sound.finish(won);
  }

  drawBackground() {
    const ctx = this.ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, RULES.height);
    gradient.addColorStop(0, COLOR.voidTop);
    gradient.addColorStop(1, COLOR.voidBottom);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, RULES.width, RULES.height);

    const offset = (this.time * 26) % 48;
    ctx.strokeStyle = COLOR.grid;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.55;
    for (let x = -48 + offset; x < RULES.width + 48; x += 48) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, RULES.height);
      ctx.stroke();
    }
    for (let y = -48 + offset; y < RULES.height + 48; y += 48) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(RULES.width, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const halo = ctx.createRadialGradient(
      RULES.width / 2, RULES.height / 2, 40,
      RULES.width / 2, RULES.height / 2, 420,
    );
    halo.addColorStop(0, '#26347a22');
    halo.addColorStop(1, '#05060f00');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, RULES.width, RULES.height);
  }

  draw() {
    const ctx = this.ctx;
    ctx.save();
    if (this.shake > 0) {
      const amount = this.shake * 7;
      ctx.translate((this.random() - 0.5) * amount, (this.random() - 0.5) * amount);
    }
    this.drawBackground();

    for (const mote of this.motes) mote.draw(ctx, this.time);
    for (const shard of this.shards) shard.draw(ctx);
    this.particles.draw(ctx);
    if (this.state === 'playing' || this.state === 'paused') this.player.draw(ctx, this.time);

    if (this.state === 'playing' || this.state === 'paused') drawHUD(ctx, this);
    if (this.state === 'title') drawTitle(ctx, this, this.time);
    if (this.state === 'paused') drawPause(ctx, this.time);
    if (this.state === 'over') drawResults(ctx, this, this.time);
    ctx.restore();
  }
}
