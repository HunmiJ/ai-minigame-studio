import { describe, expect, it } from "vitest";
import { demoGame } from "@/data/demo-game";
import { generateGameSpec, INITIAL_MAX_TOKENS, RETRY_MAX_TOKENS, type DeepSeekChatRequest } from "./generate-game";
import { toSafeGenerateError } from "./errors";

const validInput = { prompt: "生成一个节奏较快的太空躲避游戏，玩家有三点生命。", styleId: "deep-space" as const };
const jsonResponse = (content: string | null, finish_reason: string | null = "stop") => ({ choices: [{ finish_reason, message: { content } }] });

describe("DeepSeek game generation", () => {
  it("reports a DeepSeek configuration error without an API key", async () => { await expect(generateGameSpec(validInput, { apiKey: "" })).rejects.toMatchObject({ code: "not_configured", message: expect.stringContaining("DeepSeek") }); });
  it("accepts valid mocked JSON that passes the GameSpec schema", async () => { const game = await generateGameSpec(validInput, { apiKey: "placeholder", create: async () => jsonResponse(JSON.stringify(demoGame)) }); expect(game.title).toBe(demoGame.title); expect(game.genre).toBe("dodge"); });
  it("rejects invalid JSON", async () => { await expect(generateGameSpec(validInput, { apiKey: "placeholder", create: async () => jsonResponse("{invalid") })).rejects.toMatchObject({ code: "invalid_json" }); });
  it("rejects JSON that cannot run in the game engine", async () => { const invalid = structuredClone(demoGame); invalid.player.speed = 999; await expect(generateGameSpec(validInput, { apiKey: "placeholder", create: async () => jsonResponse(JSON.stringify(invalid)) })).rejects.toMatchObject({ code: "invalid_output" }); });
  it("retries one empty completion before succeeding", async () => { let calls = 0; const game = await generateGameSpec(validInput, { apiKey: "placeholder", create: async () => { calls += 1; return calls === 1 ? jsonResponse(null) : jsonResponse(JSON.stringify(demoGame)); } }); expect(calls).toBe(2); expect(game.title).toBe(demoGame.title); });
  it("retries a truncated completion with compact JSON and a larger token budget", async () => { const requests: DeepSeekChatRequest[] = []; const game = await generateGameSpec(validInput, { apiKey: "placeholder", create: async (request) => { requests.push(request as DeepSeekChatRequest); return requests.length === 1 ? jsonResponse(null, "length") : jsonResponse(JSON.stringify(demoGame)); } }); expect(game.title).toBe(demoGame.title); expect(requests).toHaveLength(2); expect(requests[0].max_tokens).toBe(INITIAL_MAX_TOKENS); expect(requests[1].max_tokens).toBe(RETRY_MAX_TOKENS); expect(requests[0].thinking).toEqual({ type: "disabled" }); expect(requests[1].messages[1].content).toContain("紧凑 JSON"); });
  it("fails safely after two truncated completions", async () => { let calls = 0; await expect(generateGameSpec(validInput, { apiKey: "placeholder", create: async () => { calls += 1; return jsonResponse(null, "length"); } })).rejects.toMatchObject({ code: "model_incomplete" }); expect(calls).toBe(2); });
  it("fails safely after two empty completions", async () => { let calls = 0; await expect(generateGameSpec(validInput, { apiKey: "placeholder", create: async () => { calls += 1; return jsonResponse(" "); } })).rejects.toMatchObject({ code: "model_refusal" }); expect(calls).toBe(2); });
  it("maps mocked DeepSeek authentication, balance, rate-limit and service errors safely", () => { expect(toSafeGenerateError({ status: 401, message: "secret" }).code).toBe("authentication_failed"); expect(toSafeGenerateError({ status: 402 }).code).toBe("insufficient_balance"); expect(toSafeGenerateError({ status: 429 }).code).toBe("rate_limited"); expect(toSafeGenerateError({ status: 500 }).code).toBe("service_unavailable"); });
});
