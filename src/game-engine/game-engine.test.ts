import { describe, expect, it } from "vitest";
import { circlesCollide, clampPlayerPosition } from "./collision";
import { createGameState } from "./create-state";
import { updateGame } from "./update";
import type { GameConfig } from "./types";

const config: GameConfig = { world: { name: "test", width: 200, height: 100, duration: 30 }, player: { name: "ship", description: "test", lives: 3, speed: 100, size: 10 }, enemies: [{ name: "rock", description: "test", spawnInterval: 100, minSpeed: 1, maxSpeed: 1, sizeRange: [5, 5] }], rules: { summary: [], scorePerSecond: 100 }, theme: { primary: "", accent: "", atmosphere: "", background: "#000", playerColor: "#fff", meteorColor: "#aaa", particleColor: "#f00", accentColor: "#0ff", nebulaColor: "#224" } };
const random = () => .5;

describe("game engine", () => {
  it("detects circular collision hits and misses", () => { expect(circlesCollide({ x: 0, y: 0, radius: 10 }, { x: 19, y: 0, radius: 10 })).toBe(true); expect(circlesCollide({ x: 0, y: 0, radius: 10 }, { x: 21, y: 0, radius: 10 })).toBe(false); });
  it("keeps the player inside the world bounds", () => { expect(clampPlayerPosition({ x: -5, y: 130, radius: 10 }, 200, 100)).toMatchObject({ x: 10, y: 90 }); });
  it("loses when the final life is hit", () => { const state = createGameState(config, random); state.status = "running"; state.player.lives = 1; state.meteors = [{ x: state.player.x, y: state.player.y, radius: 8, speed: 0, rotation: 0, spin: 0 }]; expect(updateGame(state, config, { up: false, down: false, left: false, right: false }, .01, random).status).toBe("lost"); });
  it("wins when the timer reaches zero", () => { const state = createGameState(config, random); state.status = "running"; state.timeLeft = .01; const next = updateGame(state, config, { up: false, down: false, left: false, right: false }, .02, random); expect(next.status).toBe("won"); expect(next.timeLeft).toBe(0); });
  it("does not update while paused", () => { const state = createGameState(config, random); state.status = "paused"; expect(updateGame(state, config, { up: false, down: true, left: false, right: false }, 1, random)).toBe(state); });
  it("rebuilds a clean initial state", () => { const state = createGameState(config, random); state.player.lives = 1; state.timeLeft = 3; state.score = 123; const rebuilt = createGameState(config, random); expect(rebuilt.player.lives).toBe(3); expect(rebuilt.timeLeft).toBe(30); expect(rebuilt.score).toBe(0); expect(rebuilt.status).toBe("ready"); });
});
