import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI MiniGame Studio｜一句话生成专属小游戏",
  description: "AI MiniGame Studio 是一个通过自然语言生成可玩小游戏的创作工具。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return <html lang="zh-CN"><body>{children}</body></html>;
}
