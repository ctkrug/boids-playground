import { describe, it, expect } from 'vitest';
import { Flock } from '../src/flock.js';

const BOUNDS = { width: 800, height: 600 };

describe('Flock.setSize', () => {
  it('adds boids when growing', () => {
    const flock = new Flock(10, BOUNDS);
    flock.setSize(15);
    expect(flock.boids).toHaveLength(15);
  });

  it('removes boids when shrinking', () => {
    const flock = new Flock(10, BOUNDS);
    flock.setSize(4);
    expect(flock.boids).toHaveLength(4);
  });

  it('leaves existing boids untouched when growing', () => {
    const flock = new Flock(5, BOUNDS);
    const before = flock.boids.map((b) => ({ ...b.position }));
    flock.setSize(8);
    flock.boids.slice(0, 5).forEach((boid, i) => {
      expect(boid.position).toEqual(before[i]);
    });
  });

  it('is a no-op when the size is unchanged', () => {
    const flock = new Flock(6, BOUNDS);
    flock.setSize(6);
    expect(flock.boids).toHaveLength(6);
  });
});
