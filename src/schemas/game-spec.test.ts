import { describe, expect, it } from "vitest";
import { createStyledDemoGame, demoGame, demoGameStyles } from "@/data/demo-game";
import { GameSpecSchema, GenerateRequestSchema } from "./game-spec";

describe("GameSpecSchema", () => {
  it("accepts the playable demo game", () => { expect(GameSpecSchema.safeParse(demoGame).success).toBe(true); });
  it("accepts every type-safe style variation", () => { Object.keys(demoGameStyles).forEach((styleId) => expect(GameSpecSchema.safeParse(createStyledDemoGame(styleId as keyof typeof demoGameStyles)).success).toBe(true)); });
  it("rejects empty prompts and invalid style ids", () => { expect(GenerateRequestSchema.safeParse({ prompt: "  ", styleId: "deep-space" }).success).toBe(false); expect(GenerateRequestSchema.safeParse({ prompt: "足够长的躲避游戏创意", styleId: "maze" }).success).toBe(false); });
  it("rejects unsafe values and invalid colors", () => { const unsafe = structuredClone(demoGame); unsafe.player.lives = 8; unsafe.world.duration = 120; unsafe.player.speed = 800; unsafe.theme.background = "javascript:alert(1)"; expect(GameSpecSchema.safeParse(unsafe).success).toBe(false); });
  it("rejects inverted enemy ranges", () => { const invalid = structuredClone(demoGame); invalid.enemies[0].minSpeed = 250; invalid.enemies[0].maxSpeed = 120; invalid.enemies[0].minSize = 40; invalid.enemies[0].maxSize = 20; expect(GameSpecSchema.safeParse(invalid).success).toBe(false); });
});
