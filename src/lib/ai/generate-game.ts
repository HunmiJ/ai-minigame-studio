import "server-only";
import { demoGameStyles } from "@/data/demo-game";
import { GameSpecSchema, type GameSpec, type GameStyleId } from "@/schemas/game-spec";
import { getDeepSeekClient, getDeepSeekModel } from "./deepseek-client";
import { GenerateGameError, toSafeGenerateError } from "./errors";
import { buildGameInstructions } from "./prompt";

type Completion = { choices?: Array<{ finish_reason?: string | null; message?: { content?: string | null } }> };
export type DeepSeekChatRequest = { model: string; messages: Array<{ role: "system" | "user"; content: string }>; response_format: { type: "json_object" }; stream: false; max_tokens: number; thinking: { type: "disabled" } };
export type ChatCompletionCreator = (request: object) => Promise<Completion>;
export type GenerateGameDependencies = { apiKey?: string; model?: string; create?: ChatCompletionCreator };
export const INITIAL_MAX_TOKENS = 4_096;
export const RETRY_MAX_TOKENS = 8_192;

function createRequest(prompt: string, styleId: GameStyleId, retry: boolean): DeepSeekChatRequest {
  return { model: getDeepSeekModel(), messages: [{ role: "system", content: buildGameInstructions(demoGameStyles[styleId]) }, { role: "user", content: retry ? `游戏创意：${prompt}\n只输出紧凑 JSON，不要解释或代码围栏。` : `游戏创意：${prompt}` }], response_format: { type: "json_object" as const }, stream: false, max_tokens: retry ? RETRY_MAX_TOKENS : INITIAL_MAX_TOKENS, thinking: { type: "disabled" } };
}

export async function generateGameSpec({ prompt, styleId }: { prompt: string; styleId: GameStyleId }, dependencies: GenerateGameDependencies = {}): Promise<GameSpec> {
  const apiKey = dependencies.apiKey ?? process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new GenerateGameError("not_configured", "尚未配置 DeepSeek AI 服务，仍可继续试玩 Demo 游戏。");
  const create = dependencies.create ?? (async (body: object) => getDeepSeekClient(apiKey).chat.completions.create(body as never, { timeout: 20_000 }) as Promise<Completion>);
  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await create({ ...createRequest(prompt, styleId, attempt === 1), model: dependencies.model ?? getDeepSeekModel() }); const choice = response.choices?.[0];
      if (choice?.finish_reason === "length") { if (attempt === 0) continue; throw new GenerateGameError("model_incomplete", "AI 输出过长未完成，请缩短游戏创意后重试。"); }
      const content = choice?.message?.content?.trim();
      if (!content) { if (attempt === 0) continue; throw new GenerateGameError("model_refusal", "DeepSeek AI 未返回游戏配置，请稍后重试。"); }
      let json: unknown;
      try { json = JSON.parse(content); } catch { throw new GenerateGameError("invalid_json", "AI 返回的配置格式无效，请重试。"); }
      const parsed = GameSpecSchema.safeParse(json);
      if (!parsed.success) throw new GenerateGameError("invalid_output", "AI 返回的游戏规格无法安全运行，请重试。");
      return parsed.data;
    }
    throw new GenerateGameError("model_refusal", "DeepSeek AI 未返回游戏配置，请稍后重试。");
  } catch (error) { throw toSafeGenerateError(error); }
}
