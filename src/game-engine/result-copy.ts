import type { GameStatus } from "./types";

export type ResultCopy = { title: string; text: string; action: string };

export function getGameOverlayCopy(status: Exclude<GameStatus, "running">, title: string, duration: number, score: number): ResultCopy {
  if (status === "won") return { title: `${title}成功`, text: `你成功坚持了 ${duration} 秒。`, action: "再玩一次" };
  if (status === "lost") return { title: `${title}失败`, text: `本次得分 ${Math.floor(score)} 分，调整策略后再试一次。`, action: "重新开始" };
  if (status === "paused") return { title: "游戏已暂停", text: `继续挑战“${title}”。`, action: "继续游戏" };
  return { title: "准备开始", text: `躲避危险物，坚持 ${duration} 秒即可完成挑战。`, action: "开始游戏" };
}
