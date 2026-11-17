// Hand-pixeled night skies: smooth parallax ridges, a soft moon and drifting spores.

import { RULES, GARDENS } from './config.js';
import { createRandom } from './random.js';

export class Backdrop {
  constructor() {
    this.time = 0;
    this.random = createRandom(99173);
    this.stars = [];
    for (let i = 0; i < 80; i += 1) {
      this.stars.push({
        x: this.random() * RULES.width,
        y: this.random() * 320,
        size: i % 9 === 0 ? 2 : 1,
        phase: this.random() * Math.PI * 2,
      });
    }
  }

  update(dt) {
    this.time += dt;
  }

  // A narrow dither band along a ridge edge: texture without flooding the scene.
  edgeDither(ctx, points, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    for (let i = 0; i < points.length; i += 2) {
      const p = points[i];
      ctx.fillRect(Math.round(p.x), Math.round(p.y), 4, 4);
    }
    ctx.restore();
  }

  draw(ctx, index) {
    const g = GARDENS[index] || GARDENS[0];
    const w = RULES.width;
    const h = RULES.height;

    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, g.skyTop);
    sky.addColorStop(1, g.skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Twinkling stars.
    ctx.fillStyle = g.moon;
    for (const star of this.stars) {
      ctx.globalAlpha = 0.25 + Math.sin(this.time * 2 + star.phase) * 0.2;
      ctx.fillRect(Math.round(star.x), Math.round(star.y), star.size, star.size);
    }
    ctx.globalAlpha = 1;

    // Moon with a soft halo.
    const moonX = 764 - index * 36;
    const moonY = 92 + (index % 2) * 16;
    const halo = ctx.createRadialGradient(moonX, moonY, 10, moonX, moonY, 110);
    halo.addColorStop(0, g.accent + '44');
    halo.addColorStop(1, g.accent + '00');
    ctx.fillStyle = halo;
    ctx.fillRect(moonX - 120, moonY - 120, 240, 240);
    ctx.fillStyle = g.moon;
    ctx.beginPath();
    ctx.arc(moonX, moonY, 36, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = g.skyTop;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.arc(moonX - 13, moonY - 7, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    // Smooth rolling ridges with a dithered top edge.
    const layers = [
      { color: g.hill, y: 338, amp: 38, speed: 3, step: 120 },
      { color: g.near, y: 420, amp: 52, speed: 7, step: 150 },
      { color: '#17122c', y: 492, amp: 34, speed: 12, step: 180 },
    ];
    layers.forEach((layer, i) => {
      const shift = (this.time * layer.speed) % layer.step;
      const points = [];
      ctx.fillStyle = layer.color;
      ctx.beginPath();
      ctx.moveTo(-40, h);
      for (let x = -40; x <= w + 40; x += 20) {
        const px = x - shift;
        const y = layer.y - (Math.sin(px * 0.009 + i * 2.1) * 0.5 + 0.5) * layer.amp;
        points.push({ x: px, y });
        ctx.lineTo(px, y);
      }
      ctx.lineTo(w + 40, h);
      ctx.closePath();
      ctx.fill();
      this.edgeDither(ctx, points, g.accent, 0.12);
    });

    // Foreground thorn stems.
    ctx.fillStyle = '#0c0a1e';
    for (let i = 0; i < 18; i += 1) {
      const x = ((i * 97 + this.time * 2) % (w + 60)) - 30;
      const tall = 34 + (i % 5) * 14;
      ctx.fillRect(Math.round(x), h - tall, 5, tall);
      ctx.fillRect(Math.round(x) - 5, h - tall + 10, 5, 5);
      ctx.fillRect(Math.round(x) + 5, h - tall + 18, 5, 5);
    }

    // Drifting spores.
    ctx.fillStyle = g.accent;
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 28; i += 1) {
      const x = (i * 131 + Math.sin(this.time * 0.4 + i) * 16) % w;
      const y = (i * 73 + this.time * (4 + (i % 4) * 2)) % h;
      ctx.fillRect(Math.round(x), Math.round(y), 2, 2);
    }
    ctx.globalAlpha = 1;
  }
}
