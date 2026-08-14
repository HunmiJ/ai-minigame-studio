import { describe, expect, it } from "vitest";
import { getPreviewBadge } from "./game-preview";
describe("preview source badge", () => { it("distinguishes Demo and AI generated previews", () => { expect(getPreviewBadge("demo")).toBe("Demo Preview"); expect(getPreviewBadge("template")).toBe("Demo Preview"); expect(getPreviewBadge("ai")).toBe("AI 已生成"); }); });
