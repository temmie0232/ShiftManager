import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShiftManager",
  description: "シフト管理アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="jp">
      <body className="antialiased">{children}</body>
    </html>
  );
}
