// Bootstraps the canvas, input and game loop for Ember Drift.

import { Input } from './input.js';
import { SoundBoard } from './audio.js';
import { Game } from './game.js';

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
const input = new Input();
const sound = new SoundBoard();
const game = new Game(ctx, input, sound);

input.onKey = (code) => {
  sound.unlock();
  game.handleKey(code);
};

// Deterministic scene selection for the maker's screenshots: ?view=title|play|combo|over.
const requestedView = new URLSearchParams(window.location.search).get('view');
if (['title', 'play', 'combo', 'over'].includes(requestedView)) {
  game.setDemo(requestedView);
  game.draw();
} else {
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, Math.max(0, (now - last) / 1000));
    last = now;
    game.update(dt);
    game.draw();
    input.endFrame();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
