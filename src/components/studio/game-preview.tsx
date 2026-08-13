"use client";

import { useState } from "react";
import { GameCanvas } from "@/components/studio/game-canvas";
import type { GameState } from "@/game-engine/types";
import type { GameSpec } from "@/types/game";

export function GamePreview({ game, resetToken }: { game: GameSpec; resetToken: number }) {
  const [, setSnapshot] = useState<GameState | null>(null); const [restartToken, setRestartToken] = useState(0);
  const restart = () => { setSnapshot(null); setRestartToken((token) => token + 1); };
  const fullscreen = async () => { const element = document.querySelector<HTMLElement>(".canvas-shell"); if (!element) return; try { if (document.fullscreenElement) await document.exitFullscreen(); else await element.requestFullscreen(); } catch { /* Fullscreen can be denied by the browser; the game remains usable. */ } };
  return <section className="game-preview" aria-labelledby="game-title"><div className="preview-heading"><div><p className="eyebrow">实时预览</p><div className="title-with-tag"><h1 id="game-title">{game.title}</h1><span className="status-tag"><i /> Demo Preview</span></div><p>{game.description}</p></div><div className="preview-actions"><button type="button" aria-label="重新开始游戏" onClick={restart}>↻</button><button type="button" aria-label="全屏预览" onClick={fullscreen}>⛶</button></div></div><GameCanvas key={resetToken + restartToken} config={game} onStateChange={setSnapshot} /><p className="control-guide">操作方式：{game.controls.description}。点击游戏画面即可激活键盘控制，空格键可暂停或继续。</p><div className="rules-summary"><div><span className="rules-icon">✦</span><div><p className="eyebrow">游戏规则</p><h2>如何赢得这场穿越</h2></div></div><ol>{game.rules.summary.map((rule) => <li key={rule}>{rule}</li>)}</ol></div></section>;
}
