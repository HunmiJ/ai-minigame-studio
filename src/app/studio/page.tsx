"use client";

import Link from "next/link";
import { useState } from "react";
import { GamePreview } from "@/components/studio/game-preview";
import { type IdeaSource, PromptPanel } from "@/components/studio/prompt-panel";
import { createStyledDemoGame, demoGameStyles } from "@/data/demo-game";
import { getGenerationFailureMessage, type DeepSeekServiceStatus } from "@/lib/studio/generation-status";
import type { GameSpec, GameStyleId } from "@/types/game";

const starDodgePrompt = "生成一个太空主题的躲避游戏，玩家使用方向键移动，坚持 30 秒即可获胜。";

export default function StudioPage() {
  const [style, setStyle] = useState<GameStyleId>("deep-space"); const [game, setGame] = useState<GameSpec>(() => createStyledDemoGame("deep-space")); const [prompt, setPrompt] = useState(starDodgePrompt); const [source, setSource] = useState<IdeaSource>("custom"); const [resetToken, setResetToken] = useState(0); const [notice, setNotice] = useState(""); const [error, setError] = useState(""); const [isGenerating, setIsGenerating] = useState(false); const [mode, setMode] = useState<"ai" | "demo">("demo"); const [serviceStatus, setServiceStatus] = useState<DeepSeekServiceStatus>("unknown");
  const generate = async () => { const cleanedPrompt = prompt.trim(); if (cleanedPrompt.length < 10) { setError("请至少输入 10 个字符的游戏创意后再生成。"); return; } setIsGenerating(true); setError(""); setNotice(""); try { const response = await fetch("/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: cleanedPrompt, styleId: style }) }); const body = await response.json() as { game?: GameSpec; mode?: "ai"; error?: { message?: string; code?: string } }; if (!response.ok || !body.game) { const code = body.error?.code; setServiceStatus(code === "not_configured" ? "missing" : "connected"); setError(getGenerationFailureMessage(code, body.error?.message)); if (code === "not_configured") setMode("demo"); return; } setGame(body.game); setMode("ai"); setServiceStatus("connected"); setResetToken((token) => token + 1); setNotice("AI 游戏已生成，可以开始试玩。"); } catch { setServiceStatus("connected"); setError("DeepSeek 已连接，但本次生成失败；当前 Demo 已保留。请检查网络后重新尝试。"); } finally { setIsGenerating(false); } };
  const changeStyle = (nextStyle: GameStyleId) => { setStyle(nextStyle); if (mode === "demo") { setGame(createStyledDemoGame(nextStyle)); setResetToken((token) => token + 1); setNotice(`Demo 游戏已切换为“${demoGameStyles[nextStyle].label}”风格。`); } };
  const selectTemplate = () => { setPrompt(starDodgePrompt); setSource("star-dodge"); setError(""); setNotice("已填充“星际闪避”起始创意，可继续编辑后再生成。"); };
  const editPrompt = (value: string) => { setPrompt(value); setSource("custom"); };
  return <main className="studio-shell" style={{ "--studio-accent": game.theme.accentColor } as React.CSSProperties}><div className="studio-topbar"><Link href="/" className="back-link">← 返回首页</Link><span className="studio-brand"><i>✦</i> AI MiniGame Studio</span><span className="save-state">● 草稿已保存</span></div><div className="studio-layout"><PromptPanel prompt={prompt} source={source} selectedStyle={style} onPromptChange={editPrompt} onTemplateSelect={selectTemplate} onStyleChange={changeStyle} onGenerate={generate} notice={notice} error={error} isGenerating={isGenerating} mode={mode} serviceStatus={serviceStatus} /><GamePreview game={game} resetToken={resetToken} /></div></main>;
}
