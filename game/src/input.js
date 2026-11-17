// Keyboard state: one place turns key events into a movement vector and edge presses.

const MOVE_KEYS = {
  ArrowUp: 'up', KeyW: 'up',
  ArrowDown: 'down', KeyS: 'down',
  ArrowLeft: 'left', KeyA: 'left',
  ArrowRight: 'right', KeyD: 'right',
};

export class Input {
  constructor() {
    this.held = new Set();
    this.pressed = new Set();
    this.onKey = null;

    window.addEventListener('keydown', (event) => {
      if (event.repeat) {
        if (MOVE_KEYS[event.code] || event.code === 'Space') event.preventDefault();
        return;
      }
      this.held.add(event.code);
      this.pressed.add(event.code);
      if (MOVE_KEYS[event.code] || event.code === 'Space') event.preventDefault();
      if (this.onKey) this.onKey(event.code);
    });

    window.addEventListener('keyup', (event) => {
      this.held.delete(event.code);
    });

    window.addEventListener('blur', () => {
      this.held.clear();
    });
  }

  // Returns a normalised direction, or a zero vector when no direction is held.
  direction() {
    let x = 0;
    let y = 0;
    if (this.held.has('ArrowLeft') || this.held.has('KeyA')) x -= 1;
    if (this.held.has('ArrowRight') || this.held.has('KeyD')) x += 1;
    if (this.held.has('ArrowUp') || this.held.has('KeyW')) y -= 1;
    if (this.held.has('ArrowDown') || this.held.has('KeyS')) y += 1;
    const length = Math.hypot(x, y);
    return length > 0 ? { x: x / length, y: y / length } : { x: 0, y: 0 };
  }

  consumePress(code) {
    if (!this.pressed.has(code)) return false;
    this.pressed.delete(code);
    return true;
  }

  endFrame() {
    this.pressed.clear();
  }
}
