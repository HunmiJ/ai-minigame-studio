export type GenerateErrorCode = "invalid_request" | "not_configured" | "unsupported_engine" | "rate_limited" | "authentication_failed" | "insufficient_balance" | "model_refusal" | "model_incomplete" | "invalid_json" | "invalid_output" | "timeout" | "service_unavailable";

export class GenerateGameError extends Error { constructor(public readonly code: GenerateErrorCode, message: string) { super(message); this.name = "GenerateGameError"; } }
export function errorStatus(code: GenerateErrorCode) { if (code === "invalid_request") return 400; if (code === "unsupported_engine") return 422; if (code === "not_configured" || code === "service_unavailable") return 503; if (code === "rate_limited") return 429; if (code === "timeout") return 504; if (code === "authentication_failed") return 401; if (code === "insufficient_balance") return 402; return 422; }

export function toSafeGenerateError(error: unknown) {
  if (error instanceof GenerateGameError) return error;
  const candidate = error as { status?: number; name?: string; code?: string; message?: string } | undefined;
  if (candidate?.status === 401 || candidate?.status === 403) return new GenerateGameError("authentication_failed", "DeepSeek AI 服务认证失败，请检查服务配置。");
  if (candidate?.status === 402 || candidate?.code === "insufficient_balance") return new GenerateGameError("insufficient_balance", "DeepSeek AI 服务余额不足，请稍后联系管理员。 ");
  if (candidate?.status === 429) return new GenerateGameError("rate_limited", "请求过于频繁，请稍后再试。");
  if (candidate?.name?.includes("Timeout") || candidate?.code === "ETIMEDOUT") return new GenerateGameError("timeout", "DeepSeek AI 服务响应超时，请稍后重试。");
  return new GenerateGameError("service_unavailable", "DeepSeek AI 服务暂时不可用，请稍后重试。");
}
