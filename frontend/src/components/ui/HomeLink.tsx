"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface HomeLinkProps {
    href?: string; // リンク先
    text?: string; // 表示テキスト
}

// オプショナルに設定し、リンクとテキストはデフォルトで/homeに
export default function HomeLink({ href = "/home", text = "ホームに戻る" }: HomeLinkProps) {
    return (
        <Link
            href={href}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group"
        >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            {text}
        </Link>
    );
}
