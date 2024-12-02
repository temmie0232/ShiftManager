"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { ReactNode } from "react";

interface MainCardProps {
    icon?: ReactNode;         // アイコン
    title: string;           // タイトル
    description: ReactNode;     // 説明 (タグを使いたいためReactNode)
    children?: ReactNode;     // 中身
    className?: string;      // 全体のカスタムクラス
    href?: string;
}

export default function MainCard({ icon, title, description, children, className = "", href }: MainCardProps) {
    return (
        <Card className={`border-2 transition-all duration-300 hover:border-gray-400 hover:shadow-xl ${className}`}>
            <CardHeader className="space-y-4">
                {/* アイコン部分 (iconが指定されている場合のみ表示) */}
                {icon && (
                    <div className="rounded-lg w-12 h-12 flex items-center justify-center bg-gray-100 mb-4">
                        {icon}
                    </div>
                )}
                <div className="space-y-2">
                    <CardTitle className="font-semibold text-2xl">{title}</CardTitle>
                    <CardDescription className="text-gray-600">{description}</CardDescription>
                </div>
            </CardHeader>
            {children}
        </Card>
    );
}
