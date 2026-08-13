import type { GameConfig, GameState } from "./types";

export function createGameState(config: GameConfig, random: () => number = Math.random): GameState {
  const stars = Array.from({ length: 72 }, () => ({ x: random() * config.world.width, y: random() * config.world.height, radius: .5 + random() * 1.5, alpha: .25 + random() * .75 }));
  return { status: "ready", player: { x: config.world.width / 2, y: config.world.height * .75, radius: config.player.size, lives: config.player.lives, invincibleFor: 0, hitFlashFor: 0 }, meteors: [], particles: [], stars, score: 0, timeLeft: config.world.duration, spawnTimer: config.enemies[0].spawnInterval, elapsed: 0 };
}
