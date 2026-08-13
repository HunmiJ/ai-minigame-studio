import type { InputState } from "./types";

export const EMPTY_INPUT: InputState = { up: false, down: false, left: false, right: false };
export const INVINCIBILITY_SECONDS = 1.15;
export const MAX_DELTA_SECONDS = 0.05;
export const KEY_TO_DIRECTION: Record<string, keyof InputState> = { ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down", ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right" };
