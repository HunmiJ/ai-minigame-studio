export const GAME_2048_GRID_SIZE = 4;
export const GAME_2048_CELL_COUNT = GAME_2048_GRID_SIZE * GAME_2048_GRID_SIZE;
export function get2048BoardSize(containerWidth: number, containerHeight: number, hudHeight = 42, verticalPadding = 22, horizontalPadding = 32) {
  return Math.max(0, Math.min(containerWidth - horizontalPadding, containerHeight - hudHeight - verticalPadding, 440));
}
export function get2048Cells(board: number[][]) { return Array.from({ length: GAME_2048_CELL_COUNT }, (_, index) => ({ x: index % GAME_2048_GRID_SIZE, y: Math.floor(index / GAME_2048_GRID_SIZE), value: board[Math.floor(index / GAME_2048_GRID_SIZE)]?.[index % GAME_2048_GRID_SIZE] ?? 0 })); }
