import Link from "next/link";
import { GamePreview } from "@/components/studio/game-preview";
import { PromptPanel } from "@/components/studio/prompt-panel";
import { demoGame } from "@/data/demo-game";

export default function StudioPage() {
  return <main className="studio-shell"><div className="studio-topbar"><Link href="/" className="back-link">← 返回首页</Link><span className="studio-brand"><i>✦</i> AI MiniGame Studio</span><span className="save-state">● 草稿已保存</span></div><div className="studio-layout"><PromptPanel /><GamePreview game={demoGame} /></div></main>;
}
