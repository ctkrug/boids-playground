import { Flock } from './flock.js';
import { drawFlock } from './render.js';

function main() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const bounds = { width: canvas.width, height: canvas.height };

  const flock = new Flock(150, bounds);

  function loop() {
    flock.step();
    drawFlock(ctx, flock);
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

main();
