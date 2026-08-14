import type { SnakeGameSpec } from "@/schemas/game-spec";
import type { InputState } from "./types";

export type SnakeDirection = "up" | "down" | "left" | "right";
export type SnakePoint = { x: number; y: number };
export type SnakeState = { status: "ready" | "running" | "paused" | "won" | "lost"; body: SnakePoint[]; direction: SnakeDirection; pendingDirection: SnakeDirection; food: SnakePoint; score: number; tickAccumulator: number; flashFor: number; seed: number };

function random(seed: number) { const next = (seed * 1664525 + 1013904223) >>> 0; return { seed: next, value: next / 4_294_967_296 }; }
function opposite(first: SnakeDirection, second: SnakeDirection) { return (first === "up" && second === "down") || (first === "down" && second === "up") || (first === "left" && second === "right") || (first === "right" && second === "left"); }
export function chooseSnakeDirection(input: InputState, current: SnakeDirection): SnakeDirection { const candidate: SnakeDirection | undefined = input.up ? "up" : input.down ? "down" : input.left ? "left" : input.right ? "right" : undefined; return candidate && !opposite(candidate, current) ? candidate : current; }
export function createSnakeFood(columns: number, rows: number, body: SnakePoint[], seed: number): { food: SnakePoint; seed: number } {
  const available: SnakePoint[] = []; for (let y = 0; y < rows; y += 1) for (let x = 0; x < columns; x += 1) if (!body.some((point) => point.x === x && point.y === y)) available.push({ x, y });
  const next = random(seed); return { food: available[Math.floor(next.value * available.length)] ?? { x: 0, y: 0 }, seed: next.seed };
}
export function createSnakeState(config: SnakeGameSpec): SnakeState { const x = Math.floor(config.snake.columns / 2), y = Math.floor(config.snake.rows / 2), body = Array.from({ length: config.snake.initialLength }, (_, index) => ({ x: x - index, y })), food = createSnakeFood(config.snake.columns, config.snake.rows, body, config.snake.seed); return { status: "ready", body, direction: "right", pendingDirection: "right", food: food.food, score: 0, tickAccumulator: 0, flashFor: 0, seed: food.seed }; }
function move(point: SnakePoint, direction: SnakeDirection): SnakePoint { return direction === "up" ? { x: point.x, y: point.y - 1 } : direction === "down" ? { x: point.x, y: point.y + 1 } : direction === "left" ? { x: point.x - 1, y: point.y } : { x: point.x + 1, y: point.y }; }
export function updateSnake(state: SnakeState, config: SnakeGameSpec, input: InputState, delta: number): SnakeState {
  if (state.status !== "running") return state;
  const pendingDirection = chooseSnakeDirection(input, state.direction), base = { ...state, body: state.body.map((point) => ({ ...point })), pendingDirection, tickAccumulator: state.tickAccumulator + Math.max(0, delta), flashFor: Math.max(0, state.flashFor - delta) };
  if (base.tickAccumulator < config.snake.tickInterval) return base;
  base.tickAccumulator -= config.snake.tickInterval; const head = move(base.body[0], pendingDirection), hitsWall = head.x < 0 || head.y < 0 || head.x >= config.snake.columns || head.y >= config.snake.rows, eats = head.x === base.food.x && head.y === base.food.y, bodyToCheck = eats ? base.body : base.body.slice(0, -1);
  if (hitsWall || bodyToCheck.some((point) => point.x === head.x && point.y === head.y)) return { ...base, direction: pendingDirection, status: "lost", flashFor: .5 };
  const body = [head, ...base.body]; if (!eats) body.pop(); let seed = base.seed, food = base.food, score = base.score;
  if (eats) { score += config.snake.foodScore; const nextFood = createSnakeFood(config.snake.columns, config.snake.rows, body, seed); food = nextFood.food; seed = nextFood.seed; }
  return { ...base, body, direction: pendingDirection, food, seed, score, status: score >= config.snake.targetScore ? "won" : "running", flashFor: eats ? .22 : base.flashFor };
}
