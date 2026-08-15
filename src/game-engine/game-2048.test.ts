import { describe, expect, it } from "vitest";
import { game2048DemoGame } from "@/data/demo-game";
import { create2048State, move2048Board, update2048 } from "./game-2048";

describe("2048 engine", () => {
  const config = { ...game2048DemoGame, game2048: { ...game2048DemoGame.game2048, targetTile: 8 } };
  it("merges [2,2,2,2] into [4,4,0,0]", () => expect(move2048Board([[2,2,2,2],[0,0,0,0],[0,0,0,0],[0,0,0,0]], "left").board[0]).toEqual([4,4,0,0]));
  it("merges [2,2,4,0] once", () => expect(move2048Board([[2,2,4,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]], "left").board[0]).toEqual([4,4,0,0]));
  it("does not double merge [4,4,8,8]", () => expect(move2048Board([[4,4,8,8],[0,0,0,0],[0,0,0,0],[0,0,0,0]], "left").board[0]).toEqual([8,16,0,0]));
  it("does not spawn after an invalid move", () => { const board = [[2,4,8,16],[0,0,0,0],[0,0,0,0],[0,0,0,0]], state = { ...create2048State(config), status: "running" as const, board }; expect(update2048(state, config, "left").board).toEqual(board); });
  it("spawns after a valid move", () => { const state = { ...create2048State(config), status: "running" as const, board: [[2,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]] }, next = update2048(state, config, "right"); expect(next.board.flat().filter(Boolean)).toHaveLength(2); });
  it("wins at target tile and loses on an unmergeable full board", () => { const win = update2048({ ...create2048State(config), status: "running", board: [[4,4,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]] }, config, "left"); expect(win.status).toBe("won"); const lost = update2048({ ...create2048State(config), status: "running", board: [[2,4,2,4],[4,2,4,2],[2,4,2,4],[4,2,4,2]] }, config, "left"); expect(lost.status).toBe("lost"); });
  it("creates reproducible initial boards from a fixed seed", () => expect(create2048State(config)).toEqual(create2048State(config)));
});
