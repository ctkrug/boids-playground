const BOID_SIZE = 6;

export function drawBoid(ctx, boid) {
  const angle = Math.atan2(boid.velocity.y, boid.velocity.x);
  ctx.save();
  ctx.translate(boid.position.x, boid.position.y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(BOID_SIZE, 0);
  ctx.lineTo(-BOID_SIZE, BOID_SIZE / 2);
  ctx.lineTo(-BOID_SIZE, -BOID_SIZE / 2);
  ctx.closePath();
  ctx.fillStyle = '#7dd3fc';
  ctx.fill();
  ctx.restore();
}

export function drawFlock(ctx, flock) {
  ctx.clearRect(0, 0, flock.bounds.width, flock.bounds.height);
  for (const boid of flock.boids) {
    drawBoid(ctx, boid);
  }
}
