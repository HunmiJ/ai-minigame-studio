import { describe, expect, it } from "vitest";
import { collectDemoGame, demoGame, mazeDemoGame } from "@/data/demo-game";
import { applyExplicitRequirements, evaluateRequirementMatch, extractGameIntent, hasUnsupportedIntent } from "./game-intent";

describe("受控需求解析", () => {
  it("稳定映射冰雪迷宫", () => { const intent = extractGameIntent("生成一个冰雪迷宫，在 20 秒内找到出口"); expect(intent).toMatchObject({ genre: "maze", visualTheme: "ice", duration: 20 }); });
  it("映射海底珍珠收集需求", () => { const intent = extractGameIntent("生成海底接金币游戏，30 秒内接到 15 颗珍珠，三条生命，躲避水母"); expect(intent).toMatchObject({ genre: "collect", visualTheme: "ocean", duration: 30, targetCount: 15, lives: 3 }); expect(intent.collectibleKeywords).toContain("珍珠"); expect(intent.hazardKeywords).toContain("水母"); });
  it("映射熔岩躲避需求", () => { expect(extractGameIntent("熔岩主题的陨石躲避游戏")).toMatchObject({ genre: "dodge", visualTheme: "lava" }); });
  it("将用户明确数字覆盖受控配置", () => { const intent = extractGameIntent("海底接金币，30 秒内接住 15 颗珍珠，三条生命，躲避水母"); const game = applyExplicitRequirements(collectDemoGame, intent); expect(game.world.duration).toBe(30); expect(game.player.lives).toBe(3); if (game.genre === "collect") expect(game.collect).toMatchObject({ targetCount: 15, collectibleKind: "pearl", hazardKind: "jellyfish" }); });
  it("不把贪吃蛇或 2048 错误映射到现有引擎", () => { for (const prompt of ["做一个贪吃蛇游戏", "生成 2048 小游戏"]) { const intent = extractGameIntent(prompt); expect(hasUnsupportedIntent(intent)).toBe(true); expect(intent.unsupportedFeatures.length).toBeGreaterThan(0); } });
  it("给出可展示的需求匹配状态", () => { const intent = extractGameIntent("冰雪迷宫，20 秒内找到出口"); const game = applyExplicitRequirements(mazeDemoGame, intent); const match = evaluateRequirementMatch(intent, game); expect(match.primarySatisfied).toBe(true); expect(match.met).toContain("视觉主题"); expect(match.met).toContain("游戏时长"); expect(evaluateRequirementMatch(extractGameIntent("熔岩躲避"), demoGame).primarySatisfied).toBe(false); });
});
