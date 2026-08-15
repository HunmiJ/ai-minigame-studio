"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  create2048State,
  update2048,
  type Direction2048,
  type Game2048State,
} from "@/game-engine/game-2048";
import { getThemeProfile, type ThemeProfile } from "@/game-engine/visual-theme";
import type { Game2048Spec } from "@/schemas/game-spec";
import { get2048Cells } from "./game-2048-layout";

const directions: Record<string, Direction2048 | undefined> = {
  ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down",
  ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
};

function tileColor(value: number, theme: ThemeProfile) {
  if (value === 0) return theme.panel;
  return theme.tiles[Math.min(theme.tiles.length - 1, Math.max(0, Math.log2(value) - 1))];
}

export function Game2048Preview({ config }: { config: Game2048Spec }) {
  const [state, setState] = useState<Game2048State>(() => create2048State(config));
  const gestureStart = useRef<{ x: number; y: number } | null>(null);
  const visual = getThemeProfile(config.visualTheme);

  const reset = (running = false) => {
    const next = create2048State(config);
    next.status = running ? "running" : "ready";
    setState(next);
  };
  const move = (direction: Direction2048) => setState((current) => update2048(current, config, direction));

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const direction = directions[event.code];
      if (event.code === "Space") {
        if (state.status === "running" || state.status === "paused") event.preventDefault();
        setState((current) => current.status === "running" ? { ...current, status: "paused" } : current.status === "paused" ? { ...current, status: "running" } : current);
      } else if (direction && state.status === "running") {
        event.preventDefault();
        setState((current) => update2048(current, config, direction));
      }
    };
    const onVisibilityChange = () => setState((current) => document.hidden && current.status === "running" ? { ...current, status: "paused" } : current);
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [config, state.status]);

  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!gestureStart.current) return;
    const dx = event.clientX - gestureStart.current.x;
    const dy = event.clientY - gestureStart.current.y;
    gestureStart.current = null;
    if (state.status !== "running" || Math.max(Math.abs(dx), Math.abs(dy)) < 22) return;
    move(Math.abs(dx) > Math.abs(dy) ? dx > 0 ? "right" : "left" : dy > 0 ? "down" : "up");
  };

  const overlayTitle = state.status === "won" ? `${config.title}成功` : state.status === "lost" ? `${config.title}失败` : state.status === "paused" ? "游戏已暂停" : "开始游戏";
  const boardStyle = { background: `linear-gradient(145deg, ${visual.panel}, ${visual.floor})`, borderColor: visual.border };

  return <>
    <div
      className="canvas-shell game-2048-shell"
      tabIndex={0}
      aria-label={`${config.title}数字方块棋盘`}
      onPointerDown={(event) => { gestureStart.current = { x: event.clientX, y: event.clientY }; }}
      onPointerUp={onPointerUp}
      style={{ background: `linear-gradient(160deg, ${visual.background[0]}, ${visual.floor})`, borderColor: visual.border }}
    >
      <div className="canvas-hud" style={{ borderColor: visual.grid }}>
        <div><span>得分</span><b style={{ color: visual.hud }}>{state.score}</b></div>
        <div><span>目标</span><b style={{ color: visual.hud }}>{config.game2048.targetTile}</b></div>
        <div><span>状态</span><b style={{ color: visual.hud }}>{state.status === "running" ? "进行中" : state.status === "paused" ? "已暂停" : "准备"}</b></div>
      </div>
      <div className="game-2048-grid" style={boardStyle}>
        {get2048Cells(state.board).map(({ x, y, value }) => <div
          key={`${x}-${y}`}
          className="game-2048-tile"
          style={{
            background: tileColor(value, visual),
            color: value >= 128 ? "#fff" : visual.player,
            borderColor: visual.border,
            boxShadow: state.flashFor > 0 && value > 0 ? `0 0 22px ${visual.glow}, inset 0 1px 0 #ffffff66` : "inset 0 1px 0 #ffffff33",
          }}
        >{value || ""}</div>)}
      </div>
      {state.status === "running" && <button className="canvas-pause" type="button" onClick={() => setState((current) => ({ ...current, status: "paused" }))}>Ⅱ 暂停</button>}
      {state.status !== "running" && <div className="game-overlay">
        <h2>{overlayTitle}</h2>
        <p>{state.status === "lost" ? "棋盘已无法合并，重新挑战吧。" : state.status === "won" ? `你成功合成了 ${config.game2048.targetTile}。` : "方向键 / WASD / 触屏滑动均可操作。"}</p>
        <button type="button" className="button button-primary" onClick={() => state.status === "paused" ? setState((current) => ({ ...current, status: "running" })) : reset(true)}>{state.status === "paused" ? "继续游戏" : state.status === "ready" ? "开始游戏" : "重新开始"}</button>
      </div>}
    </div>
    <div className="touch-controls" aria-label="2048 触屏方向控制">
      <button aria-label="向上滑动" onClick={() => move("up")}>↑</button>
      <div><button aria-label="向左滑动" onClick={() => move("left")}>←</button><button aria-label="向下滑动" onClick={() => move("down")}>↓</button><button aria-label="向右滑动" onClick={() => move("right")}>→</button></div>
    </div>
  </>;
}
