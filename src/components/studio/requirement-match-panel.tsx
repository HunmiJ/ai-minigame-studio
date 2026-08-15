import { getThemeProfile } from "@/game-engine/visual-theme";
import type { RequirementMatch } from "@/lib/requirements/game-intent";

export function RequirementMatchPanel({ match }: { match: RequirementMatch }) {
  const theme = getThemeProfile(match.theme);
  return <section className="requirement-match" aria-live="polite">
    <p className="eyebrow">需求匹配度</p>
    <h2>{match.primarySatisfied ? "主要需求已满足" : "生成前会先核验主要需求"}</h2>
    <p className="theme-elements"><b>视觉主题：</b>{theme.name} · {theme.elements.join("、")}</p>
    {match.met.length > 0 && <p><b>已满足：</b>{match.met.join("、")}</p>}
    {match.adapted.length > 0 && <p><b>安全适配：</b>{match.adapted.join("、")}</p>}
    {match.unsupported.length > 0 && <p className="generation-error"><b>暂不支持：</b>{match.unsupported.join("、")}</p>}
    {!match.met.length && !match.adapted.length && !match.unsupported.length && <p>输入创意后会显示玩法、主题与关键数字的匹配结果。</p>}
  </section>;
}
