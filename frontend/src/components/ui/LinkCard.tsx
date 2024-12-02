"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ReactNode } from "react";

interface LinkCardProps {
    href: string;          // リンク先のURL
    icon: ReactNode;       // アイコンのReact要素
    title: string;         // タイトル
    description: string;   // 説明
}

export default function LinkCard({ href, icon, title, description }: LinkCardProps) {
    return (
        <Link href={href} className="group">
            <Card className="h-full border-2 transition-all duration-300 hover:border-gray-400 hover:shadow-xl group-hover:-translate-y-1">
                <CardHeader>
                    <div className="rounded-lg w-12 h-12 flex items-center justify-center bg-gray-100 mb-4 group-hover:bg-gray-200 transition-colors">
                        {icon}
                    </div>
                    <CardTitle className="group-hover:text-gray-900 transition-colors">{title}</CardTitle>
                    <CardDescription className="text-gray-600">{description}</CardDescription>
                </CardHeader>
            </Card>
        </Link>
    );
}
