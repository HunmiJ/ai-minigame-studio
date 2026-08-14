export type DeepSeekServiceStatus = "unknown" | "missing" | "connected";

export function getGenerationFailureMessage(code: string | undefined, message: string | undefined) {
  if (code === "not_configured") return message || "尚未配置 DeepSeek AI 服务，当前 Demo 已保留。";
  return `DeepSeek 已连接，但本次生成失败；当前 Demo 已保留。${message ? ` ${message}` : ""}`;
}
