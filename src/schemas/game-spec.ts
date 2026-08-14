import { z } from "zod";

const hexColor = z.string().regex(/^#[0-9A-Fa-f]{6}$/, "颜色必须是六位十六进制颜色");
const shortText = (max: number) => z.string().trim().min(1).max(max);

export const GameSpecSchema = z.strictObject({
  version: z.literal("1.0"),
  title: shortText(32),
  description: shortText(160),
  genre: z.literal("dodge"),
  world: z.strictObject({ name: shortText(40), width: z.number().int().min(480).max(1600), height: z.number().int().min(270).max(900), duration: z.number().int().min(10).max(90) }),
  player: z.strictObject({ name: shortText(32), description: shortText(100), lives: z.number().int().min(1).max(5), speed: z.number().int().min(100).max(500), size: z.number().int().min(12).max(48) }),
  enemies: z.array(z.strictObject({ name: shortText(32), description: shortText(100), spawnInterval: z.number().min(.3).max(2.5), minSpeed: z.number().int().min(40).max(400), maxSpeed: z.number().int().min(60).max(600), minSize: z.number().int().min(10).max(50), maxSize: z.number().int().min(12).max(60) })).min(1).max(1),
  rules: z.strictObject({ summary: z.array(shortText(160)).min(2).max(5), scorePerSecond: z.number().int().min(10).max(500) }),
  controls: z.strictObject({ keys: z.array(shortText(12)).min(1).max(8), description: shortText(120) }),
  theme: z.strictObject({ primary: shortText(20), accent: shortText(20), atmosphere: shortText(60), background: hexColor, playerColor: hexColor, meteorColor: hexColor, particleColor: hexColor, accentColor: hexColor, nebulaColor: hexColor }),
}).superRefine((game, context) => {
  const enemy = game.enemies[0];
  if (enemy.maxSpeed < enemy.minSpeed) context.addIssue({ code: "custom", path: ["enemies", 0, "maxSpeed"], message: "maxSpeed 不得小于 minSpeed" });
  if (enemy.maxSize < enemy.minSize) context.addIssue({ code: "custom", path: ["enemies", 0, "maxSize"], message: "最大陨石尺寸不得小于最小尺寸" });
});

export const StyleIdSchema = z.enum(["deep-space", "retro-arcade", "fresh-pixel"]);
export const GenerateRequestSchema = z.strictObject({ prompt: z.string().trim().min(10, "请至少输入 10 个字符的游戏创意").max(500, "游戏创意不能超过 500 个字符"), styleId: StyleIdSchema });

export type GameSpec = z.infer<typeof GameSpecSchema>;
export type GameStyleId = z.infer<typeof StyleIdSchema>;
