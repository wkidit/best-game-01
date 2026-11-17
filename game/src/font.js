// Bitmap-look headings: draw small text, then scale with nearest-neighbour.

const cache = new Map();

function small(text, color) {
  const key = color + '|' + text;
  if (cache.has(key)) return cache.get(key);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const font = '8px "Courier New", monospace';
  ctx.font = font;
  canvas.width = Math.max(1, Math.ceil(ctx.measureText(text).width));
  canvas.height = 10;
  const draw = canvas.getContext('2d');
  draw.font = font;
  draw.textBaseline = 'top';
  draw.fillStyle = color;
  draw.fillText(text, 0, 0);
  cache.set(key, canvas);
  return canvas;
}

export function drawPixelText(ctx, text, x, y, scale, color, align = 'left') {
  const img = small(text, color);
  const w = img.width * scale;
  const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, Math.round(left), Math.round(y), w, img.height * scale);
  ctx.restore();
}
