"use client"
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import Link from "next/link";
import MainCard from "@/components/MainCard";

// 従業員データの型定義
type Employee = {
    id: number;
    name: string;
};

export default function ShiftSubmitPage() {
    // 従業員一覧を管理するstate
    const [employees, setEmployees] = useState<Employee[]>([]);
    // ローディングの状態管理
    const [isLoading, setIsLoading] = useState(false);
    // エラーの状態管理
    const [error, setError] = useState("");

    // コンポーネントマウント時に従業員データを取得
    useEffect(() => {
        fetchEmployees();
    }, []);

    // 従業員データをAPIから取得
    const fetchEmployees = async () => {
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:8000/api/accounts/employees/");
            if (!response.ok) {
                throw new Error("従業員データの取得に失敗しました");
            }
            const data = await response.json();
            setEmployees(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <MainCard
                    icon={<Users className="w-6 h-6 text-gray-600" />}
                    title="シフトの提出"
                    description="あなたの名前を選択してください。"
                >
                    <CardContent>
                        <div className="space-y-4">
                            {/* エラーメッセージ */}
                            {error && (
                                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                    {error}
                                </div>
                            )}

                            {/* ローディング表示 */}
                            {isLoading && (
                                <div className="text-center py-4">
                                    <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                    <p className="mt-2 text-sm text-gray-600">読み込み中...</p>
                                </div>
                            )}

                            {/* 従業員一覧 */}
                            {!isLoading && (
                                <div className="space-y-3">
                                    {employees.map((employee) => (
                                        <Link
                                            key={employee.id}
                                            href={`/shift/submit/${employee.id}`}
                                            className="block"
                                        >
                                            <Button
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal hover:bg-gray-100"
                                            >
                                                {employee.name}
                                            </Button>
                                        </Link>
                                    ))}

                                    {employees.length === 0 && !error && (
                                        <p className="text-center text-sm text-gray-500 py-4">
                                            従業員が登録されていません
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </MainCard>
            </div>
        </div>
    );
}