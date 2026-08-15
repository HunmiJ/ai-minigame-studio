import { describe, expect, it, vi } from "vitest";
import { collectDemoGame, demoGame, game2048DemoGame, mazeDemoGame, snakeDemoGame } from "@/data/demo-game";
import { getThemeProfile, getVisualThemeTokens, normalizeVisualTheme, renderVisualTheme } from "./visual-theme";

function context() {
  const gradient = { addColorStop: vi.fn() };
  const ctx = {
    createLinearGradient: vi.fn(() => gradient), fillRect: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), closePath: vi.fn(), fill: vi.fn(), stroke: vi.fn(), arc: vi.fn(), quadraticCurveTo: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
  return { ctx, gradient };
}

describe("visual theme normalization", () => {
  it("falls back safely for missing and unknown runtime values", () => { expect(normalizeVisualTheme(undefined)).toBe("space"); expect(normalizeVisualTheme(null)).toBe("space"); expect(normalizeVisualTheme("")).toBe("space"); expect(normalizeVisualTheme("unsafe")).toBe("space"); });
  it("keeps ocean and selects the ocean palette", () => { const { ctx, gradient } = context(); renderVisualTheme(ctx, "ocean", 960, 540); expect(normalizeVisualTheme("ocean")).toBe("ocean"); expect(gradient.addColorStop).toHaveBeenCalledWith(0, "#075789"); });
  it("does not throw while rendering invalid runtime values", () => { for (const value of [undefined, null, "", "unknown"]) expect(() => renderVisualTheme(context().ctx, value, 960, 540)).not.toThrow(); });
  it("keeps legal themes on the dodge, collect and maze configurations", () => { expect(normalizeVisualTheme(demoGame.visualTheme)).toBe("space"); expect(normalizeVisualTheme(collectDemoGame.visualTheme)).toBe("neon"); expect(normalizeVisualTheme(mazeDemoGame.visualTheme)).toBe("forest"); });
  it("exposes safe rendering tokens for every theme and falls back for invalid values", () => { for (const theme of ["space", "ocean", "lava", "ice", "forest", "neon", "desert"]) expect(getVisualThemeTokens(theme).hud).toMatch(/^#/); expect(getVisualThemeTokens(undefined).wall).toBe(getVisualThemeTokens("space").wall); expect(getVisualThemeTokens("ocean").collectible).not.toBe(getVisualThemeTokens("lava").collectible); });
  it("gives every game engine the same complete seven-theme profile", () => { const games = [demoGame, collectDemoGame, mazeDemoGame, snakeDemoGame, game2048DemoGame]; const themes = ["space", "ocean", "lava", "ice", "forest", "neon", "desert"] as const; for (const game of games) for (const theme of themes) { const profile = getThemeProfile(theme); expect(profile.id).toBe(theme); expect(profile.elements).toHaveLength(3); expect(profile.tiles.length).toBeGreaterThan(3); expect(normalizeVisualTheme({ ...game, visualTheme: theme }.visualTheme)).toBe(theme); } });
  it("uses distinct non-colour theme descriptors for ocean, ice and forest", () => { expect(getThemeProfile("ocean").elements).toEqual(["光束", "气泡", "海草"]); expect(getThemeProfile("ice").elements).toEqual(["雪花", "冰晶", "霜边"]); expect(getThemeProfile("forest").elements).toEqual(["树木", "藤蔓", "萤火虫"]); });
});
