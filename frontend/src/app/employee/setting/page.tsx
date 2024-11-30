"use client"
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ArrowLeft, PenSquare } from "lucide-react";
import Link from "next/link";

// 従業員データの型定義
// 各従業員の持つ属性を定義。idは一意の識別子として使用
type Employee = {
    id: number;
    name: string;
    can_open: boolean;          // オープン作業が可能か
    can_close_cleaning: boolean; // 閉店時の清掃作業が可能か
    can_close_cashier: boolean; // レジ締め作業が可能か
    can_close_floor: boolean;   // フロア清掃作業が可能か
    can_order: boolean;         // 発注作業が可能か
    is_beginner: boolean;       // 新人かどうか
};

// フォーム用の型定義
// Employee型からidを除外した型を作成（新規作成時にはidは不要なため）
type EmployeeForm = Omit<Employee, 'id'>;

// フォームの初期状態を定義
// 全てのブール値をfalseに、名前を空文字にセット
const initialFormState: EmployeeForm = {
    name: "",
    can_open: false,
    can_close_cleaning: false,
    can_close_cashier: false,
    can_close_floor: false,
    can_order: false,
    is_beginner: false,
};

export default function EmployeeSettingPage() {
    // 従業員一覧を管理するstate
    const [employees, setEmployees] = useState<Employee[]>([]);

    // フォームの状態を管理するstate
    const [formData, setFormData] = useState<EmployeeForm>(initialFormState);

    // 編集中の従業員情報を管理するstate
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    return (
        // ページ全体のコンテナ
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* ホームへ */}
                <Link
                    href="/home"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    ホームに戻る
                </Link>

                {/* メインコンテンツカード */}
                <Card className="border-2 transition-all duration-300 hover:border-gray-400 hover:shadow-xl">
                    <CardHeader className="space-y-4">
                        {/* アイコンコンテナ */}
                        <div className="rounded-lg w-12 h-12 flex items-center justify-center bg-gray-100 mb-4">
                            <PenSquare className="w-6 h-6 text-gray-600" />
                        </div>

                        {/* タイトル */}
                        <div className="space-y-2">
                            <CardTitle className="font-semibold text-2xl">
                                従業員設定
                            </CardTitle>
                            <CardDescription className="text-gray-600">
                                従業員情報の追加・編集・削除を行います
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent>
                        <div className="space-y-6">
                            <p className="text-gray-500">従業員一覧</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}