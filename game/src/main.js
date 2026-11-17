// Enters the game: canvas, devices, frame loop and screenshot scene selection.

import { Input } from './input.js';
import { Game } from './game.js';

const canvas = document.getElementById('stage');
const context = canvas.getContext('2d');
const input = new Input(canvas);
const game = new Game(context, input);

input.onKey = (code) => {
  game.sound.unlock();
  game.handleKey(code);
};

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
