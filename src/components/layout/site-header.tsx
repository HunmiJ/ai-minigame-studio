import Link from "next/link";

export function SiteHeader({ studio = false }: { studio?: boolean }) {
  return <header className="site-header section-wrap"><Link href="/" className="brand" aria-label="AI MiniGame Studio 首页"><span className="brand-mark" aria-hidden="true">✦</span><span>AI MiniGame <b>Studio</b></span></Link><nav aria-label="主导航"><Link href="/" className={!studio ? "active" : ""}>首页</Link><Link href="/studio" className={studio ? "active" : ""}>工作台</Link><Link href="/#templates">模板</Link></nav><Link className="button button-primary header-cta" href="/studio">开始创作 <span aria-hidden="true">→</span></Link></header>;
}
