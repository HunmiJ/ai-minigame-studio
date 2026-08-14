import type { DodgeGameSpec, VisualTheme } from "@/schemas/game-spec";

export type GameStatus = "ready" | "running" | "paused" | "won" | "lost";
export type InputState = { up: boolean; down: boolean; left: boolean; right: boolean };
export type Vector = { x: number; y: number };
export type Meteor = Vector & { radius: number; speed: number; rotation: number; spin: number };
export type Particle = Vector & { vx: number; vy: number; life: number; maxLife: number; size: number };
export type Star = Vector & { radius: number; alpha: number };
export type GameState = { status: GameStatus; player: Vector & { radius: number; lives: number; invincibleFor: number; hitFlashFor: number }; meteors: Meteor[]; particles: Particle[]; stars: Star[]; score: number; timeLeft: number; spawnTimer: number; elapsed: number };
export type GameConfig = Pick<DodgeGameSpec, "title" | "world" | "player" | "enemies" | "rules" | "theme"> & { visualTheme?: VisualTheme };
