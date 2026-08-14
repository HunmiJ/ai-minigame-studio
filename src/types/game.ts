import type { GameSpec as SchemaGameSpec, GameStyleId as SchemaGameStyleId } from "@/schemas/game-spec";

export type GameSpec = SchemaGameSpec;
export type GameStyleId = SchemaGameStyleId;
export type GameStyle = { id: GameStyleId; label: string; theme: GameSpec["theme"] };
