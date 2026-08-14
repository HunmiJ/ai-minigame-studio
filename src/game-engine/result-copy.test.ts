import { describe, expect, it } from "vitest";
import { getGameOverlayCopy } from "./result-copy";

describe("game result copy", () => {
  it("uses the current game title and duration for a win", () => { expect(getGameOverlayCopy("won", "寒冰陨石挑战", 20, 0)).toEqual({ title: "寒冰陨石挑战成功", text: "你成功坚持了 20 秒。", action: "再玩一次" }); });
  it("uses the current game title and score for a loss", () => { expect(getGameOverlayCopy("lost", "寒冰陨石挑战", 20, 368.7)).toEqual({ title: "寒冰陨石挑战失败", text: "本次得分 368 分，调整策略后再试一次。", action: "重新开始" }); });
});
