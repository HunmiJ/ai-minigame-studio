import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "颜色必须是 #RRGGBB");
const shortText = (max: number) => z.string().trim().min(1).max(max);
export const VisualThemeSchema = z.enum(["space", "ocean", "lava", "ice", "forest", "neon", "desert"]);
const base = {
  version: z.literal("1.0"), title: shortText(32), description: shortText(160), visualTheme: VisualThemeSchema.default("space"),
  world: z.strictObject({ name: shortText(40), width: z.number().int().min(480).max(1600), height: z.number().int().min(270).max(900), duration: z.number().int().min(10).max(90) }),
  player: z.strictObject({ name: shortText(32), description: shortText(100), lives: z.number().int().min(1).max(5), speed: z.number().int().min(100).max(500), size: z.number().int().min(12).max(48) }),
  rules: z.strictObject({ summary: z.array(shortText(160)).min(2).max(5), scorePerSecond: z.number().int().min(1).max(500) }),
  controls: z.strictObject({ keys: z.array(shortText(12)).min(1).max(8), description: shortText(120) }),
  theme: z.strictObject({ primary: shortText(20), accent: shortText(20), atmosphere: shortText(60), background: hexColor, playerColor: hexColor, meteorColor: hexColor, particleColor: hexColor, accentColor: hexColor, nebulaColor: hexColor }),
};
const enemy = z.strictObject({ name: shortText(32), description: shortText(100), spawnInterval: z.number().min(.3).max(2.5), minSpeed: z.number().int().min(40).max(400), maxSpeed: z.number().int().min(60).max(600), minSize: z.number().int().min(10).max(50), maxSize: z.number().int().min(12).max(60) });

export const DodgeGameSpecSchema = z.strictObject({ ...base, genre: z.literal("dodge"), enemies: z.array(enemy).min(1).max(1) }).superRefine((game, context) => { const item = game.enemies[0]; if (item.maxSpeed < item.minSpeed) context.addIssue({ code: "custom", path: ["enemies", 0, "maxSpeed"], message: "速度范围无效" }); if (item.maxSize < item.minSize) context.addIssue({ code: "custom", path: ["enemies", 0, "maxSize"], message: "尺寸范围无效" }); });
export const CollectGameSpecSchema = z.strictObject({ ...base, genre: z.literal("collect"), collect: z.strictObject({ targetCount: z.number().int().min(1).max(100), collectibleKind: z.enum(["coin", "pearl", "star", "gem"]), hazardKind: z.enum(["rock", "jellyfish", "bomb", "meteor"]), coinSpawnInterval: z.number().min(.25).max(2), coinSize: z.number().int().min(10).max(42), coinSpeed: z.number().int().min(80).max(420), dangerSpawnInterval: z.number().min(.4).max(3), dangerSize: z.number().int().min(12).max(50), dangerSpeed: z.number().int().min(80).max(480) }) });
export const MazeGameSpecSchema = z.strictObject({ ...base, genre: z.literal("maze"), maze: z.strictObject({ gridWidth: z.number().int().min(9).max(31).refine((value) => value % 2 === 1, "网格宽度必须为奇数"), gridHeight: z.number().int().min(9).max(31).refine((value) => value % 2 === 1, "网格高度必须为奇数"), seed: z.number().int().min(0).max(2_147_483_647), moveInterval: z.number().min(.08).max(.6), collectibleCount: z.number().int().min(0).max(12) }) });
export const GameSpecSchema = z.discriminatedUnion("genre", [DodgeGameSpecSchema, CollectGameSpecSchema, MazeGameSpecSchema]);
export const StyleIdSchema = z.enum(["deep-space", "retro-arcade", "fresh-pixel"]);
export const GenerateRequestSchema = z.strictObject({ prompt: z.string().trim().min(10, "请至少输入 10 个字符的游戏创意").max(500, "游戏创意不能超过 500 字符"), styleId: StyleIdSchema });
export type GameSpec = z.infer<typeof GameSpecSchema>;
export type DodgeGameSpec = z.infer<typeof DodgeGameSpecSchema>;
export type CollectGameSpec = z.infer<typeof CollectGameSpecSchema>;
export type MazeGameSpec = z.infer<typeof MazeGameSpecSchema>;
export type GameStyleId = z.infer<typeof StyleIdSchema>;
export type VisualTheme = z.infer<typeof VisualThemeSchema>;
