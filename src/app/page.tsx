import Link from "next/link";
import { HeroPreview } from "@/components/home/hero-preview";
import { TemplateCard } from "@/components/home/template-card";
import { SiteHeader } from "@/components/layout/site-header";

const templates = [
  {
    eyebrow: "动作 · 生存",
    title: "星际闪避",
    description: "在不断逼近的陨石带中穿梭，坚持到倒计时结束。",
    accent: "violet" as const,
    icon: "✦",
  },
  {
    eyebrow: "街机 · 收集",
    title: "霓虹接金币",
    description: "跟随节奏移动接收光币，连击越高，分数越耀眼。",
    accent: "cyan" as const,
    icon: "◎",
  },
  {
    eyebrow: "益智 · 探索",
    title: "迷你迷宫",
    description: "在有限视野中寻找出口，避开巡逻的机械守卫。",
    accent: "pink" as const,
    icon: "◇",
  },
];

export default function Home() {
  return (
    <main className="site-shell">
      <SiteHeader />

      <section className="hero section-wrap" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow"><span className="pulse-dot" /> 自然语言游戏创作工具</p>
          <h1 id="hero-title">一句话，生成你的<br /><span>专属小游戏</span></h1>
          <p className="hero-description">把脑海里的玩法说出来。AI MiniGame Studio 会将创意整理为清晰规则，并在安全的预览环境中呈现可试玩的小游戏。</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/studio">立即开始 <span aria-hidden="true">→</span></Link>
            <a className="button button-secondary" href="#templates">查看示例 <span aria-hidden="true">↓</span></a>
          </div>
          <div className="hero-note"><span aria-hidden="true">✦</span> 无需编程经验，从一个想法开始</div>
        </div>
        <HeroPreview />
      </section>

      <section className="workflow section-wrap" aria-labelledby="workflow-title">
        <div className="section-intro">
          <p className="eyebrow">创作流程</p>
          <h2 id="workflow-title">想法落地，只需三步</h2>
          <p>从模糊灵感到可试玩原型，让创作过程保持轻盈、直观。</p>
        </div>
        <div className="steps-grid">
          {[
            ["01", "描述创意", "用自然语言说出主题、玩法和胜利条件。"],
            ["02", "AI 生成规则", "将想法解析为结构化、可调整的游戏规格。"],
            ["03", "立即试玩", "在浏览器中预览、迭代并分享你的小游戏。"],
          ].map(([number, title, text]) => (
            <article className="step-card" key={number}>
              <span className="step-number">{number}</span>
              <div className="step-icon" aria-hidden="true">{number === "01" ? "⌁" : number === "02" ? "✦" : "▷"}</div>
              <h3>{title}</h3><p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="templates" className="templates section-wrap" aria-labelledby="templates-title">
        <div className="section-heading">
          <div><p className="eyebrow">灵感模板</p><h2 id="templates-title">从一个好点子开始</h2></div>
          <Link href="/studio" className="text-link">探索全部模板 <span aria-hidden="true">→</span></Link>
        </div>
        <div className="template-grid">{templates.map((template) => <TemplateCard key={template.title} {...template} />)}</div>
      </section>

      <section className="capabilities section-wrap" aria-labelledby="capabilities-title">
        <div className="capability-lead"><p className="eyebrow">为创作而设计</p><h2 id="capabilities-title">让灵感成为<br />可玩的体验</h2></div>
        <div className="capability-list">
          <article><div className="capability-icon">✦</div><div><h3>结构化生成</h3><p>把自然语言转为清晰的游戏世界、角色、规则与操作方案。</p></div></article>
          <article><div className="capability-icon">⌘</div><div><h3>安全运行</h3><p>以受控的游戏规格驱动预览，让实验和展示始终安心可靠。</p></div></article>
          <article><div className="capability-icon">◉</div><div><h3>即时预览</h3><p>创意成形的每一步都看得见，快速感受玩法与节奏。</p></div></article>
        </div>
      </section>

      <footer className="site-footer section-wrap"><Link className="brand" href="/"><span className="brand-mark" aria-hidden="true">✦</span><span>AI MiniGame <b>Studio</b></span></Link><p>让每个想法，都有机会被玩到。</p><span>© 2026 AI MiniGame Studio</span></footer>
    </main>
  );
}
