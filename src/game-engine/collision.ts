import type { Vector } from "./types";

export function circlesCollide(a: Vector & { radius: number }, b: Vector & { radius: number }) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const radii = a.radius + b.radius;
  return dx * dx + dy * dy <= radii * radii;
}

export function clampPlayerPosition(player: Vector & { radius: number }, width: number, height: number) {
  return { ...player, x: Math.max(player.radius, Math.min(width - player.radius, player.x)), y: Math.max(player.radius, Math.min(height - player.radius, player.y)) };
}
