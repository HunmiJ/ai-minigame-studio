import Link from "next/link";

type TemplateCardProps = { eyebrow: string; title: string; description: string; accent: "violet" | "cyan" | "pink"; icon: string };
export function TemplateCard({ eyebrow, title, description, accent, icon }: TemplateCardProps) {
  return <article className={`template-card ${accent}`}><div className="template-visual"><span className="template-symbol">{icon}</span><span className="visual-orb orb-one" /><span className="visual-orb orb-two" /><span className="visual-line" /></div><div className="template-content"><p>{eyebrow}</p><h3>{title}</h3><span>{description}</span><Link href="/studio" aria-label={`使用${title}模板`}>使用此模板 <b aria-hidden="true">→</b></Link></div></article>;
}
