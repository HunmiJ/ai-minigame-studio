import { describe, expect, it, vi } from "vitest";
import { collectDemoGame, demoGame, mazeDemoGame } from "@/data/demo-game";
import { getVisualThemeTokens, normalizeVisualTheme, renderVisualTheme } from "./visual-theme";

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
});
