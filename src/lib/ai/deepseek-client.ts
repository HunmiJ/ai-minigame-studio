import "server-only";
import OpenAI from "openai";
import { GenerateGameError } from "./errors";

export function getDeepSeekClient(apiKey = process.env.DEEPSEEK_API_KEY) {
  if (!apiKey) throw new GenerateGameError("not_configured", "尚未配置 DeepSeek AI 服务，仍可继续试玩 Demo 游戏。");
  return new OpenAI({ apiKey, baseURL: process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com", timeout: 15_000, maxRetries: 0 });
}

export function getDeepSeekModel() { return process.env.DEEPSEEK_MODEL || "deepseek-v4-flash"; }
