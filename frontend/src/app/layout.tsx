import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "シフト管理",
  description: "シフト管理アプリ",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="jp">
      <body className="antialiased min-h-screen">
        {children}
        <footer className="fixed bottom-4 left-0 right-0 px-8 pointer-events-none">
          <div className="max-w-4xl mx-auto flex justify-center items-center text-sm text-gray-500 relative">
            <div>© 2024 Yuta Yaginuma</div>
            <a
              href="mailto:temmie0232@gmail.com?subject=シフト管理アプリの問題報告"
              className="absolute right-0 hover:text-gray-700 transition-colors pointer-events-auto"
            >
              問題を報告
            </a>
          </div>
        </footer>
        <Toaster />
      </body>
    </html>
  );
}