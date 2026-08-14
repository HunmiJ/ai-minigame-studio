import { describe, expect, it } from "vitest";
import { snakeDemoGame } from "@/data/demo-game";
import { EMPTY_INPUT } from "./constants";
import { createSnakeFood, createSnakeState, updateSnake } from "./snake";

describe("snake engine", () => {
  const config = { ...snakeDemoGame, snake: { ...snakeDemoGame.snake, columns: 10, rows: 8, initialLength: 3, tickInterval: .1, foodScore: 10, targetScore: 20 } };
  const running = () => ({ ...createSnakeState(config), status: "running" as const });
  it("moves one grid cell per tick", () => { const state = running(), next = updateSnake(state, config, EMPTY_INPUT, .1); expect(next.body[0]).toEqual({ x: state.body[0].x + 1, y: state.body[0].y }); });
  it("eats food, grows and scores", () => { const state = running(), food = { x: state.body[0].x + 1, y: state.body[0].y }, next = updateSnake({ ...state, food }, config, EMPTY_INPUT, .1); expect(next.body).toHaveLength(state.body.length + 1); expect(next.score).toBe(10); });
  it("loses when hitting a wall", () => { const state = { ...running(), body: [{ x: config.snake.columns - 1, y: 2 }], direction: "right" as const, pendingDirection: "right" as const }, next = updateSnake(state, config, EMPTY_INPUT, .1); expect(next.status).toBe("lost"); });
  it("loses when hitting itself", () => { const state = { ...running(), body: [{ x: 3, y: 3 }, { x: 3, y: 4 }, { x: 2, y: 4 }, { x: 2, y: 3 }], direction: "down" as const, pendingDirection: "down" as const }, next = updateSnake(state, config, EMPTY_INPUT, .1); expect(next.status).toBe("lost"); });
  it("rejects an immediate reverse direction", () => { const state = running(), next = updateSnake(state, config, { ...EMPTY_INPUT, left: true }, .1); expect(next.direction).toBe("right"); });
  it("never places food on the snake and is reproducible for a fixed seed", () => { const body = [{ x: 1, y: 1 }, { x: 2, y: 1 }], first = createSnakeFood(5, 5, body, 42), second = createSnakeFood(5, 5, body, 42); expect(first).toEqual(second); expect(body).not.toContainEqual(first.food); });
});
