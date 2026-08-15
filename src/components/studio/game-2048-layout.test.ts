import { describe, expect, it } from "vitest";
import { GAME_2048_CELL_COUNT, GAME_2048_GRID_SIZE, get2048BoardSize, get2048Cells } from "./game-2048-layout";

describe("2048 preview layout", () => {
  it("reserves a HUD row and keeps the board square within desktop, narrow and mobile containers", () => { for (const [width, height] of [[900, 506], [520, 293], [360, 321], [1280, 720]]) { const size = get2048BoardSize(width, height); expect(size).toBeGreaterThan(0); expect(size).toBeLessThanOrEqual(width - 32); expect(size).toBeLessThanOrEqual(height - 64); } });
  it("always produces sixteen equal-grid positions, including empty and long-number tiles", () => { const cells = get2048Cells([[0, 2, 32, 1024], [4, 64, 2048, 0], [0, 0, 0, 0], [0, 0, 0, 0]]); expect(GAME_2048_GRID_SIZE).toBe(4); expect(cells).toHaveLength(GAME_2048_CELL_COUNT); expect(cells.map(({ x, y }) => `${x}-${y}`)).toHaveLength(16); expect(cells.at(-1)).toMatchObject({ x: 3, y: 3, value: 0 }); });
});
