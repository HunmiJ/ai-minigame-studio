"use client";

import { demoGameStyles } from "@/data/demo-game";
import type { GameStyleId } from "@/types/game";

const initialPrompt = "生成一个太空主题的躲避游戏，玩家使用方向键移动，坚持 30 秒即可获胜。";

type PromptPanelProps = { selectedStyle: GameStyleId; onStyleChange: (style: GameStyleId) => void; onGenerate: () => void; notice: string };

export function PromptPanel({ selectedStyle, onStyleChange, onGenerate, notice }: PromptPanelProps) {
  return <section className="prompt-panel" aria-labelledby="prompt-title"><div className="panel-title"><p className="eyebrow">创建新游戏</p><h1 id="prompt-title">告诉我你的创意</h1><p>当前 Demo 只提供“星际闪避”，可切换不同的视觉风格。</p></div><label className="field-label" htmlFor="game-prompt">游戏需求</label><textarea id="game-prompt" defaultValue={initialPrompt} rows={6} aria-describedby="prompt-help" /><p id="prompt-help" className="field-help">Demo 不会调用 AI；点击生成将按所选风格重新载入星际闪避。</p><fieldset><legend className="field-label">快速模板</legend><div className="tag-row"><button type="button" className="tag selected-tag" aria-pressed="true">星际闪避</button><button type="button" className="tag tag-disabled" disabled aria-disabled="true">接金币 <span>即将支持</span></button><button type="button" className="tag tag-disabled" disabled aria-disabled="true">迷你迷宫 <span>即将支持</span></button></div><p className="field-help template-help">目前仅“星际闪避”可玩，其余玩法正在制作中。</p></fieldset><fieldset><legend className="field-label">游戏风格</legend><div className="style-options">{Object.values(demoGameStyles).map((style) => <button type="button" key={style.id} className={`style-option ${selectedStyle === style.id ? "selected" : ""}`} aria-pressed={selectedStyle === style.id} onClick={() => onStyleChange(style.id)}><span className={`style-swatch ${style.id}`} />{style.label}</button>)}</div></fieldset><button className="button button-primary generate-button" type="button" onClick={onGenerate}>✦ 使用所选风格生成</button>{notice && <p className="demo-notice" role="status">✓ {notice}</p>}<div className="demo-callout"><span aria-hidden="true">ⓘ</span><p><b>Demo 模式</b><br />AI 接口将在后续阶段接入，当前仅会重新载入预设的星际闪避游戏。</p></div></section>;
}
