// A hand-made pixel font look: render tiny monospace glyphs, then scale with
// nearest-neighbour so headings keep crisp step edges like a bitmap font.

const cache = new Map();

function glyphCanvas(text, color) {
  const key = color + '|' + text;
  if (cache.has(key)) return cache.get(key);

  const small = document.createElement('canvas');
  const sctx = small.getContext('2d');
  const font = '8px "Courier New", monospace';
  sctx.font = font;
  const width = Math.max(1, Math.ceil(sctx.measureText(text).width));
  small.width = width;
  small.height = 10;
  const c = small.getContext('2d');
  c.font = font;
  c.textBaseline = 'top';
  c.fillStyle = color;
  c.fillText(text, 0, 0);

  cache.set(key, small);
  return small;
}

export function measurePixelText(text, scale) {
  return glyphCanvas(text, '#ffffff').width * scale;
}

export function drawPixelText(ctx, text, x, y, scale, color, align = 'left') {
  const small = glyphCanvas(text, color);
  const w = small.width * scale;
  const h = small.height * scale;
  const left = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(small, Math.round(left), Math.round(y), w, h);
  ctx.restore();
}
