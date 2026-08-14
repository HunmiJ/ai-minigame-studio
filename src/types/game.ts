import type { GameSpec as SchemaGameSpec, GameStyleId as SchemaGameStyleId, VisualTheme as SchemaVisualTheme } from "@/schemas/game-spec";

export type GameSpec = SchemaGameSpec;
export type GameStyleId = SchemaGameStyleId;
export type VisualTheme = SchemaVisualTheme;
export type GameStyle = { id: GameStyleId; label: string; theme: GameSpec["theme"] };
