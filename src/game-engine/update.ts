import { INVINCIBILITY_SECONDS } from "./constants";
import { circlesCollide, clampPlayerPosition } from "./collision";
import type { GameConfig, GameState, InputState, Meteor, Particle } from "./types";

function spawnMeteor(config: GameConfig, state: GameState, random: () => number): Meteor {
  const enemy = config.enemies[0]; const [minSize, maxSize] = enemy.sizeRange; const radius = minSize + random() * (maxSize - minSize); const difficulty = Math.min(state.elapsed / config.world.duration, 1);
  return { x: radius + random() * (config.world.width - radius * 2), y: -radius - 4, radius, speed: enemy.minSpeed + random() * (enemy.maxSpeed - enemy.minSpeed) + difficulty * 85, rotation: random() * Math.PI * 2, spin: (random() - .5) * 2.8 };
}
function hitParticles(player: GameState["player"], random: () => number): Particle[] { return Array.from({ length: 16 }, () => { const angle = random() * Math.PI * 2; const speed = 70 + random() * 150; return { x: player.x, y: player.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: .52, maxLife: .52, size: 2 + random() * 4 }; }); }

export function updateGame(state: GameState, config: GameConfig, input: InputState, delta: number, random: () => number = Math.random): GameState {
  if (state.status !== "running") return state;
  const dt = Math.max(0, Math.min(delta, .05));
  const next: GameState = { ...state, player: { ...state.player }, meteors: state.meteors.map((meteor) => ({ ...meteor })), particles: state.particles.map((particle) => ({ ...particle })), elapsed: state.elapsed + dt, timeLeft: Math.max(0, state.timeLeft - dt), spawnTimer: state.spawnTimer - dt, score: state.score + config.rules.scorePerSecond * dt };
  const directionX = Number(input.right) - Number(input.left); const directionY = Number(input.down) - Number(input.up); const magnitude = Math.hypot(directionX, directionY) || 1;
  next.player.x += directionX / magnitude * config.player.speed * dt; next.player.y += directionY / magnitude * config.player.speed * dt;
  Object.assign(next.player, clampPlayerPosition(next.player, config.world.width, config.world.height));
  next.player.invincibleFor = Math.max(0, next.player.invincibleFor - dt); next.player.hitFlashFor = Math.max(0, next.player.hitFlashFor - dt);
  const interval = Math.max(.24, config.enemies[0].spawnInterval - next.elapsed * .012);
  while (next.spawnTimer <= 0) { next.meteors.push(spawnMeteor(config, next, random)); next.spawnTimer += interval; }
  next.meteors.forEach((meteor) => { meteor.y += meteor.speed * dt; meteor.rotation += meteor.spin * dt; }); next.meteors = next.meteors.filter((meteor) => meteor.y - meteor.radius < config.world.height + 10);
  next.particles.forEach((particle) => { particle.x += particle.vx * dt; particle.y += particle.vy * dt; particle.life -= dt; }); next.particles = next.particles.filter((particle) => particle.life > 0);
  if (next.player.invincibleFor <= 0) { const hit = next.meteors.find((meteor) => circlesCollide(next.player, meteor)); if (hit) { next.player.lives -= 1; next.player.invincibleFor = INVINCIBILITY_SECONDS; next.player.hitFlashFor = .3; next.meteors = next.meteors.filter((meteor) => meteor !== hit); next.particles.push(...hitParticles(next.player, random)); if (next.player.lives <= 0) next.status = "lost"; } }
  if (next.timeLeft <= 0 && next.status === "running") { next.timeLeft = 0; next.status = "won"; }
  return next;
}
