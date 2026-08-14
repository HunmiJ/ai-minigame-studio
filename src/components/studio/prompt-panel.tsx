"use client";

import { demoGameStyles } from "@/data/demo-game";
import type { GenerationFeedback } from "@/lib/studio/generation-feedback";
import type { DeepSeekServiceStatus } from "@/lib/studio/generation-status";
import type { GameSpec, GameStyleId, VisualTheme } from "@/types/game";

export type IdeaSource = "custom" | GameSpec["genre"];
type Props = { prompt: string; source: IdeaSource; genre: GameSpec["genre"]; visualTheme: VisualTheme; selectedStyle: GameStyleId; onPromptChange: (value: string) => void; onTemplateSelect: (genre: GameSpec["genre"]) => void; onStyleChange: (style: GameStyleId) => void; onGenerate: () => void; feedback: GenerationFeedback; activityNotice: string; mode: "ai" | "demo"; serviceStatus: DeepSeekServiceStatus };
const labels = { dodge: "躲避类", collect: "接金币类", maze: "迷宫类", snake: "贪吃蛇" };
export const visualThemeLabels: Record<VisualTheme, string> = { space: "太空", ocean: "海洋", lava: "熔岩", ice: "冰雪", forest: "森林", neon: "霓虹", desert: "沙漠" };
const templates: [GameSpec["genre"], string][] = [["dodge", "星际闪避"], ["collect", "接金币"], ["maze", "迷你迷宫"], ["snake", "贪吃蛇"]];

export function PromptPanel(props: Props) {
  const isGenerating = props.feedback.status === "loading";
  const message = props.feedback.status === "idle" ? props.activityNotice : props.feedback.message;
  return <section className="prompt-panel">
    <div className="panel-title"><p className="eyebrow">创建新游戏</p><h1>告诉我你的创意</h1><p>AI 只生成安全、受控的游戏配置。</p></div>
    <div className="engine-source"><span>当前引擎：{labels[props.genre]}</span><span>视觉主题：{visualThemeLabels[props.visualTheme]}</span><b className={props.source === "custom" ? "custom-source" : "template-source"}>{props.source === "custom" ? "自定义 AI 创意" : `起始模板：${labels[props.source]}`}</b></div>
    <label className="field-label" htmlFor="game-prompt">游戏需求</label><textarea id="game-prompt" value={props.prompt} onChange={(event) => props.onPromptChange(event.target.value)} disabled={isGenerating} rows={6} />
    <p className="field-help">可描述玩法和视觉主题；主题会由安全枚举映射到 Canvas。</p>
    <fieldset><legend className="field-label">起始模板</legend><div className="tag-row">{templates.map(([genre, label]) => <button key={genre} type="button" className={`tag ${props.source === genre ? "selected-tag" : ""}`} onClick={() => props.onTemplateSelect(genre)}>{label}</button>)}</div></fieldset>
    <fieldset disabled={isGenerating}><legend className="field-label">游戏风格</legend><div className="style-options">{Object.values(demoGameStyles).map((style) => <button type="button" key={style.id} className={`style-option ${props.selectedStyle === style.id ? "selected" : ""}`} onClick={() => props.onStyleChange(style.id)}><span className={`style-swatch ${style.id}`} />{style.label}</button>)}</div></fieldset>
    <button className="button button-primary generate-button" type="button" onClick={props.onGenerate} disabled={isGenerating}>{isGenerating ? "AI 正在构建游戏规则…" : "使用 AI 生成小游戏"}</button>
    {message && <p className={props.feedback.status === "success" || props.feedback.status === "idle" ? "demo-notice" : "generation-error"}>✦ {message}</p>}
    <div className="demo-callout"><p><b>{props.mode === "ai" ? "AI 模式" : "Demo 回退模式"}</b><br />{props.serviceStatus === "missing" ? "尚未配置 DeepSeek AI 服务，仍可试玩本地 Demo。" : "所有主题均由受控 Canvas 绘制。"}</p></div>
  </section>;
}
