// Small geometry and drawing helpers shared by the game's modules.

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function angleTo(from, to) {
  return Math.atan2(to.y - from.y, to.x - from.x);
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function circleHit(a, b, padding = 0) {
  return distance(a, b) <= a.radius + b.radius + padding;
}

export function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

export function glowDot(ctx, x, y, radius, color, blur = 18) {
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// A soft organic blob: radial wobble makes shapes read as living, not vectors.
export function blob(ctx, x, y, radius, color, lobes = 7, wobble = 0.14, phase = 0) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  const steps = 48;
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * Math.PI * 2;
    const r = radius * (1 + Math.sin(angle * lobes + phase) * wobble);
    const px = Math.cos(angle) * r;
    const py = Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function drawText(ctx, text, x, y, size, color, align = 'left', weight = 700) {
  ctx.font = `${weight} ${size}px "Trebuchet MS", sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}
