// Keyboard state for steering, throttle, boost and menus.

export class Input {
  constructor() {
    this.held = new Set();
    this.pressed = new Set();
    this.onKey = null;

    window.addEventListener('keydown', (event) => {
      if (!event.repeat) {
        this.held.add(event.code);
        this.pressed.add(event.code);
        if (this.onKey) this.onKey(event.code);
      }
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault();
    });
    window.addEventListener('keyup', (event) => this.held.delete(event.code));
    window.addEventListener('blur', () => this.held.clear());
  }

  steer() {
    let value = 0;
    if (this.held.has('ArrowLeft') || this.held.has('KeyA')) value -= 1;
    if (this.held.has('ArrowRight') || this.held.has('KeyD')) value += 1;
    return value;
  }

  throttle() {
    return this.held.has('ArrowUp') || this.held.has('KeyW');
  }

  brake() {
    return this.held.has('ArrowDown') || this.held.has('KeyS');
  }

  endFrame() { this.pressed.clear(); }
}
