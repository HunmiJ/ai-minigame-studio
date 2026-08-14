import type { GameSpec, GameStyleId } from "@/types/game";

export const SAVED_GAME_SCHEMA_VERSION = 1 as const;

export type SavedGameSource = "demo" | "template" | "ai";

export type SavedGame = {
  id: string;
  schemaVersion: typeof SAVED_GAME_SCHEMA_VERSION;
  gameSpec: GameSpec;
  sourcePrompt: string;
  styleId: GameStyleId;
  source: SavedGameSource;
  createdAt: string;
  updatedAt: string;
};

export type SavedGameDraft = Pick<SavedGame, "gameSpec" | "sourcePrompt" | "styleId" | "source">;
