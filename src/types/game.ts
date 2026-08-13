export type GameSpec = {
  version: string;
  title: string;
  description: string;
  genre: string;
  world: { name: string; width: number; height: number; duration: number };
  player: { name: string; description: string; lives: number; speed: number; size: number };
  enemies: { name: string; description: string; spawnInterval: number; minSpeed: number; maxSpeed: number; sizeRange: [number, number] }[];
  rules: { summary: string[]; scorePerSecond: number };
  controls: { keys: string[]; description: string };
  theme: { primary: string; accent: string; atmosphere: string; background: string; playerColor: string; meteorColor: string; particleColor: string; accentColor: string; nebulaColor: string };
};

export type GameStyleId = "deep-space" | "retro-arcade" | "fresh-pixel";

export type GameStyle = {
  id: GameStyleId;
  label: string;
  theme: GameSpec["theme"];
};
