// Bootstraps the canvas, input devices and frame loop for Tideglass.

import { Input } from './input.js';
import { SoundBoard } from './audio.js';
import { Game } from './game.js';

const canvas = document.getElementById('stage');
const context = canvas.getContext('2d');
const input = new Input(canvas);
const sound = new SoundBoard();
const game = new Game(context, input, sound);

input.onKey = (code) => {
  sound.unlock();
  game.handleKey(code);
};

// The maker's screenshot scenes: ?view=title|atlas|play|victory.
const view = new URLSearchParams(window.location.search).get('view');
if (['title', 'atlas', 'play', 'victory'].includes(view)) {
  game.setDemo(view);
  game.draw();
} else {
  let previous = performance.now();
  const loop = (now) => {
    const dt = Math.min(0.05, Math.max(0, (now - previous) / 1000));
    previous = now;
    game.update(dt);
    game.draw();
    input.endFrame();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
