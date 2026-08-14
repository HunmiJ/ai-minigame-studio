import { describe, expect, it } from "vitest";
import { mazeDemoGame } from "@/data/demo-game";
import { errorGenerationFeedback, idleGenerationFeedback, loadingGenerationFeedback, shouldReplaceCurrentGame, successGenerationFeedback, unsupportedGenerationFeedback } from "./generation-feedback";

describe("生成反馈状态机", () => {
  it("不支持玩法不会同时成为成功状态，也不会替换当前游戏", () => { const state = unsupportedGenerationFeedback(), current = mazeDemoGame, candidate = { ...mazeDemoGame, title: "不应载入" }; const next = shouldReplaceCurrentGame(state) ? candidate : current; expect(state.status).toBe("unsupported"); expect(shouldReplaceCurrentGame(state)).toBe(false); expect(next).toBe(current); });
  it("只有成功状态允许替换当前游戏", () => { expect(shouldReplaceCurrentGame(successGenerationFeedback())).toBe(true); expect(shouldReplaceCurrentGame(errorGenerationFeedback("失败"))).toBe(false); });
  it("新请求从 loading 状态开始，清除旧成功或错误提示", () => { expect(loadingGenerationFeedback().status).toBe("loading"); expect(idleGenerationFeedback().status).toBe("idle"); });
});
