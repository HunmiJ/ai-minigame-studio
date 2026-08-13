"use client";

import { useState } from "react";

const templates = ["星际闪避", "接金币", "迷你迷宫"];
const initialPrompt = "生成一个太空主题的躲避游戏，玩家使用方向键移动，坚持 30 秒即可获胜。";

export function PromptPanel() {
  const [prompt, setPrompt] = useState(initialPrompt);
  const [generated, setGenerated] = useState(false);
  return <section className="prompt-panel" aria-labelledby="prompt-title"><div className="panel-title"><p className="eyebrow">创建新游戏</p><h1 id="prompt-title">告诉我你的创意</h1><p>描述你想玩的小游戏，剩下的交给 AI。</p></div><label className="field-label" htmlFor="game-prompt">游戏需求</label><textarea id="game-prompt" value={prompt} onChange={(event) => setPrompt(event.target.value)} rows={6} aria-describedby="prompt-help" /><p id="prompt-help" className="field-help">试着包含游戏主题、玩法、操作方式或胜利条件。</p><fieldset><legend className="field-label">快速模板</legend><div className="tag-row">{templates.map((template) => <button type="button" className="tag" key={template} onClick={() => setPrompt(`生成一个${template}小游戏，设计简洁清晰的目标和操作方式。`)}>{template}</button>)}</div></fieldset><fieldset><legend className="field-label">游戏风格</legend><div className="style-options"><button type="button" className="style-option selected"><span className="style-swatch cosmic" />深空霓虹</button><button type="button" className="style-option"><span className="style-swatch arcade" />复古街机</button><button type="button" className="style-option"><span className="style-swatch fresh" />清新像素</button></div></fieldset><button className="button button-primary generate-button" type="button" onClick={() => setGenerated(true)}>{generated ? "已生成 Demo 预览" : "✦ 生成小游戏"}</button><div className="demo-callout"><span aria-hidden="true">ⓘ</span><p><b>Demo 模式</b><br />AI 接口将在后续阶段接入，当前展示的是预设的游戏原型。</p></div></section>;
}
