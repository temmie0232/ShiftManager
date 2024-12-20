"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import PasswordDialog from "@/components/ui/PasswordDialog";

// 従業員データの型定義
type Employee = {
    id: number;
    name: string;
    password: string | null;
};

export default function ShiftSubmitPage() {
    const router = useRouter();
    // 従業員一覧を管理するstate
    const [employees, setEmployees] = useState<Employee[]>([]);
    // ローディングの状態管理
    const [isLoading, setIsLoading] = useState(false);
    // エラーの状態管理
    const [error, setError] = useState("");
    // パスワードダイアログの状態管理
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [passwordMode, setPasswordMode] = useState<"set" | "verify">("verify");

    // コンポーネントマウント時に従業員データを取得
    useEffect(() => {
        fetchEmployees();
    }, []);

    // 従業員データをAPIから取得
    const fetchEmployees = async () => {
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/accounts/employees/`);
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

    const handleEmployeeClick = async (employee: Employee) => {
        setSelectedEmployee(employee);

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/accounts/employees/${employee.id}/`
            );
            if (!response.ok) throw new Error("従業員情報の取得に失敗しました");

            const updatedEmployee = await response.json();

            if (!updatedEmployee.password) {
                setPasswordMode("set");
                setIsPasswordDialogOpen(true);
            } else {
                setPasswordMode("verify");
                setIsPasswordDialogOpen(true);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        }
    };

    const handlePasswordSubmit = async (password: string) => {
        if (!selectedEmployee) return;

        try {
            const endpoint = passwordMode === "set"
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/accounts/employees/${selectedEmployee.id}/set-password/`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/accounts/employees/${selectedEmployee.id}/verify-password/`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error);
            }

            setIsPasswordDialogOpen(false);

            // シフト提出状況を確認
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            const year = nextMonth.getFullYear();
            const month = nextMonth.getMonth() + 1;

            const statusResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/shifts/draft/${selectedEmployee.id}/${year}/${month}/`
            );

            if (!statusResponse.ok) {
                throw new Error("提出状況の確認に失敗しました");
            }

            const statusData = await statusResponse.json();

            // 提出済みの場合は提出済みページにリダイレクト
            if (statusData.submitted) {
                router.push(`/shift/submit/${selectedEmployee.id}/submitted`);
            } else {
                // 未提出の場合は通常のシフト提出ページへ
                router.push(`/shift/submit/${selectedEmployee.id}`);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="p-4 space-y-6 w-2/3 mx-auto">
                <div className="flex items-center space-x-3">
                    <Users className="w-6 h-6 text-gray-600" />
                    <div>
                        <h1 className="text-2xl font-bold mt-6">シフトの提出</h1>
                        <p className="text-gray-600 text-sm">あなたの名前を選択してください</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="text-center py-4">
                            <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            <p className="mt-2 text-sm text-gray-600">読み込み中...</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {employees.map((employee) => (
                                <Button
                                    key={employee.id}
                                    variant="outline"
                                    className="w-full justify-start text-left font-medium hover:bg-gray-100 p-6 text-lg"
                                    onClick={() => handleEmployeeClick(employee)}
                                    disabled={isLoading}
                                >
                                    {employee.name}
                                </Button>
                            ))}

                            {employees.length === 0 && !error && (
                                <p className="text-center text-sm text-gray-500 py-4">
                                    従業員が登録されていません
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <PasswordDialog
                isOpen={isPasswordDialogOpen}
                onClose={() => setIsPasswordDialogOpen(false)}
                onSubmit={handlePasswordSubmit}
                mode={passwordMode}
                employeeName={selectedEmployee?.name ?? ""}
            />
        </div>
    );
}