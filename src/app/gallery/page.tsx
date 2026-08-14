"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { SiteHeader } from "@/components/layout/site-header";
import { MAX_IMPORT_SIZE_BYTES, createExportFilename, deleteSavedGame, ensureImportSize, exportSavedGameJson, importSavedGameJson, readSavedGames, saveImportedGame } from "@/lib/storage/saved-games";
import type { SavedGame } from "@/types/saved-game";

const sourceLabels: Record<SavedGame["source"], string> = { demo: "Demo", template: "起始模板", ai: "AI 生成" };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function downloadGame(game: SavedGame) {
  const blob = new Blob([exportSavedGameJson(game)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url; link.download = createExportFilename(game.gameSpec.title); link.click(); URL.revokeObjectURL(url);
}

export default function GalleryPage() {
  const [games, setGames] = useState<SavedGame[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const refresh = () => setGames(readSavedGames(window.localStorage));
  useEffect(() => { const timer = window.setTimeout(refresh, 0); return () => window.clearTimeout(timer); }, []);
  const remove = (game: SavedGame) => { if (!window.confirm(`确定删除“${game.gameSpec.title}”吗？此操作无法恢复。`)) return; try { deleteSavedGame(window.localStorage, game.id); refresh(); setMessage("作品已删除。"); } catch { setError("删除失败，请检查浏览器本地存储后重试。"); } };
  const handleImport = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; event.target.value = "";
    if (!file) return;
    setMessage(""); setError("");
    if (!file.name.toLowerCase().endsWith(".json")) { setError("只支持导入 .json 文件。"); return; }
    try {
      ensureImportSize(file.size);
      const imported = importSavedGameJson(await file.text());
      saveImportedGame(window.localStorage, imported); refresh(); setMessage("作品导入成功，已创建新的本地副本。");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "导入失败，请检查作品文件。"); }
  };
  return <main className="gallery-page"><SiteHeader page="gallery" /><section className="gallery-wrap"><div className="gallery-heading"><div><p className="eyebrow">本地作品库</p><h1>你的小游戏作品</h1><p>共 {games.length} 个作品，按最近更新时间排列。</p></div><div className="gallery-actions"><input ref={inputRef} type="file" accept="application/json,.json" onChange={handleImport} hidden /><button type="button" className="button button-secondary" onClick={() => inputRef.current?.click()}>导入 JSON</button><Link href="/studio" className="button button-primary">去创建游戏 <span aria-hidden="true">→</span></Link></div></div>{message && <p className="gallery-message" role="status">✦ {message}</p>}{error && <p className="generation-error gallery-error" role="alert">{error}</p>}{games.length === 0 ? <div className="gallery-empty"><span aria-hidden="true">✦</span><h2>作品库还是空的</h2><p>在工作台生成或调整一个小游戏后，保存它即可在这里继续试玩、导出或管理。</p><Link href="/studio" className="button button-primary">去创建游戏</Link></div> : <div className="gallery-grid">{games.map((game) => <article className="gallery-card" key={game.id}><div className="gallery-card-top" style={{ "--card-accent": game.gameSpec.theme.accentColor, "--card-background": game.gameSpec.theme.background } as React.CSSProperties}><span className="source-badge">{sourceLabels[game.source]}</span><span className="card-star" aria-hidden="true">✦</span></div><div className="gallery-card-body"><h2>{game.gameSpec.title}</h2><p>{game.gameSpec.description}</p><dl><div><dt>时长</dt><dd>{game.gameSpec.world.duration} 秒</dd></div><div><dt>生命</dt><dd>{game.gameSpec.player.lives} 点</dd></div><div><dt>风格</dt><dd>{game.gameSpec.theme.primary}</dd></div></dl><time dateTime={game.updatedAt}>更新于 {formatDate(game.updatedAt)}</time><div className="gallery-card-actions"><Link className="button button-primary" href={`/studio?project=${encodeURIComponent(game.id)}`}>打开试玩</Link><button type="button" className="gallery-icon-button" aria-label={`导出 ${game.gameSpec.title}`} onClick={() => downloadGame(game)}>⇩</button><button type="button" className="gallery-icon-button danger" aria-label={`删除 ${game.gameSpec.title}`} onClick={() => remove(game)}>⌫</button></div></div></article>)}</div>}<p className="gallery-privacy">作品仅保存在当前浏览器中。清除浏览器数据后，本地作品会被删除。</p><p className="gallery-limit">单个导入文件最大 {MAX_IMPORT_SIZE_BYTES / 1024} KB。</p></section></main>;
}
