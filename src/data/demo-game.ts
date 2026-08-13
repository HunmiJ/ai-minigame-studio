import type { GameSpec } from "@/types/game";

export const demoGame: GameSpec = {
  version: "0.1-demo",
  title: "星际闪避",
  description: "穿越危险的陨石带，坚持 30 秒，守护星际航线。",
  genre: "动作 · 生存",
  world: "深空陨石带",
  player: { name: "探索者号", description: "灵活的深空侦察飞船", lives: 3 },
  enemies: [{ name: "陨石", description: "从星空深处高速掠过的碎石" }],
  rules: ["使用方向键操控探索者号移动", "避开来袭陨石，碰撞会损失一格生命", "坚持 30 秒即可完成本次星际穿越"],
  controls: { keys: ["↑", "←", "↓", "→"], description: "方向键移动飞船" },
  theme: { primary: "靛蓝", accent: "青色", atmosphere: "静谧而紧张的深空" },
};
