"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { GamePreview } from "@/components/studio/game-preview";
import { type IdeaSource, PromptPanel } from "@/components/studio/prompt-panel";
import { RequirementMatchPanel } from "@/components/studio/requirement-match-panel";
import { createStyledDemoGame, demoGameStyles } from "@/data/demo-game";
import { evaluateRequirementMatch, extractGameIntent, hasUnsupportedIntent, type RequirementMatch } from "@/lib/requirements/game-intent";
import { createExportFilename, createSavedGame, exportSavedGameJson, findSavedGame, saveGame, type SavedGameDraft } from "@/lib/storage/saved-games";
import { errorGenerationFeedback, idleGenerationFeedback, loadingGenerationFeedback, successGenerationFeedback, unsupportedGenerationFeedback, type GenerationFeedback } from "@/lib/studio/generation-feedback";
import { getGenerationFailureMessage, type DeepSeekServiceStatus } from "@/lib/studio/generation-status";
import type { GameSpec, GameStyleId } from "@/types/game";
import type { SavedGameSource } from "@/types/saved-game";

const prompts = { dodge: "生成一个太空主题的躲避游戏，玩家使用方向键移动，坚持 30 秒即可获胜。", collect: "生成一个接金币小游戏，玩家左右移动接住金币并避开危险物。", maze: "生成一个可探索的迷你迷宫，玩家找到出口即可获胜。" } as const;
const emptyMatch = (): RequirementMatch => ({ met: [], adapted: [], unsupported: [], primarySatisfied: false });

export default function StudioPage() {
  const [style, setStyle] = useState<GameStyleId>("deep-space");
  const [game, setGame] = useState<GameSpec>(() => createStyledDemoGame("deep-space"));
  const [prompt, setPrompt] = useState<string>(prompts.dodge);
  const [source, setSource] = useState<IdeaSource>("custom");
  const [resetToken, setResetToken] = useState(0);
  const [activityNotice, setActivityNotice] = useState("");
  const [feedback, setFeedback] = useState<GenerationFeedback>(() => idleGenerationFeedback());
  const [mode, setMode] = useState<"ai" | "demo">("demo");
  const [previewSource, setPreviewSource] = useState<SavedGameSource>("demo");
  const [serviceStatus, setServiceStatus] = useState<DeepSeekServiceStatus>("unknown");
  const [projectId, setProjectId] = useState<string>();
  const [saveStatus, setSaveStatus] = useState<"unsaved" | "saving" | "saved" | "failed">("unsaved");
  const [requirementMatch, setRequirementMatch] = useState<RequirementMatch>(() => evaluateRequirementMatch(extractGameIntent(prompts.dodge), createStyledDemoGame("deep-space")));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const id = new URLSearchParams(window.location.search).get("project");
      if (!id) return;
      const saved = findSavedGame(window.localStorage, id);
      if (!saved) { setActivityNotice("未找到该作品，已保留当前 Demo。"); return; }
      setGame(saved.gameSpec); setPrompt(saved.sourcePrompt); setStyle(saved.styleId);
      setMode(saved.source === "ai" ? "ai" : "demo"); setSource(saved.source === "template" ? saved.gameSpec.genre : "custom"); setPreviewSource(saved.source);
      setProjectId(saved.id); setSaveStatus("saved"); setResetToken((token) => token + 1); setActivityNotice("已打开本地作品，可继续试玩或修改。");
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const markUnsaved = () => setSaveStatus("unsaved");
  const currentSource = (): SavedGameSource => mode === "ai" ? "ai" : source !== "custom" ? "template" : "demo";
  const buildDraft = (): SavedGameDraft => ({ gameSpec: game, sourcePrompt: prompt.trim(), styleId: style, source: currentSource() });
  const clearGenerationMessages = () => { setFeedback(idleGenerationFeedback()); setActivityNotice(""); };

  const generate = async () => {
    clearGenerationMessages();
    const cleanedPrompt = prompt.trim();
    if (cleanedPrompt.length < 10) { setFeedback(errorGenerationFeedback("请至少输入 10 个字符的游戏创意后再生成。")); return; }
    const intent = extractGameIntent(cleanedPrompt);
    if (hasUnsupportedIntent(intent)) { setRequirementMatch({ ...emptyMatch(), unsupported: intent.unsupportedFeatures }); setFeedback(unsupportedGenerationFeedback()); return; }
    setFeedback(loadingGenerationFeedback());
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ prompt: cleanedPrompt, styleId: style }) });
      const body = await response.json() as { game?: GameSpec; error?: { message?: string; code?: string } };
      if (!response.ok || !body.game) { const code = body.error?.code; setServiceStatus(code === "not_configured" ? "missing" : "connected"); setFeedback(errorGenerationFeedback(getGenerationFailureMessage(code, body.error?.message))); return; }
      const match = evaluateRequirementMatch(intent, body.game); setRequirementMatch(match);
      if (!match.primarySatisfied) { setServiceStatus("connected"); setFeedback(errorGenerationFeedback("DeepSeek 已连接，但本次生成未满足主要需求；当前游戏已保留。")); return; }
      setGame(body.game); setMode("ai"); setPreviewSource("ai"); setProjectId(undefined); markUnsaved(); setServiceStatus("connected"); setResetToken((token) => token + 1); setFeedback(successGenerationFeedback());
    } catch { setServiceStatus("connected"); setFeedback(errorGenerationFeedback("DeepSeek 已连接，但本次生成失败；当前 Demo 已保留。请检查网络后重新尝试。")); }
  };
  const changeStyle = (nextStyle: GameStyleId) => { clearGenerationMessages(); setStyle(nextStyle); markUnsaved(); if (mode === "demo") { setGame(createStyledDemoGame(nextStyle, game.genre)); setResetToken((token) => token + 1); setActivityNotice(`Demo 游戏已切换为“${demoGameStyles[nextStyle].label}”风格。`); } };
  const selectTemplate = (genre: GameSpec["genre"]) => { clearGenerationMessages(); const nextGame = createStyledDemoGame(style, genre), nextPrompt = prompts[genre]; setPrompt(nextPrompt); setSource(genre); setGame(nextGame); setRequirementMatch(evaluateRequirementMatch(extractGameIntent(nextPrompt), nextGame)); setMode("demo"); setPreviewSource("template"); setProjectId(undefined); markUnsaved(); setResetToken((token) => token + 1); setActivityNotice(`已载入${genre === "dodge" ? "星际闪避" : genre === "collect" ? "接金币" : "迷你迷宫"} Demo。`); };
  const editPrompt = (value: string) => { setPrompt(value); setSource("custom"); setRequirementMatch(emptyMatch()); clearGenerationMessages(); markUnsaved(); };
  const saveProject = () => { setSaveStatus("saving"); try { const saved = saveGame(window.localStorage, buildDraft(), projectId); setProjectId(saved.id); setSaveStatus("saved"); clearGenerationMessages(); setActivityNotice("作品已保存到当前浏览器的作品库。"); } catch { setSaveStatus("failed"); clearGenerationMessages(); setFeedback(errorGenerationFeedback("本地作品保存失败，请检查浏览器存储空间后重试。")); } };
  const exportProject = () => { try { const saved = createSavedGame(buildDraft()), blob = new Blob([exportSavedGameJson(saved)], { type: "application/json" }), url = URL.createObjectURL(blob), link = document.createElement("a"); link.href = url; link.download = createExportFilename(game.title); link.click(); URL.revokeObjectURL(url); clearGenerationMessages(); setActivityNotice("JSON 作品文件已导出。"); } catch { clearGenerationMessages(); setFeedback(errorGenerationFeedback("作品导出失败，请稍后重试。")); } };
  const saveText = saveStatus === "saving" ? "正在保存" : saveStatus === "saved" ? "已保存到作品库" : saveStatus === "failed" ? "保存失败" : "未保存";

  return <main className="studio-shell" style={{ "--studio-accent": game.theme.accentColor } as React.CSSProperties}><div className="studio-topbar"><Link href="/" className="back-link">← 返回首页</Link><span className="studio-brand"><i>✦</i> AI MiniGame Studio</span><div className="studio-top-actions"><Link href="/gallery" className="back-link">作品库</Link><button type="button" className="studio-action" onClick={exportProject}>导出 JSON</button><button type="button" className="studio-action primary" onClick={saveProject} disabled={saveStatus === "saving"}>{saveStatus === "saving" ? "保存中…" : "保存作品"}</button><span className={`save-state ${saveStatus}`}>● {saveText}</span></div></div><div className="studio-layout"><div><PromptPanel prompt={prompt} source={source} genre={game.genre} visualTheme={game.visualTheme} selectedStyle={style} onPromptChange={editPrompt} onTemplateSelect={selectTemplate} onStyleChange={changeStyle} onGenerate={generate} feedback={feedback} activityNotice={activityNotice} mode={mode} serviceStatus={serviceStatus} /><RequirementMatchPanel match={requirementMatch} /></div><GamePreview game={game} resetToken={resetToken} source={previewSource} /></div></main>;
}
