import { describe, it, expect, vi } from 'vitest';
import { drawBoid, drawObstacle, drawFlock, drawDebugOverlay } from '../src/render.js';

function fakeCtx() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    clearRect: vi.fn(),
  };
}

describe('drawBoid', () => {
  it('translates to the boid position and fills a path', () => {
    const ctx = fakeCtx();
    const boid = { position: { x: 10, y: 20 }, velocity: { x: 1, y: 0 } };

    drawBoid(ctx, boid);

    expect(ctx.translate).toHaveBeenCalledWith(10, 20);
    expect(ctx.fill).toHaveBeenCalled();
  });
});

describe('drawObstacle', () => {
  it('draws a filled circle at the obstacle position', () => {
    const ctx = fakeCtx();
    drawObstacle(ctx, { x: 5, y: 6, radius: 12 });

    expect(ctx.arc).toHaveBeenCalledWith(5, 6, 12, 0, Math.PI * 2);
    expect(ctx.fill).toHaveBeenCalled();
  });
});

describe('drawFlock', () => {
  it('clears the canvas, then draws obstacles and boids', () => {
    const ctx = fakeCtx();
    const flock = {
      bounds: { width: 800, height: 600 },
      obstacles: [{ x: 1, y: 1, radius: 5 }],
      boids: [
        { position: { x: 0, y: 0 }, velocity: { x: 1, y: 0 } },
        { position: { x: 1, y: 1 }, velocity: { x: 0, y: 1 } },
      ],
    };

    drawFlock(ctx, flock);

    expect(ctx.clearRect).toHaveBeenCalledWith(0, 0, 800, 600);
    expect(ctx.arc).toHaveBeenCalledTimes(1);
    expect(ctx.translate).toHaveBeenCalledTimes(2);
  });

  it('draws nothing extra when there are no obstacles', () => {
    const ctx = fakeCtx();
    const flock = { bounds: { width: 100, height: 100 }, obstacles: [], boids: [] };

    drawFlock(ctx, flock);

    expect(ctx.arc).not.toHaveBeenCalled();
    expect(ctx.translate).not.toHaveBeenCalled();
  });
});

describe('drawDebugOverlay', () => {
  it('draws a perception-radius circle and a velocity line per boid', () => {
    const ctx = fakeCtx();
    const flock = {
      params: { perceptionRadius: 50 },
      boids: [
        { position: { x: 0, y: 0 }, velocity: { x: 1, y: 0 } },
        { position: { x: 10, y: 10 }, velocity: { x: 0, y: -2 } },
      ],
    };

    drawDebugOverlay(ctx, flock);

    expect(ctx.arc).toHaveBeenCalledTimes(2);
    expect(ctx.arc).toHaveBeenCalledWith(0, 0, 50, 0, Math.PI * 2);
    expect(ctx.moveTo).toHaveBeenCalledTimes(2);
    expect(ctx.lineTo).toHaveBeenCalledWith(10, 0);
    expect(ctx.stroke).toHaveBeenCalledTimes(4);
  });

  it('draws nothing for an empty flock', () => {
    const ctx = fakeCtx();
    drawDebugOverlay(ctx, { params: { perceptionRadius: 50 }, boids: [] });

    expect(ctx.arc).not.toHaveBeenCalled();
    expect(ctx.stroke).not.toHaveBeenCalled();
  });
});
