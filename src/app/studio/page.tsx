"use client";

import Link from "next/link";
import { useState } from "react";
import { GamePreview } from "@/components/studio/game-preview";
import { PromptPanel } from "@/components/studio/prompt-panel";
import { createStyledDemoGame, demoGameStyles } from "@/data/demo-game";
import type { GameStyleId } from "@/types/game";

export default function StudioPage() {
  const [style, setStyle] = useState<GameStyleId>("deep-space"); const [resetToken, setResetToken] = useState(0); const [notice, setNotice] = useState(""); const game = createStyledDemoGame(style);
  const regenerate = () => { setResetToken((token) => token + 1); setNotice(`Demo 游戏已使用“${demoGameStyles[style].label}”风格重新生成。`); };
  return <main className="studio-shell" style={{ "--studio-accent": game.theme.accentColor } as React.CSSProperties}><div className="studio-topbar"><Link href="/" className="back-link">← 返回首页</Link><span className="studio-brand"><i>✦</i> AI MiniGame Studio</span><span className="save-state">● 草稿已保存</span></div><div className="studio-layout"><PromptPanel selectedStyle={style} onStyleChange={setStyle} onGenerate={regenerate} notice={notice} /><GamePreview game={game} resetToken={resetToken} /></div></main>;
}
