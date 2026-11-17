// Per-reef parallax scenery. Each zone has its own silhouette style and light.

import { RULES, ZONE_THEMES } from './config.js';

export class Backdrop {
  constructor() {
    this.time = 0;
  }

  update(dt) {
    this.time += dt;
  }

  draw(ctx, zoneIndex) {
    const theme = ZONE_THEMES[zoneIndex] || ZONE_THEMES[0];
    const w = RULES.width;
    const h = RULES.height;

    const water = ctx.createLinearGradient(0, 0, 0, h);
    water.addColorStop(0, theme.top);
    water.addColorStop(1, theme.bottom);
    ctx.fillStyle = water;
    ctx.fillRect(0, 0, w, h);

    // Narrow soft light shafts that fade out before the sea floor.
    ctx.save();
    for (let i = 0; i < 5; i += 1) {
      const base = i * 220 + Math.sin(this.time * 0.22 + i) * 26;
      const shaft = ctx.createLinearGradient(0, 0, 0, h * 0.8);
      shaft.addColorStop(0, theme.ray + '2e');
      shaft.addColorStop(1, theme.ray + '00');
      ctx.fillStyle = shaft;
      ctx.beginPath();
      ctx.moveTo(base, 0);
      ctx.lineTo(base + 30, 0);
      ctx.lineTo(base + 96, h * 0.8);
      ctx.lineTo(base + 12, h * 0.8);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Distant reef silhouettes with a slow horizontal parallax.
    const shift = (this.time * 7) % 160;
    ctx.save();
    ctx.fillStyle = theme.coral;
    ctx.globalAlpha = 0.65;
    for (let layer = 0; layer < 2; layer += 1) {
      const scale = layer === 0 ? 1 : 0.7;
      const yBase = h - (layer === 0 ? 40 : 0);
      ctx.beginPath();
      ctx.moveTo(-200, h + 40);
      for (let x = -200 - shift * scale; x <= w + 260; x += 130) {
        const peak = yBase - (40 + ((x * 7 + layer * 31) % 90)) * scale;
        ctx.quadraticCurveTo(x + 45, peak, x + 130, yBase);
      }
      ctx.lineTo(w + 260, h + 40);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Suspended motes, different colours per reef.
    ctx.save();
    ctx.fillStyle = theme.ray;
    ctx.globalAlpha = 0.3;
    for (let i = 0; i < 42; i += 1) {
      const x = (i * 137.5) % w;
      const drift = (this.time * (9 + (i % 5) * 3)) % (h + 40);
      const y = h - drift;
      ctx.beginPath();
      ctx.arc(x, y, 1 + (i % 3) * 0.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Zone-specific foreground flourish.
    if (zoneIndex === 1) this.drawKelp(ctx, theme);
    if (zoneIndex === 2) this.drawVent(ctx, theme);
    if (zoneIndex === 3) this.drawShards(ctx, theme);

    // A vignette pulls the eye toward the centre of the dive.
    const vignette = ctx.createRadialGradient(w / 2, h / 2, 170, w / 2, h / 2, 620);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.42)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);
  }

  drawKelp(ctx, theme) {
    ctx.save();
    ctx.strokeStyle = theme.ray;
    ctx.globalAlpha = 0.22;
    ctx.lineWidth = 7;
    for (let i = 0; i < 9; i += 1) {
      const x = 40 + i * 115;
      const sway = Math.sin(this.time * 0.7 + i) * 22;
      ctx.beginPath();
      ctx.moveTo(x, RULES.height + 10);
      ctx.bezierCurveTo(x - 30 + sway, 460, x + 40 + sway, 330, x + sway, 210);
      ctx.stroke();
    }
    ctx.restore();
  }

  drawVent(ctx, theme) {
    ctx.save();
    for (let i = 0; i < 7; i += 1) {
      const x = 70 + i * 140;
      const pulse = 0.5 + Math.sin(this.time * 1.3 + i * 1.7) * 0.3;
      const glow = ctx.createRadialGradient(x, RULES.height - 20, 2, x, RULES.height - 20, 90);
      glow.addColorStop(0, `rgba(255,150,90,${pulse * 0.4})`);
      glow.addColorStop(1, 'rgba(255,120,60,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(x - 100, RULES.height - 130, 200, 130);
    }
    ctx.restore();
  }

  drawShards(ctx, theme) {
    ctx.save();
    ctx.strokeStyle = theme.ray;
    ctx.globalAlpha = 0.28;
    ctx.lineWidth = 2;
    for (let i = 0; i < 14; i += 1) {
      const x = (i * 83) % RULES.width;
      const y = 60 + (i * 47) % 400 + Math.sin(this.time + i) * 8;
      const len = 20 + (i % 4) * 12;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len * 0.4, y + len);
      ctx.lineTo(x + len, y + len * 0.5);
      ctx.stroke();
    }
    ctx.restore();
  }
}
