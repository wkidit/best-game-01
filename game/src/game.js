// Moonthorn's state machine: tile collision, light puzzle, four gardens and menus.

import { COLOR, RULES, GARDENS, clamp } from './config.js';
import { rectsOverlap, drawText } from './geometry.js';
import { LEVELS } from './levels.js';
import { Player } from './player.js';
import { Shade, Wisp, DewDrop } from './entities.js';
import { Particles } from './particles.js';
import { Backdrop } from './backdrop.js';
import { Save } from './save.js';
import { SoundBoard } from './audio.js';
import { drawTileAt, TILE } from './tiles.js';
import { drawHUD } from './hud.js';
import { drawTitle, drawAtlas, drawPause, drawResults } from './screens.js';
import { drawPixelText } from './font.js';
import { createAttract, updateAttract } from './attract.js';

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
    this.attract = createAttract();
    this.levelIndex = 0;
    this.loadLevel(0);
    this.state = 'title';
  }

  loadLevel(index) {
    this.levelIndex = clamp(index, 0, 3);
    this.level = LEVELS[this.levelIndex];
    this.grid = [];
    for (let y = 0; y < RULES.rows; y += 1) {
      this.grid.push(new Array(RULES.cols).fill(TILE.EMPTY));
    }
    const put = (x, y, kind) => {
      if (x >= 0 && x < RULES.cols && y >= 0 && y < RULES.rows) this.grid[y][x] = kind;
    };
    for (const [x, y, w, h] of this.level.grounds) {
      for (let gy = y; gy < y + h; gy += 1) {
        for (let gx = x; gx < x + w; gx += 1) put(gx, gy, TILE.SOLID);
      }
    }
    for (const [x, y, w] of this.level.platforms) {
      for (let px = x; px < x + w; px += 1) put(px, y, TILE.PLATFORM);
    }
    for (const [x, y] of this.level.thorns) put(x, y, TILE.THORN);
    for (const [x, y] of this.level.blooms) put(x, y, TILE.BLOOM);

    this.player = new Player(this.level.spawn[0] * RULES.tile, this.level.spawn[1] * RULES.tile);
    this.dews = this.level.dews.map(([x, y]) => new DewDrop(x * RULES.tile + 10, y * RULES.tile + 8));
    this.enemies = [
      ...this.level.shades.map(([x, y]) => new Shade(x * RULES.tile, y * RULES.tile)),
      ...this.level.wisps.map(([x, y]) => new Wisp(x * RULES.tile, y * RULES.tile)),
    ];
    this.exit = { x: this.level.exit[0] * RULES.tile, y: this.level.exit[1] * RULES.tile, w: RULES.tile, h: RULES.tile };
    this.thornsLeft = this.level.thorns.length;
    this.thornExposure = new Map();
    this.dew = 0;
    this.score = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.withered = 0;
    this.falls = 0;
    this.elapsed = 0;
    this.darkTimer = 0;
    this.event = null;
    this.shake = 0;
    this.outcome = '';
    this.endReason = '';
    this.particles.clear();
  }

  startRun() {
    this.loadLevel(0);
    this.state = 'playing';
    this.sound.pulse();
  }

  tileAt(cx, cy) {
    if (cy < 0 || cy >= RULES.rows) return TILE.EMPTY;
    if (cx < 0 || cx >= RULES.cols) return TILE.SOLID;
    return this.grid[cy][cx];
  }

  isLit(x, y) {
    if (!this.player || !this.player.shining || this.player.light <= 0) return false;
    const dx = x - (this.player.x + this.player.w / 2);
    const dy = y - (this.player.y + this.player.h / 2);
    return Math.hypot(dx, dy) < RULES.lightRadius;
  }

  isSolid(cx, cy, tile) {
    if (tile === TILE.SOLID || tile === TILE.PLATFORM) return true;
    if (tile === TILE.BLOOM) return this.isLit(cx * RULES.tile + 16, cy * RULES.tile + 16);
    return false;
  }

  handleKey(code) {
    if (code === 'KeyM') { this.muted = this.sound.toggleMute(); return; }
    if (this.state === 'title') {
      if (code === 'Enter') this.startRun();
      if (code === 'KeyA') this.state = 'atlas';
      return;
    }
    if (this.state === 'atlas') {
      if (code === 'Enter') this.state = 'title';
      const index = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }[code];
      if (index !== undefined && index <= this.save.data.unlocked) {
        this.loadLevel(index);
        this.state = 'playing';
      }
      return;
    }
    if (this.state === 'results') {
      if (code === 'KeyA') { this.state = 'atlas'; return; }
      if (code === 'Enter') {
        if (this.outcome === 'victory') this.startRun();
        else if (this.outcome === 'cleared') { this.loadLevel(this.levelIndex + 1); this.state = 'playing'; }
        else { this.loadLevel(this.levelIndex); this.state = 'playing'; }
      }
      return;
    }
    if (this.state === 'paused') {
      if (code === 'KeyP' || code === 'Escape') this.state = 'playing';
      return;
    }
    if (this.state === 'playing') {
      if (code === 'KeyP' || code === 'Escape') this.state = 'paused';
      if (code === 'KeyR') { this.loadLevel(this.levelIndex); this.state = 'playing'; }
    }
  }

  update(dt) {
    this.time += dt;
    this.backdrop.update(dt);
    if (this.event) {
      this.event.life -= dt;
      if (this.event.life <= 0) this.event = null;
    }
    if (this.state === 'title') {
      updateAttract(this.attract, dt, (x, y) => this.tileAt(x, y), (x, y, t) => this.isSolid(x, y, t));
      return;
    }
    if (this.state !== 'playing') return;

    this.elapsed += dt;
    this.shake = Math.max(0, this.shake - dt * 3);
    if (this.combo > 1) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) { this.combo = 1; this.comboTimer = 0; }
    }

    this.player.update(dt, this.input, this);
    this.particles.update(dt);

    // Light logic: thorns wither under sustained shine, blooms are solid while lit.
    for (let cy = 0; cy < RULES.rows; cy += 1) {
      for (let cx = 0; cx < RULES.cols; cx += 1) {
        if (this.grid[cy][cx] !== TILE.THORN) continue;
        const px = cx * RULES.tile + 16;
        const py = cy * RULES.tile + 16;
        const key = cx + ':' + cy;
        if (this.isLit(px, py)) {
          const held = (this.thornExposure.get(key) || 0) + dt;
          this.thornExposure.set(key, held);
          if (held > 0.5) {
            this.grid[cy][cx] = TILE.EMPTY;
            this.thornsLeft -= 1;
            this.withered += 1;
            this.score += 35 * this.combo;
            this.particles.burst(px, py, COLOR.glow, 14, 120);
            this.event = { text: 'WITHERED  +' + 35 * this.combo, life: 1.2 };
            this.sound.wither();
          }
        } else {
          this.thornExposure.set(key, Math.max(0, (this.thornExposure.get(key) || 0) - dt));
        }
      }
    }

    for (const enemy of this.enemies) enemy.update(dt, this);
    this.enemies = this.enemies.filter((enemy) => !enemy.dead);

    // Dew pickups.
    for (const dew of this.dews) {
      if (dew.taken) continue;
      if (Math.abs(dew.x - this.player.x) < 26 && Math.abs(dew.y - this.player.y) < 32) {
        dew.taken = true;
        this.dew += 1;
        this.combo = Math.min(12, this.combo + 1);
        this.comboTimer = 3;
        this.score += 50 * this.combo;
        this.player.light = Math.min(RULES.lightMax, this.player.light + RULES.lightRefill);
        this.particles.burst(dew.x, dew.y, COLOR.dew, 10, 110);
        this.event = { text: 'DEW  x' + this.combo + '  +' + 50 * this.combo, life: 1 };
        this.sound.dew();
      }
    }

    // Contact damage.
    const playerRect = { x: this.player.x, y: this.player.y, w: this.player.w, h: this.player.h };
    let hurt = false;
    for (const enemy of this.enemies) {
      if (rectsOverlap(playerRect, { x: enemy.x, y: enemy.y, w: enemy.w, h: enemy.h })) hurt = true;
    }
    for (let cy = 0; cy < RULES.rows; cy += 1) {
      for (let cx = 0; cx < RULES.cols; cx += 1) {
        if (this.grid[cy][cx] !== TILE.THORN) continue;
        if (rectsOverlap(playerRect, { x: cx * RULES.tile + 6, y: cy * RULES.tile + 8, w: 20, h: 24 })) hurt = true;
      }
    }
    if (this.player.y > RULES.height + 40) {
      this.falls += 1;
      this.hurtPlayer();
      this.player.x = this.level.spawn[0] * RULES.tile;
      this.player.y = this.level.spawn[1] * RULES.tile;
      this.player.vx = 0;
      this.player.vy = 0;
      this.player.light = Math.max(this.player.light, 35);
    } else if (hurt) {
      this.hurtPlayer();
    }

    // Running out of light in the dark costs a heart.
    if (this.player.light <= 0) {
      this.darkTimer += dt;
      if (this.darkTimer > 4) {
        this.darkTimer = 0;
        this.hurtPlayer();
        this.player.light = 25;
      }
    } else {
      this.darkTimer = Math.max(0, this.darkTimer - dt * 2);
    }

    if (this.player.hearts <= 0) {
      this.finish('defeat', 'Your lantern went dark in ' + this.level.name + '.');
      return;
    }

    if (this.dew >= this.level.dewGoal && rectsOverlap(playerRect, this.exit)) {
      this.save.record(this.levelIndex, this.dew, this.elapsed, this.score);
      this.sound.clear();
      if (this.levelIndex === 3) this.finish('victory', 'Every garden glows again. The moon is whole.');
      else this.finish('cleared', this.level.name + ' is lit. The next garden opens.');
    }
  }

  hurtPlayer() {
    if (this.player.invulnerable > 0) return;
    this.player.hearts -= 1;
    this.player.invulnerable = 1.5;
    this.combo = 1;
    this.comboTimer = 0;
    this.shake = 1;
    this.particles.burst(this.player.x, this.player.y, COLOR.heart, 20, 150);
    this.event = { text: 'HURT  -1 HEART', life: 1.2 };
    this.sound.hurt();
  }

  finish(outcome, reason) {
    this.state = 'results';
    this.outcome = outcome;
    this.endReason = reason;
    if (outcome === 'victory') this.sound.victory();
  }

  setDemo(kind) {
    this.demo = kind;
    if (kind === 'title') { this.state = 'title'; return; }
    if (kind === 'atlas') {
      this.state = 'atlas';
      this.save.data.unlocked = 2;
      this.save.data.dew = [8, 6, 3, 0];
      this.save.data.times = [41.2, 58.7, 0, 0];
      this.save.data.best = 16880;
      return;
    }
    if (kind === 'victory') {
      this.state = 'results';
      this.outcome = 'victory';
      this.endReason = 'Every garden glows again. The moon is whole.';
      this.loadLevel(3);
      this.score = 16880;
      this.save.data.best = 16880;
      this.dew = 14;
      this.withered = 42;
      this.falls = 3;
      this.elapsed = 246.8;
      return;
    }

    // Cover: a mid-run dive in Moon Orchard with the lantern lit.
    this.loadLevel(2);
    this.state = 'playing';
    this.player.x = 13 * RULES.tile;
    this.player.y = 11 * RULES.tile + 8;
    this.player.shining = true;
    this.player.light = 72;
    this.player.facing = 1;
    this.dew = 9;
    this.score = 7280;
    this.combo = 7;
    this.comboTimer = 2.1;
    this.withered = 18;
    this.falls = 2;
    this.elapsed = 74.3;
    this.event = { text: 'WITHERED  x7  +245', life: 2 };
    this.enemies.push(new Shade(7 * RULES.tile, 13 * RULES.tile));
    this.enemies.push(new Wisp(20 * RULES.tile, 8 * RULES.tile));
    this.enemies.push(new Wisp(24 * RULES.tile, 11 * RULES.tile));
    for (const [x, y] of [[10, 16], [18, 16]]) {
      this.grid[y][x] = TILE.EMPTY;
      this.thornsLeft -= 1;
    }
    const firstDews = this.dews.slice(4, 8);
    firstDews.forEach((dew) => { dew.taken = true; });
    this.particles.burst(this.player.x + 40, this.player.y, COLOR.glow, 26, 140);
    this.particles.burst(this.player.x - 20, this.player.y + 20, COLOR.dew, 14, 100);
  }

  drawTiles() {
    const ctx = this.ctx;
    const garden = GARDENS[this.levelIndex];
    for (let cy = 0; cy < RULES.rows; cy += 1) {
      for (let cx = 0; cx < RULES.cols; cx += 1) {
        const tile = this.grid[cy][cx];
        if (tile === TILE.EMPTY) continue;
        const x = cx * RULES.tile;
        const y = cy * RULES.tile;
        if (tile === TILE.SOLID) drawTileAt(ctx, tile, x, y, garden.accent, this.time);
        else if (tile === TILE.PLATFORM) drawTileAt(ctx, tile, x, y, garden.accent, this.time);
        else if (tile === TILE.THORN) drawTileAt(ctx, tile, x, y, garden.accent, this.time, (this.thornExposure.get(cx + ':' + cy) || 0) > 0.15);
        else if (tile === TILE.BLOOM) drawTileAt(ctx, tile, x, y, garden.accent, this.time, this.isLit(x + 16, y + 16));
        else if (tile === TILE.EXIT) drawTileAt(ctx, tile, x, y, garden.accent, this.time);
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.save();
    if (this.shake > 0 && this.state === 'playing') {
      const amount = this.shake * 4;
      ctx.translate((Math.random() - 0.5) * amount, (Math.random() - 0.5) * amount);
    }
    this.backdrop.draw(ctx, this.state === 'title' ? 0 : this.levelIndex);

    if (this.state === 'title') {
      const a = this.attract;
      a.player.drawLight(ctx);
      this.drawTiles();
      for (const shade of a.shades) shade.draw(ctx, a.time);
      a.particles.draw(ctx);
      a.player.draw(ctx, a.time);
      ctx.fillStyle = '#08061499';
      ctx.fillRect(0, 0, RULES.width, RULES.height);
      drawTitle(ctx, this, this.time);
    } else if (this.state === 'atlas') {
      drawAtlas(ctx, this, this.time);
    } else {
      this.player.drawLight(ctx);
      this.drawTiles();
      for (const dew of this.dews) dew.draw(ctx, this.time);
      for (const enemy of this.enemies) enemy.draw(ctx, this.time);
      this.particles.draw(ctx);
      if (this.state === 'playing' || this.state === 'paused') this.player.draw(ctx, this.time);
      if (this.event) {
        drawPixelText(ctx, this.event.text, RULES.width / 2, 250, 2, COLOR.gold, 'center');
      }
      if (this.state === 'playing' || this.state === 'paused') drawHUD(ctx, this);
      if (this.state === 'paused') drawPause(ctx);
      if (this.state === 'results') drawResults(ctx, this, this.time);
    }
    ctx.restore();
  }
}
