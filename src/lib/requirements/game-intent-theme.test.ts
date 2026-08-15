import { describe, expect, it } from "vitest";
import { extractGameIntent } from "./game-intent";

describe("explicit visual-theme intent", () => {
  it("maps forest snake and ice 2048 requests to their exact engines and themes", () => {
    expect(extractGameIntent("森林主题的贪吃蛇")).toMatchObject({ genre: "snake", visualTheme: "forest" });
    expect(extractGameIntent("冰雪主题的经典 2048")).toMatchObject({ genre: "2048", visualTheme: "ice" });
  });

  it("recognizes the extended controlled Chinese theme keywords", () => {
    expect(extractGameIntent("雪地迷宫").visualTheme).toBe("ice");
    expect(extractGameIntent("珊瑚珍珠收集").visualTheme).toBe("ocean");
    expect(extractGameIntent("火焰躲避").visualTheme).toBe("lava");
    expect(extractGameIntent("未来都市数字方块").visualTheme).toBe("neon");
    expect(extractGameIntent("绿洲探索").visualTheme).toBe("desert");
  });
});
