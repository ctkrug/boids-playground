import { describe, it, expect } from 'vitest';
import { Boid } from '../src/boid.js';

const PARAMS = {
  perceptionRadius: 50,
  maxSpeed: 3,
  maxForce: 0.5,
  separationWeight: 1.5,
  alignmentWeight: 1,
  cohesionWeight: 1,
  obstacleWeight: 2,
  wrap: true,
};

describe('Boid', () => {
  it('returns zero acceleration with no neighbors in range', () => {
    const boid = new Boid(0, 0, 1, 0);
    const accel = boid.computeAcceleration([boid], PARAMS);
    expect(accel).toEqual({ x: 0, y: 0 });
  });

  it('steers away from a very close neighbor (separation)', () => {
    const boid = new Boid(0, 0, 0, 0);
    const neighbor = new Boid(1, 0, 0, 0);
    const accel = boid.computeAcceleration([boid, neighbor], PARAMS);
    expect(accel.x).toBeLessThan(0);
  });

  it('steers toward the average position of distant neighbors (cohesion)', () => {
    const boid = new Boid(0, 0, 0, 0);
    const far = new Boid(20, 0, 0, 0);
    const accel = boid.computeAcceleration([boid, far], PARAMS);
    expect(accel.x).toBeGreaterThan(0);
  });

  it('update() respects maxSpeed', () => {
    const boid = new Boid(0, 0, 0, 0);
    boid.update({ x: 10, y: 10 }, PARAMS, { width: 800, height: 600 });
    const speed = Math.hypot(boid.velocity.x, boid.velocity.y);
    expect(speed).toBeLessThanOrEqual(PARAMS.maxSpeed + 1e-9);
  });

  it('update() wraps position across bounds when wrap is true', () => {
    const boid = new Boid(799, 300, 5, 0);
    boid.update({ x: 0, y: 0 }, PARAMS, { width: 800, height: 600 });
    expect(boid.position.x).toBeLessThan(800);
    expect(boid.position.x).toBeGreaterThanOrEqual(0);
  });

  it('update() does not produce NaN position when wrapping into zero-size bounds', () => {
    const boid = new Boid(10, 10, 1, 1);
    boid.update({ x: 0, y: 0 }, PARAMS, { width: 0, height: 0 });
    expect(boid.position).toEqual({ x: 0, y: 0 });
  });

  it('update() bounces velocity off the edge when wrap is false', () => {
    const boid = new Boid(799, 300, 3, 0);
    boid.update({ x: 0, y: 0 }, { ...PARAMS, wrap: false }, { width: 800, height: 600 });
    expect(boid.velocity.x).toBeLessThan(0);
    expect(boid.position.x).toBe(800);
  });

  it('steers toward an active attract pointer', () => {
    const boid = new Boid(0, 0, 0, 0);
    const pointer = { active: true, mode: 'attract', position: { x: 100, y: 0 } };
    const accel = boid.computeAcceleration([boid], { ...PARAMS, pointerWeight: 0.2 }, pointer);
    expect(accel.x).toBeGreaterThan(0);
  });

  it('steers away from an active repel pointer', () => {
    const boid = new Boid(0, 0, 0, 0);
    const pointer = { active: true, mode: 'repel', position: { x: 100, y: 0 } };
    const accel = boid.computeAcceleration([boid], { ...PARAMS, pointerWeight: 0.2 }, pointer);
    expect(accel.x).toBeLessThan(0);
  });

  it('ignores an inactive pointer', () => {
    const boid = new Boid(0, 0, 0, 0);
    const pointer = { active: false, mode: 'attract', position: { x: 100, y: 0 } };
    const accel = boid.computeAcceleration([boid], { ...PARAMS, pointerWeight: 0.2 }, pointer);
    expect(accel).toEqual({ x: 0, y: 0 });
  });

  it('excludes every neighbor when perceptionRadius is zero', () => {
    const boid = new Boid(0, 0, 0, 0);
    const neighbor = new Boid(1, 0, 1, 0);
    const accel = boid.computeAcceleration([boid, neighbor], { ...PARAMS, perceptionRadius: 0 });
    expect(accel).toEqual({ x: 0, y: 0 });
  });

  it('steers away from a nearby obstacle', () => {
    const boid = new Boid(0, 0, 0, 0);
    const obstacle = { x: 20, y: 0, radius: 10 };
    const accel = boid.computeAcceleration([boid], PARAMS, null, [obstacle]);
    expect(accel.x).toBeLessThan(0);
  });

  it('ignores an obstacle outside its avoidance radius', () => {
    const boid = new Boid(0, 0, 0, 0);
    const obstacle = { x: 500, y: 0, radius: 10 };
    const accel = boid.computeAcceleration([boid], PARAMS, null, [obstacle]);
    expect(accel).toEqual({ x: 0, y: 0 });
  });

  it('steers harder away from an obstacle it is deeper inside', () => {
    const params = { ...PARAMS, maxForce: 100 };
    const closeBoid = new Boid(0, 0, 0, 0);
    const farBoid = new Boid(0, 0, 0, 0);
    const obstacle = { x: 20, y: 0, radius: 10 };

    const closeAccel = closeBoid.computeAcceleration([closeBoid], params, null, [obstacle]);
    const farAccel = farBoid.computeAcceleration(
      [farBoid],
      params,
      null,
      [{ ...obstacle, x: 35 }]
    );

    expect(Math.abs(closeAccel.x)).toBeGreaterThan(Math.abs(farAccel.x));
  });
});

describe('alignment and cohesion edge cases', () => {
  const ISOLATED = { ...PARAMS, maxForce: 1000, separationWeight: 0 };

  it('alignment with a single neighbor matches that neighbor\'s velocity exactly', () => {
    const boid = new Boid(0, 0, 0, 0);
    const neighbor = new Boid(10, 0, 2, 3);
    const params = { ...ISOLATED, alignmentWeight: 1, cohesionWeight: 0 };

    const accel = boid.computeAcceleration([boid, neighbor], params);

    expect(accel.x).toBeCloseTo(2);
    expect(accel.y).toBeCloseTo(3);
  });

  it('cohesion with a single neighbor steers exactly toward its position', () => {
    const boid = new Boid(0, 0, 0, 0);
    const neighbor = new Boid(10, 20, 0, 0);
    const params = { ...ISOLATED, alignmentWeight: 0, cohesionWeight: 1 };

    const accel = boid.computeAcceleration([boid, neighbor], params);

    expect(accel.x).toBeCloseTo(10);
    expect(accel.y).toBeCloseTo(20);
  });

  it('ignores neighbors that occupy the exact same position (zero distance)', () => {
    const boid = new Boid(5, 5, 0, 0);
    const coincident = [new Boid(5, 5, 1, 0), new Boid(5, 5, 0, 1)];
    const params = { ...ISOLATED, alignmentWeight: 1, cohesionWeight: 1 };

    const accel = boid.computeAcceleration([boid, ...coincident], params);

    expect(accel).toEqual({ x: 0, y: 0 });
  });

  it('includes a neighbor sitting exactly on the perception-radius boundary', () => {
    const boid = new Boid(0, 0, 0, 0);
    const onBoundary = new Boid(PARAMS.perceptionRadius, 0, 1, 0);
    const params = { ...ISOLATED, alignmentWeight: 1, cohesionWeight: 0 };

    const accel = boid.computeAcceleration([boid, onBoundary], params);

    expect(accel.x).toBeCloseTo(1);
  });

  it('excludes a neighbor just beyond the perception-radius boundary', () => {
    const boid = new Boid(0, 0, 0, 0);
    const justBeyond = new Boid(PARAMS.perceptionRadius + 0.01, 0, 1, 0);
    const params = { ...ISOLATED, alignmentWeight: 1, cohesionWeight: 0 };

    const accel = boid.computeAcceleration([boid, justBeyond], params);

    expect(accel).toEqual({ x: 0, y: 0 });
  });
});
