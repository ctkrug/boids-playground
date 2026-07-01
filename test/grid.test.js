import { describe, it, expect } from 'vitest';
import { SpatialGrid } from '../src/grid.js';

describe('SpatialGrid', () => {
  it('returns boids sharing a cell with the query point', () => {
    const near = { position: { x: 5, y: 5 } };
    const grid = SpatialGrid.buildFor([near], 50);
    expect(grid.queryNear({ x: 0, y: 0 }, 50)).toContain(near);
  });

  it('returns boids in adjacent cells within range', () => {
    const adjacent = { position: { x: 51, y: 0 } };
    const grid = SpatialGrid.buildFor([adjacent], 50);
    expect(grid.queryNear({ x: 49, y: 0 }, 50)).toContain(adjacent);
  });

  it('excludes boids many cells away', () => {
    const far = { position: { x: 1000, y: 1000 } };
    const grid = SpatialGrid.buildFor([far], 50);
    expect(grid.queryNear({ x: 0, y: 0 }, 50)).not.toContain(far);
  });

  it('returns an empty array when no boids are nearby', () => {
    const grid = SpatialGrid.buildFor([], 50);
    expect(grid.queryNear({ x: 0, y: 0 }, 50)).toEqual([]);
  });

  it('handles negative coordinates without throwing', () => {
    const boid = { position: { x: -120, y: -80 } };
    const grid = SpatialGrid.buildFor([boid], 50);
    expect(grid.queryNear({ x: -120, y: -80 }, 50)).toContain(boid);
  });

  it('widens the search block for a larger query radius', () => {
    const boid = { position: { x: 140, y: 0 } };
    const grid = SpatialGrid.buildFor([boid], 50);
    expect(grid.queryNear({ x: 0, y: 0 }, 150)).toContain(boid);
  });

  it('clamps a non-positive cell size instead of dividing by zero', () => {
    const boid = { position: { x: 5, y: 5 } };
    const grid = SpatialGrid.buildFor([boid], 0);
    expect(() => grid.queryNear({ x: 0, y: 0 }, 10)).not.toThrow();
    expect(grid.queryNear({ x: 5, y: 5 }, 10)).toContain(boid);
  });

  it('clamps a non-finite cell size instead of producing NaN buckets', () => {
    const boid = { position: { x: 5, y: 5 } };
    const grid = SpatialGrid.buildFor([boid], NaN);
    expect(grid.queryNear({ x: 5, y: 5 }, 10)).toContain(boid);
  });
});
