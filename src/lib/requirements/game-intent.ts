import { GameSpecSchema, type GameSpec, type VisualTheme } from "@/schemas/game-spec";

export type Difficulty = "easy" | "normal" | "hard";
export type RequirementMatch = {
  met: string[];
  adapted: string[];
  unsupported: string[];
  primarySatisfied: boolean;
};

export type GameIntent = {
  genre?: GameSpec["genre"];
  visualTheme?: VisualTheme;
  duration?: number;
  lives?: number;
  targetCount?: number;
  targetTile?: number;
  difficulty?: Difficulty;
  collectibleKeywords: string[];
  hazardKeywords: string[];
  scenarioKeywords: string[];
  unsupportedFeatures: string[];
};

const themeMatchers: Array<[VisualTheme, RegExp]> = [
  ["ocean", /海底|海洋|珍珠|水母/], ["lava", /熔岩|火山|岩浆/],
  ["ice", /冰雪|寒冰|极地|冰川/], ["forest", /森林|丛林|自然/],
  ["neon", /霓虹|赛博朋克/], ["desert", /沙漠|黄沙/], ["space", /太空|星际|宇宙|陨石/],
];
const unsupportedMatchers: Array<[string, RegExp]> = [];
const collectKinds = ["珍珠", "金币", "星星", "宝石"];
const hazardKinds = ["水母", "炸弹", "陨石", "岩石"];

const chineseDigits: Record<string, number> = { "一": 1, "二": 2, "三": 3, "四": 4, "五": 5, "六": 6, "七": 7, "八": 8, "九": 9, "十": 10 };
function firstNumber(prompt: string, expression: RegExp) {
  const matched = prompt.match(expression);
  return matched ? (chineseDigits[matched[1]] ?? Number(matched[1])) : undefined;
}

function findKeywords(prompt: string, candidates: string[]) {
  return candidates.filter((candidate) => prompt.includes(candidate));
}

export function extractGameIntent(prompt: string): GameIntent {
  const genre = /2048|合并数字|滑动数字|数字方块/.test(prompt) ? "2048" : /贪吃蛇|蛇吃食物|身体变长|snake/i.test(prompt) ? "snake" : /迷宫|出口|探索/.test(prompt) ? "maze" : /接金币|收集|接住|珍珠|金币|宝石|星星/.test(prompt) ? "collect" : /躲避|闪避|生存|陨石/.test(prompt) ? "dodge" : undefined;
  const visualTheme = themeMatchers.find(([, matcher]) => matcher.test(prompt))?.[0];
  const unsupportedFeatures = unsupportedMatchers.filter(([, matcher]) => matcher.test(prompt)).map(([name]) => name);
  const duration = firstNumber(prompt, /(\d+)\s*(?:秒|s\b)/i);
  const lives = firstNumber(prompt, /([\d一二三四五六七八九十]+)\s*(?:条生命|点生命|条命|点血)/);
  const targetCount = firstNumber(prompt, /(?:接到|接住|收集(?:到)?|获得)\s*(\d+)\s*(?:颗|个|枚|件)/);
  const targetTile = firstNumber(prompt, /(?:合成|目标(?:数字|方块)?(?:为|是)?|达到)\s*(\d+)/);
  const difficulty = /困难|高难|挑战/.test(prompt) ? "hard" : /简单|轻松|新手/.test(prompt) ? "easy" : /普通|正常/.test(prompt) ? "normal" : undefined;
  return { genre, visualTheme, duration, lives, targetCount, targetTile, difficulty, collectibleKeywords: findKeywords(prompt, collectKinds), hazardKeywords: findKeywords(prompt, hazardKinds), scenarioKeywords: themeMatchers.filter(([, matcher]) => matcher.test(prompt)).map(([theme]) => theme), unsupportedFeatures };
}

export function hasUnsupportedIntent(intent: GameIntent) { return intent.unsupportedFeatures.length > 0; }

export function applyExplicitRequirements(game: GameSpec, intent: GameIntent): GameSpec {
  if (intent.genre && intent.genre !== game.genre) return game;
  const base = {
    ...game,
    ...(intent.visualTheme ? { visualTheme: intent.visualTheme } : {}),
    world: { ...game.world, ...(intent.duration ? { duration: intent.duration } : {}) },
    player: { ...game.player, ...(intent.lives ? { lives: intent.lives } : {}) },
  };
  if (base.genre === "2048") return GameSpecSchema.parse({ ...base, game2048: { ...base.game2048, ...(intent.targetTile ? { targetTile: intent.targetTile } : {}) } });
  if (base.genre !== "collect") return GameSpecSchema.parse(base);
  const collectibleKind = intent.collectibleKeywords.includes("珍珠") ? "pearl" : intent.collectibleKeywords.includes("星星") ? "star" : intent.collectibleKeywords.includes("宝石") ? "gem" : intent.collectibleKeywords.includes("金币") ? "coin" : base.collect.collectibleKind;
  const hazardKind = intent.hazardKeywords.includes("水母") ? "jellyfish" : intent.hazardKeywords.includes("炸弹") ? "bomb" : intent.hazardKeywords.includes("岩石") ? "rock" : intent.hazardKeywords.includes("陨石") ? "meteor" : base.collect.hazardKind;
  return GameSpecSchema.parse({ ...base, collect: { ...base.collect, ...(intent.targetCount ? { targetCount: intent.targetCount } : {}), collectibleKind, hazardKind } });
}

export function evaluateRequirementMatch(intent: GameIntent, game: GameSpec): RequirementMatch {
  const met: string[] = [];
  const adapted: string[] = [];
  const unsupported = [...intent.unsupportedFeatures];
  const same = <T,>(label: string, requested: T | undefined, actual: T) => {
    if (requested === undefined) return true;
    if (requested === actual) { met.push(label); return true; }
    adapted.push(`${label}已安全适配`); return false;
  };
  const genreOk = same("游戏类型", intent.genre, game.genre);
  const themeOk = same("视觉主题", intent.visualTheme, game.visualTheme);
  const durationOk = same("游戏时长", intent.duration, game.world.duration);
  const livesOk = same("生命数量", intent.lives, game.player.lives);
  const targetOk = intent.targetCount === undefined ? true : game.genre === "collect" && same("收集目标", intent.targetCount, game.collect.targetCount);
  const tileOk = intent.targetTile === undefined ? true : game.genre === "2048" && same("目标数字", intent.targetTile, game.game2048.targetTile);
  if (intent.difficulty) adapted.push(`难度“${intent.difficulty === "hard" ? "困难" : intent.difficulty === "easy" ? "简单" : "普通"}”已由受控参数安全适配`);
  if (intent.collectibleKeywords.length) met.push(`收集物：${intent.collectibleKeywords.join("、")}`);
  if (intent.hazardKeywords.length) met.push(`危险物：${intent.hazardKeywords.join("、")}`);
  if (intent.scenarioKeywords.length) met.push(`场景：${intent.scenarioKeywords.join("、")}`);
  return { met, adapted, unsupported, primarySatisfied: genreOk && themeOk && durationOk && livesOk && targetOk && tileOk && unsupported.length === 0 };
}
