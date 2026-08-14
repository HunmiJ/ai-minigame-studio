import { z } from "zod";
import { GameSpecSchema, StyleIdSchema } from "@/schemas/game-spec";
import {
  SAVED_GAME_SCHEMA_VERSION,
  type SavedGame,
} from "@/types/saved-game";

export type { SavedGameDraft } from "@/types/saved-game";
import type { SavedGameDraft } from "@/types/saved-game";

export const SAVED_GAMES_STORAGE_KEY = "ai-minigame-studio:saved-games:v1";
export const MAX_SAVED_GAMES = 20;
export const MAX_IMPORT_SIZE_BYTES = 100 * 1024;

export type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export class SavedGameStorageError extends Error {
  constructor(message = "本地作品保存失败，请检查浏览器存储空间后重试。") {
    super(message);
    this.name = "SavedGameStorageError";
  }
}

export const SavedGameSchema = z.strictObject({
  id: z.string().trim().min(1).max(120),
  schemaVersion: z.literal(SAVED_GAME_SCHEMA_VERSION),
  gameSpec: GameSpecSchema,
  sourcePrompt: z.string().trim().max(500),
  styleId: StyleIdSchema,
  source: z.enum(["demo", "template", "ai"]),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

function sortByUpdatedAt(games: SavedGame[]) {
  return [...games].sort((first, second) => second.updatedAt.localeCompare(first.updatedAt));
}

export function createSavedGameId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `game-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function readSavedGames(storage: StorageLike): SavedGame[] {
  try {
    const value = storage.getItem(SAVED_GAMES_STORAGE_KEY);
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return sortByUpdatedAt(parsed.flatMap((item) => {
      const result = SavedGameSchema.safeParse(item);
      return result.success ? [result.data] : [];
    }));
  } catch {
    return [];
  }
}

function writeSavedGames(storage: StorageLike, games: SavedGame[]) {
  try {
    storage.setItem(SAVED_GAMES_STORAGE_KEY, JSON.stringify(sortByUpdatedAt(games).slice(0, MAX_SAVED_GAMES)));
  } catch {
    throw new SavedGameStorageError();
  }
}

export function createSavedGame(draft: SavedGameDraft, options: { id?: string; createdAt?: string; updatedAt?: string } = {}): SavedGame {
  const now = options.updatedAt ?? new Date().toISOString();
  const candidate = {
    id: options.id ?? createSavedGameId(),
    schemaVersion: SAVED_GAME_SCHEMA_VERSION,
    ...draft,
    createdAt: options.createdAt ?? now,
    updatedAt: now,
  };
  const result = SavedGameSchema.safeParse(candidate);
  if (!result.success) throw new SavedGameStorageError("作品数据无效，无法保存。");
  return result.data;
}

export function saveGame(storage: StorageLike, draft: SavedGameDraft, existingId?: string, now?: string): SavedGame {
  const games = readSavedGames(storage);
  const existing = existingId ? games.find((game) => game.id === existingId) : undefined;
  const game = createSavedGame(draft, { id: existing?.id, createdAt: existing?.createdAt, updatedAt: now });
  writeSavedGames(storage, [game, ...games.filter((item) => item.id !== game.id)]);
  return game;
}

export function saveImportedGame(storage: StorageLike, imported: SavedGame): SavedGame {
  const valid = SavedGameSchema.safeParse(imported);
  if (!valid.success) throw new SavedGameStorageError("导入的作品数据无效。");
  const games = readSavedGames(storage);
  writeSavedGames(storage, [valid.data, ...games.filter((item) => item.id !== valid.data.id)]);
  return valid.data;
}

export function findSavedGame(storage: StorageLike, id: string) {
  return readSavedGames(storage).find((game) => game.id === id);
}

export function deleteSavedGame(storage: StorageLike, id: string) {
  writeSavedGames(storage, readSavedGames(storage).filter((game) => game.id !== id));
}

export function importSavedGameJson(json: string, options: { id?: string; now?: string } = {}): SavedGame {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new SavedGameStorageError("文件不是有效的 JSON 格式。");
  }
  const parsed = SavedGameSchema.safeParse(raw);
  if (!parsed.success) throw new SavedGameStorageError("作品文件结构无效或版本不受支持。");
  const now = options.now ?? new Date().toISOString();
  return createSavedGame({
    gameSpec: parsed.data.gameSpec,
    sourcePrompt: parsed.data.sourcePrompt,
    styleId: parsed.data.styleId,
    source: parsed.data.source,
  }, { id: options.id ?? createSavedGameId(), createdAt: now, updatedAt: now });
}

export function ensureImportSize(size: number) {
  if (size > MAX_IMPORT_SIZE_BYTES) throw new SavedGameStorageError("导入文件不能超过 100 KB。");
}

export function exportSavedGameJson(game: SavedGame) {
  const result = SavedGameSchema.safeParse(game);
  if (!result.success) throw new SavedGameStorageError("作品数据无效，无法导出。");
  return JSON.stringify(result.data, null, 2);
}

export function createExportFilename(title: string, date = new Date()) {
  const safeTitle = title.trim().replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, "-").replace(/-+/g, "-").slice(0, 48) || "小游戏";
  const datePart = date.toISOString().slice(0, 10);
  return `${safeTitle}-${datePart}.json`;
}
