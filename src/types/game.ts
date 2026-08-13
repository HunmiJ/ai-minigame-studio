export type GameSpec = {
  version: string;
  title: string;
  description: string;
  genre: string;
  world: string;
  player: { name: string; description: string; lives: number };
  enemies: { name: string; description: string }[];
  rules: string[];
  controls: { keys: string[]; description: string };
  theme: { primary: string; accent: string; atmosphere: string };
};
