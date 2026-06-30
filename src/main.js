import { Flock } from './flock.js';
import { drawFlock } from './render.js';

const SLIDER_IDS = [
  'perceptionRadius',
  'maxSpeed',
  'maxForce',
  'separationWeight',
  'alignmentWeight',
  'cohesionWeight',
  'pointerWeight',
];

function bindSliders(state) {
  for (const id of SLIDER_IDS) {
    const input = document.getElementById(id);
    const output = document.getElementById(`${id}Value`);
    if (!input) continue;

    input.value = state.flock.params[id];
    if (output) output.textContent = input.value;

    input.addEventListener('input', () => {
      state.flock.params[id] = Number(input.value);
      if (output) output.textContent = input.value;
    });
  }
}

function bindFlockSize(state) {
  const input = document.getElementById('flockSize');
  const output = document.getElementById('flockSizeValue');
  if (!input) return;

  input.value = state.flock.boids.length;
  if (output) output.textContent = input.value;

  input.addEventListener('input', () => {
    state.flock.setSize(Number(input.value));
    if (output) output.textContent = input.value;
  });
}

function bindPlaybackControls(state) {
  const pauseBtn = document.getElementById('pauseBtn');
  const stepBtn = document.getElementById('stepBtn');
  const resetBtn = document.getElementById('resetBtn');

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      state.running = !state.running;
      pauseBtn.textContent = state.running ? 'Pause' : 'Resume';
    });
  }

  if (stepBtn) {
    stepBtn.addEventListener('click', () => {
      state.flock.step();
      state.draw();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      state.flock = new Flock(state.flock.boids.length, state.bounds, state.flock.params);
    });
  }
}

function main() {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const bounds = { width: canvas.width, height: canvas.height };

  const state = {
    bounds,
    flock: new Flock(150, bounds),
    running: true,
    draw() {
      drawFlock(ctx, this.flock);
    },
  };

  bindSliders(state);
  bindFlockSize(state);
  bindPlaybackControls(state);

  function loop() {
    if (state.running) state.flock.step();
    state.draw();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

main();
