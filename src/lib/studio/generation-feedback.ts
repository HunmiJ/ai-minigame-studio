export type GenerationFeedback =
  | { status: "idle" }
  | { status: "loading"; message: string }
  | { status: "success"; message: string }
  | { status: "error"; message: string }
  | { status: "unsupported"; message: string };

export const idleGenerationFeedback = (): GenerationFeedback => ({ status: "idle" });
export const loadingGenerationFeedback = (): GenerationFeedback => ({ status: "loading", message: "AI 正在构建游戏规则…" });
export const successGenerationFeedback = (): GenerationFeedback => ({ status: "success", message: "AI 游戏已生成，可以开始试玩。尚未保存到作品库。" });
export const errorGenerationFeedback = (message: string): GenerationFeedback => ({ status: "error", message });
export const unsupportedGenerationFeedback = (): GenerationFeedback => ({ status: "unsupported", message: "当前尚未支持该游戏引擎，已保留当前游戏。" });
export const shouldReplaceCurrentGame = (feedback: GenerationFeedback) => feedback.status === "success";
