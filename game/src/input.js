// Keyboard and mouse state for the platformer.

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
      if (!event.repeat) {
        this.held.add(event.code);
        this.pressed.add(event.code);
        if (this.onKey) this.onKey(event.code);
      }
      if (MOVES[event.code] || event.code === 'Space' || event.code === 'ShiftLeft') event.preventDefault();
    });
    window.addEventListener('keyup', (event) => this.held.delete(event.code));
    window.addEventListener('blur', () => this.held.clear());
    canvas.addEventListener('mousedown', () => {
      this.held.add('MouseFire');
      this.pressed.add('MouseFire');
      if (this.onKey) this.onKey('MouseFire');
    });
    canvas.addEventListener('mouseup', () => this.held.delete('MouseFire'));
    canvas.addEventListener('mousemove', (event) => {
      const rect = canvas.getBoundingClientRect();
      this.mouse.x = (event.clientX - rect.left) * (canvas.width / rect.width);
      this.mouse.y = (event.clientY - rect.top) * (canvas.height / rect.height);
    });
  }

  direction() {
    let x = 0;
    if (this.held.has('ArrowLeft') || this.held.has('KeyA')) x -= 1;
    if (this.held.has('ArrowRight') || this.held.has('KeyD')) x += 1;
    return { x };
  }

  endFrame() { this.pressed.clear(); }
}
