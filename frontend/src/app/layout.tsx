import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Github } from "lucide-react";

export const metadata: Metadata = {
  title: "シフト管理",
  description: "シフト管理webアプリケーション",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="jp">
      <body className="antialiased min-h-screen flex flex-col">
        <main className="flex-grow">
          {children}
        </main>
        <footer className="py-2 px-8 bg-[#F5F6F8]">
          <div className="max-w-4xl mx-auto flex justify-between items-center text-sm text-gray-500">
            <a
              href="https://github.com/temmie0232/ShiftManager"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 transition-colors"
            >
              <Github size={20} />
            </a>
            <div>© 2024 Yuta Yaginuma</div>
            <a
              href="mailto:temmie0232@gmail.com?subject=シフト管理アプリの問題報告"
              className="hover:text-gray-700 transition-colors"
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