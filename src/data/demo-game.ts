import type { GameSpec, GameStyle, GameStyleId } from "@/types/game";

export const demoGame: GameSpec = {
  version: "0.2-demo",
  title: "星际闪避",
  description: "穿越危险的陨石带，坚持 30 秒，守护星际航线。",
  genre: "动作 · 生存",
  world: { name: "深空陨石带", width: 960, height: 540, duration: 30 },
  player: { name: "探索者号", description: "灵活的深空侦察飞船", lives: 3, speed: 330, size: 26 },
  enemies: [{ name: "陨石", description: "从星空深处高速掠过的碎石", spawnInterval: 0.72, minSpeed: 125, maxSpeed: 205, sizeRange: [18, 37] }],
  rules: { summary: ["使用方向键或 WASD 操控探索者号移动", "避开来袭陨石，碰撞会损失一格生命", "坚持 30 秒即可完成本次星际穿越"], scorePerSecond: 100 },
  controls: { keys: ["↑", "←", "↓", "→"], description: "方向键 / WASD / 触屏按钮移动飞船" },
  theme: { primary: "靛蓝", accent: "青色", atmosphere: "静谧而紧张的深空", background: "#071126", playerColor: "#66efff", meteorColor: "#77829d", particleColor: "#ff7f9d", accentColor: "#8d7dff", nebulaColor: "#6d42bc" },
};

export const demoGameStyles: Record<GameStyleId, GameStyle> = {
  "deep-space": { id: "deep-space", label: "深空霓虹", theme: demoGame.theme },
  "retro-arcade": { id: "retro-arcade", label: "复古街机", theme: { primary: "紫红", accent: "琥珀", atmosphere: "像素街机中的高能星际赛道", background: "#1a103d", playerColor: "#ffe15b", meteorColor: "#ff8b5e", particleColor: "#ff4e8a", accentColor: "#ff6db1", nebulaColor: "#6e2c87" } },
  "fresh-pixel": { id: "fresh-pixel", label: "清新像素", theme: { primary: "薄荷绿", accent: "天青", atmosphere: "明亮轻盈的像素宇宙", background: "#083b4b", playerColor: "#d9ff84", meteorColor: "#73c7c2", particleColor: "#ffb86f", accentColor: "#77e6c4", nebulaColor: "#207e8d" } },
};

export function createStyledDemoGame(styleId: GameStyleId): GameSpec {
  return { ...demoGame, theme: demoGameStyles[styleId].theme };
}
