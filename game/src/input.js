// Keyboard and mouse state in one place.

const MOVES = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
};

export class Input {
  constructor(canvas) {
    this.held = new Set();
    this.pressed = new Set();
    this.mouse = { x: 480, y: 300 };
    this.onKey = null;

    window.addEventListener('keydown', (event) => {
      if (event.repeat) {
        if (MOVES[event.code] || event.code === 'Space') event.preventDefault();
        return;
      }
      this.held.add(event.code);
      this.pressed.add(event.code);
      if (MOVES[event.code] || event.code === 'Space') event.preventDefault();
      if (this.onKey) this.onKey(event.code);
    });

    window.addEventListener('keyup', (event) => this.held.delete(event.code));
    window.addEventListener('blur', () => this.held.clear());

    canvas.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = (event.clientX - rect.left) * (canvas.width / rect.width);
      this.mouse.y = (event.clientY - rect.top) * (canvas.height / rect.height);
    });
    canvas.addEventListener('mousedown', () => {
      this.pressed.add('MouseFire');
      if (this.onKey) this.onKey('MouseFire');
    });
  }

  direction() {
    let x = 0;
    let y = 0;
    if (this.held.has('ArrowLeft') || this.held.has('KeyA')) x -= 1;
    if (this.held.has('ArrowRight') || this.held.has('KeyD')) x += 1;
    if (this.held.has('ArrowUp') || this.held.has('KeyW')) y -= 1;
    if (this.held.has('ArrowDown') || this.held.has('KeyS')) y += 1;
    const length = Math.hypot(x, y);
    return length ? { x: x / length, y: y / length } : { x: 0, y: 0 };
  }

  endFrame() {
    this.pressed.clear();
  }
}
