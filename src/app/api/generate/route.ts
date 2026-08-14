import { NextResponse } from "next/server";
import { generateGameSpec } from "@/lib/ai/generate-game";
import { errorStatus, toSafeGenerateError } from "@/lib/ai/errors";
import { allowGeneration } from "@/lib/ai/rate-limit";
import { GenerateRequestSchema } from "@/schemas/game-spec";

export const runtime = "nodejs";

function errorResponse(code: ReturnType<typeof toSafeGenerateError>["code"], message: string) { return NextResponse.json({ error: { code, message } }, { status: errorStatus(code) }); }
function clientKey(request: Request) { return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "anonymous"; }

export async function POST(request: Request) {
  let payload: unknown;
  try { payload = await request.json(); } catch { return errorResponse("invalid_request", "请求格式不正确，请重新填写游戏创意。"); }
  const validated = GenerateRequestSchema.safeParse(payload);
  if (!validated.success) return errorResponse("invalid_request", validated.error.issues[0]?.message || "游戏创意不符合要求。");
  if (!allowGeneration(clientKey(request))) return errorResponse("rate_limited", "请求过于频繁，请稍后再试。");
  try { const game = await generateGameSpec(validated.data); return NextResponse.json({ game, mode: "ai" }); } catch (error) { const safe = toSafeGenerateError(error); return errorResponse(safe.code, safe.message); }
}
