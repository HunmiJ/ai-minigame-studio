import { describe, expect, it } from "vitest";
import { demoGame, game2048DemoGame, snakeDemoGame } from "@/data/demo-game";
import { MAX_SAVED_GAMES, SAVED_GAMES_STORAGE_KEY, createExportFilename, createSavedGame, ensureImportSize, exportSavedGameJson, importSavedGameJson, readSavedGames, saveGame } from "@/lib/storage/saved-games";

class MemoryStorage {
  private values = new Map<string, string>();
  getItem(key: string) { return this.values.get(key) ?? null; }
  setItem(key: string, value: string) { this.values.set(key, value); }
  removeItem(key: string) { this.values.delete(key); }
}

const draft = { gameSpec: demoGame, sourcePrompt: "生成一个太空主题的躲避游戏，玩家使用方向键移动。", styleId: "deep-space" as const, source: "demo" as const };

describe("saved games storage", () => {
  it("saves a new work and updates it without duplicate records", () => {
    const storage = new MemoryStorage();
    const first = saveGame(storage, draft, undefined, "2026-08-14T01:00:00.000Z");
    const updated = saveGame(storage, { ...draft, source: "template" }, first.id, "2026-08-14T02:00:00.000Z");
    expect(readSavedGames(storage)).toEqual([updated]);
    expect(updated.createdAt).toBe(first.createdAt);
  });

  it("keeps at most 20 works and sorts by updated time", () => {
    const storage = new MemoryStorage();
    let newestId = "";
    for (let index = 0; index < 22; index += 1) newestId = saveGame(storage, draft, undefined, `2026-08-${String(index + 1).padStart(2, "0")}T00:00:00.000Z`).id;
    const games = readSavedGames(storage);
    expect(games).toHaveLength(MAX_SAVED_GAMES);
    expect(games[0].id).toBe(newestId);
    expect(games[0].updatedAt).toBe("2026-08-22T00:00:00.000Z");
    expect(games.at(-1)?.updatedAt).toBe("2026-08-03T00:00:00.000Z");
  });

  it("ignores damaged localStorage records", () => {
    const storage = new MemoryStorage();
    storage.setItem(SAVED_GAMES_STORAGE_KEY, JSON.stringify([{ nope: true }, createSavedGame(draft, { id: "valid", updatedAt: "2026-08-14T00:00:00.000Z" })]));
    expect(readSavedGames(storage).map((game) => game.id)).toEqual(["valid"]);
  });

  it("loads legacy saved dodge work with the safe default visual theme", () => {
    const storage = new MemoryStorage(); const saved = createSavedGame(draft, { id: "legacy", updatedAt: "2026-08-14T00:00:00.000Z" });
    const legacy = JSON.parse(JSON.stringify(saved)) as { gameSpec: Record<string, unknown> }; delete legacy.gameSpec.visualTheme;
    storage.setItem(SAVED_GAMES_STORAGE_KEY, JSON.stringify([legacy]));
    expect(readSavedGames(storage)[0].gameSpec.visualTheme).toBe("space");
  });

  it("rejects invalid GameSpec while saving", () => {
    expect(() => createSavedGame({ ...draft, gameSpec: { ...demoGame, title: "", } })).toThrow("作品数据无效");
  });

  it("imports valid JSON as a new id and safely rejects invalid input", () => {
    const exported = createSavedGame(draft, { id: "original", updatedAt: "2026-08-14T00:00:00.000Z" });
    const imported = importSavedGameJson(exportSavedGameJson(exported), { id: "new-id", now: "2026-08-15T00:00:00.000Z" });
    expect(imported.id).toBe("new-id");
    expect(imported.gameSpec).toEqual(demoGame);
    expect(() => importSavedGameJson("not json")).toThrow("有效的 JSON");
    expect(() => importSavedGameJson(JSON.stringify({ ...exported, schemaVersion: 99 }))).toThrow("版本不受支持");
  });

  it("saves, exports and imports a snake game without changing its genre", () => { const saved = createSavedGame({ ...draft, gameSpec: snakeDemoGame, source: "template" }, { id: "snake", updatedAt: "2026-08-15T00:00:00.000Z" }); const imported = importSavedGameJson(exportSavedGameJson(saved), { id: "snake-copy", now: "2026-08-15T01:00:00.000Z" }); expect(imported.id).toBe("snake-copy"); expect(imported.gameSpec.genre).toBe("snake"); });
  it("saves, exports and imports a 2048 game without changing its genre", () => { const saved = createSavedGame({ ...draft, gameSpec: game2048DemoGame, source: "template" }, { id: "2048", updatedAt: "2026-08-16T00:00:00.000Z" }); const imported = importSavedGameJson(exportSavedGameJson(saved), { id: "2048-copy", now: "2026-08-16T01:00:00.000Z" }); expect(imported.gameSpec.genre).toBe("2048"); });

  it("limits import size and only exports safe saved-game fields", () => {
    expect(() => ensureImportSize(100 * 1024 + 1)).toThrow("100 KB");
    const text = exportSavedGameJson(createSavedGame(draft, { id: "export", updatedAt: "2026-08-14T00:00:00.000Z" }));
    expect(text).not.toContain("API_KEY");
    expect(createExportFilename("熔岩/闪避", new Date("2026-08-14T00:00:00.000Z"))).toBe("熔岩-闪避-2026-08-14.json");
  });
});
