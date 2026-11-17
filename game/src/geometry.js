// Vector, track and drawing helpers for the racer.

export function clamp(value, low, high) {
  return Math.max(low, Math.min(high, value));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function drawText(ctx, text, x, y, size, color, align = 'left', weight = 700, mono = true) {
  ctx.font = `${weight} ${size}px ${mono ? '"Courier New", monospace' : '"Trebuchet MS", sans-serif'}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

export function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}
