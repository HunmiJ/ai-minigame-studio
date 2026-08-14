import { describe, expect, it } from "vitest";
import { getGenerationFailureMessage } from "./generation-status";

describe("generation status messages", () => {
  it("keeps a missing configuration distinct from a connected failure", () => { expect(getGenerationFailureMessage("not_configured", "尚未配置 DeepSeek AI 服务")).toContain("尚未配置"); expect(getGenerationFailureMessage("model_incomplete", "AI 输出过长未完成")).toContain("DeepSeek 已连接"); });
});
