import "server-only";
import { demoGameStyles } from "@/data/demo-game";
import { applyExplicitRequirements, evaluateRequirementMatch, extractGameIntent, hasUnsupportedIntent } from "@/lib/requirements/game-intent";
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
export const MAX_MODEL_CALLS = 2;
type RepairContext = { json: unknown; issues: string[] };

function issueSummary(issues: { path: PropertyKey[]; message: string }[]) { return issues.slice(0, 8).map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`); }
function createRequest(prompt: string, styleId: GameStyleId, repair?: RepairContext): DeepSeekChatRequest {
  const content = repair ? `首次 JSON 未通过严格规格。只返回修正后的完整紧凑 JSON；不要解释、Markdown、代码块或额外字段。错误：${repair.issues.join("；")}。首次 JSON：${JSON.stringify(repair.json)}` : `游戏创意：${prompt}`;
  return { model: getDeepSeekModel(), messages: [{ role: "system", content: buildGameInstructions(demoGameStyles[styleId]) }, { role: "user", content }], response_format: { type: "json_object" }, stream: false, max_tokens: repair ? RETRY_MAX_TOKENS : INITIAL_MAX_TOKENS, thinking: { type: "disabled" } };
}

export async function generateGameSpec({ prompt, styleId }: { prompt: string; styleId: GameStyleId }, dependencies: GenerateGameDependencies = {}): Promise<GameSpec> {
  const intent = extractGameIntent(prompt);
  if (hasUnsupportedIntent(intent)) throw new GenerateGameError("unsupported_engine", "当前尚未支持该游戏引擎，已保留当前游戏。");
  const apiKey = dependencies.apiKey ?? process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new GenerateGameError("not_configured", "尚未配置 DeepSeek AI 服务，仍可继续试玩 Demo 游戏。");
  const create = dependencies.create ?? (async (body: object) => getDeepSeekClient(apiKey).chat.completions.create(body as never, { timeout: 20_000 }) as Promise<Completion>);
  try {
    let repair: RepairContext | undefined;
    for (let call = 0; call < MAX_MODEL_CALLS; call += 1) {
      const response = await create({ ...createRequest(prompt, styleId, repair), model: dependencies.model ?? getDeepSeekModel() });
      const choice = response.choices?.[0];
      if (choice?.finish_reason === "length") {
        if (call === 0) { repair = { json: {}, issues: ["输出被截断；请只输出完整紧凑 JSON"] }; continue; }
        throw new GenerateGameError("model_incomplete", "AI 输出过长未完成，请缩短游戏创意后重试。");
      }
      const content = choice?.message?.content?.trim();
      if (!content) {
        if (call === 0) { repair = { json: {}, issues: ["输出为空；请返回完整 JSON"] }; continue; }
        throw new GenerateGameError("model_refusal", "DeepSeek AI 未返回游戏配置，请稍后重试。");
      }
      let json: unknown;
      try { json = JSON.parse(content); } catch { throw new GenerateGameError("invalid_json", "AI 返回的配置格式无效，请重试。"); }
      const parsed = GameSpecSchema.safeParse(json);
      if (!parsed.success) {
        if (call === 0) { repair = { json, issues: issueSummary(parsed.error.issues) }; continue; }
        throw new GenerateGameError("invalid_output", "AI 返回的游戏规格无法安全运行，请重试。");
      }
      const merged = GameSpecSchema.safeParse(applyExplicitRequirements(parsed.data, intent));
      if (merged.success) {
        const match = evaluateRequirementMatch(intent, merged.data);
        if (match.primarySatisfied) return merged.data;
        if (call === 0) { repair = { json, issues: match.adapted.length ? match.adapted : ["主要需求未满足"] }; continue; }
      } else if (call === 0) { repair = { json, issues: issueSummary(merged.error.issues) }; continue; }
      throw new GenerateGameError("invalid_output", "AI 返回的游戏规格无法安全运行，请重试。");
    }
    throw new GenerateGameError("invalid_output", "AI 返回的游戏规格无法安全运行，请重试。");
  } catch (error) { throw toSafeGenerateError(error); }
}
