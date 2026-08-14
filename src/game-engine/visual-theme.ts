import type { VisualTheme } from "@/schemas/game-spec";

const visualThemes = ["space", "ocean", "lava", "ice", "forest", "neon", "desert"] as const;
type Palette = { top: string; bottom: string; wall: string; floor: string; grid: string; player: string; collectible: string; hazard: string; particle: string; glow: string; hud: string };

const palettes: Record<VisualTheme, Palette> = {
  space: { top: "#071126", bottom: "#171046", wall: "#18224c", floor: "#0a1430", grid: "#5063a155", player: "#7ceeff", collectible: "#ffd36a", hazard: "#ff7b91", particle: "#c8eaff", glow: "#9a86ff", hud: "#78e7ff" },
  ocean: { top: "#075789", bottom: "#021a42", wall: "#14637d", floor: "#083f62", grid: "#8eefff55", player: "#b4f8ff", collectible: "#f7fbff", hazard: "#f57ac9", particle: "#91f5ff", glow: "#55e8d0", hud: "#8ff6ff" },
  lava: { top: "#4a130d", bottom: "#160609", wall: "#4e2a22", floor: "#28100e", grid: "#ff8a5255", player: "#ffe3ab", collectible: "#ffd35b", hazard: "#ff583d", particle: "#ffc052", glow: "#ff7b35", hud: "#ffbc72" },
  ice: { top: "#75d5ed", bottom: "#123f70", wall: "#b9efff", floor: "#1f6394", grid: "#efffff88", player: "#dffcff", collectible: "#ffffff", hazard: "#6a8fd8", particle: "#d9faff", glow: "#aaf5ff", hud: "#e4fbff" },
  forest: { top: "#225f38", bottom: "#061c18", wall: "#315c3d", floor: "#123825", grid: "#a8dc7b55", player: "#e8ffad", collectible: "#ffe678", hazard: "#d95c50", particle: "#bcff85", glow: "#85e99a", hud: "#d5ff9e" },
  neon: { top: "#20144a", bottom: "#050616", wall: "#34276d", floor: "#120d2e", grid: "#ff57e088", player: "#62f5ff", collectible: "#f9e85c", hazard: "#ff5cbd", particle: "#a568ff", glow: "#ff60de", hud: "#70f4ff" },
  desert: { top: "#dbad68", bottom: "#71452b", wall: "#b77a42", floor: "#7d4e2c", grid: "#ffe0a466", player: "#fff0b8", collectible: "#ffe169", hazard: "#b84336", particle: "#ffe1a2", glow: "#ffd070", hud: "#fff0b0" },
};

export function normalizeVisualTheme(value: unknown): VisualTheme { return typeof value === "string" && (visualThemes as readonly string[]).includes(value) ? value as VisualTheme : "space"; }
export function getVisualThemeTokens(value: unknown): Palette { return palettes[normalizeVisualTheme(value)]; }

function specks(ctx: CanvasRenderingContext2D, color: string, width: number, height: number, elapsed: number, count: number, size = 2) {
  ctx.fillStyle = color;
  for (let i = 0; i < count; i += 1) { const x = (i * 83 + elapsed * (7 + i % 4)) % width; const y = (i * 47 + elapsed * (5 + i % 3)) % height; ctx.globalAlpha = .35 + (i % 4) * .15; ctx.fillRect(x, y, size + i % 2, size + i % 2); }
  ctx.globalAlpha = 1;
}

export function renderVisualTheme(ctx: CanvasRenderingContext2D, visualTheme: unknown, width: number, height: number, elapsed = 0) {
  const theme = normalizeVisualTheme(visualTheme), palette = getVisualThemeTokens(theme), gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, palette.top); gradient.addColorStop(1, palette.bottom); ctx.fillStyle = gradient; ctx.fillRect(0, 0, width, height);
  if (theme === "ocean") { ctx.fillStyle = "#b9f7ff20"; for (let i = 0; i < 4; i += 1) { ctx.beginPath(); ctx.moveTo(width * (.1 + i * .24), 0); ctx.lineTo(width * (.27 + i * .2), height * .72); ctx.lineTo(width * (.4 + i * .18), 0); ctx.closePath(); ctx.fill(); } ctx.strokeStyle = "#d3fbff99"; for (let i = 0; i < 18; i += 1) { const x = (i * 83 + elapsed * 18) % width, y = height - ((i * 47 + elapsed * 28) % (height * .78)); ctx.beginPath(); ctx.arc(x, y, 2 + i % 3 * 2, 0, Math.PI * 2); ctx.stroke(); } ctx.fillStyle = "#143c35"; ctx.fillRect(0, height * .88, width, height * .12); ctx.strokeStyle = "#35bb8a"; ctx.lineWidth = 4; for (let x = 25; x < width; x += 70) { ctx.beginPath(); ctx.moveTo(x, height * .9); ctx.quadraticCurveTo(x + 12, height * .76, x + 3, height * .68); ctx.stroke(); } }
  else if (theme === "space") { specks(ctx, "#e5f8ff", width, height, elapsed, 40, 1); ctx.fillStyle = "#915dff22"; ctx.beginPath(); ctx.arc(width * .76, height * .3, height * .24, 0, Math.PI * 2); ctx.fill(); }
  else if (theme === "lava") { ctx.fillStyle = "#ff592c55"; ctx.fillRect(0, height * .75, width, height * .25); ctx.strokeStyle = "#ffbb5266"; ctx.lineWidth = 6; for (let x = -30; x < width; x += 90) { ctx.beginPath(); ctx.moveTo(x, height * .83); ctx.quadraticCurveTo(x + 38, height * .72, x + 85, height * .9); ctx.stroke(); } specks(ctx, "#ffd061", width, height * .7, elapsed, 24, 2); }
  else if (theme === "ice") { specks(ctx, "#efffff", width, height, elapsed, 28, 2); ctx.strokeStyle = "#c8f8ff77"; ctx.lineWidth = 1; for (let x = 40; x < width; x += 120) { ctx.beginPath(); ctx.moveTo(x, height * .78); ctx.lineTo(x + 22, height * .7); ctx.lineTo(x + 44, height * .78); ctx.stroke(); } }
  else if (theme === "forest") { ctx.fillStyle = "#06150d99"; for (let x = 0; x < width; x += 55) { ctx.fillRect(x, height * .35, 18, height * .65); ctx.beginPath(); ctx.arc(x + 9, height * .3, 42, 0, Math.PI * 2); ctx.fill(); } specks(ctx, "#c4ff85", width, height, elapsed, 18, 3); }
  else if (theme === "neon") { ctx.strokeStyle = "#ff4ee466"; ctx.lineWidth = 1; for (let x = 0; x < width; x += 55) { ctx.beginPath(); ctx.moveTo(width / 2, height * .5); ctx.lineTo(x, height); ctx.stroke(); } for (let y = height * .55; y < height; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke(); } }
  else { ctx.fillStyle = "#f3ca7950"; for (let i = 0; i < 3; i += 1) { ctx.beginPath(); ctx.arc(width * (.18 + i * .38), height * 1.05, width * .32, Math.PI, Math.PI * 2); ctx.fill(); } specks(ctx, "#ffe2ad", width, height * .7, elapsed, 20, 1); }
}
