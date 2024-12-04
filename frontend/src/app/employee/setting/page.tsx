"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Users, Plus, PenSquare } from "lucide-react";
import HomeLink from "@/components/ui/HomeLink";
import MainCard from "@/components/layout/MainCard";
import EmployeeDialog from "@/features/employee/setting/components/EmployeeDialog";
import { CardContent } from "@/components/ui/card";

// 従業員データの型定義
type Employee = {
    id: number;
    name: string;
    password?: string;
    can_open: boolean;
    can_close_cleaning: boolean;
    can_close_cashier: boolean;
    can_close_floor: boolean;
    can_order: boolean;
    is_beginner: boolean;
};

// フォーム用の型定義
type EmployeeForm = Omit<Employee, "id">;

// フォームの初期状態を定義
const initialFormState: EmployeeForm = {
    name: "",
    password: "",
    can_open: false,
    can_close_cleaning: false,
    can_close_cashier: false,
    can_close_floor: false,
    can_order: false,
    is_beginner: false,
};

export default function EmployeeSettingPage() {
    // 従業員一覧
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState<EmployeeForm>(initialFormState);

    // 編集中の従業員情報を管理するstate
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

    // 初回レンダリング時に従業員データを取得
    useEffect(() => {
        fetchEmployees();
    }, []);

    // 従業員データをAPIから取得
    const fetchEmployees = async () => {
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch("https://yokohama-uwu.love/api/accounts/employees/");
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

    // ダイアログを開く処理
    const handleOpenDialog = (employee?: Employee) => {
        if (employee) {
            setEditingEmployee(employee);
            setFormData({
                name: employee.name,
                can_open: employee.can_open,
                can_close_cleaning: employee.can_close_cleaning,
                can_close_cashier: employee.can_close_cashier,
                can_close_floor: employee.can_close_floor,
                can_order: employee.can_order,
                is_beginner: employee.is_beginner,
            });
        } else {
            setEditingEmployee(null);
            setFormData(initialFormState);
        }
        setIsDialogOpen(true);
    };

    // フォームの送信処理
    const handleSubmit = async () => {
        setIsLoading(true);
        setError("");

        try {
            const url = editingEmployee
                ? `/api/accounts/employees/${editingEmployee.id}/`
                : "/api/accounts/employees/";

            const method = editingEmployee ? "PUT" : "POST";

            // メインのデータを送信（パスワードを除く）
            const { password, ...employeeData } = formData;
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(employeeData),
            });

            if (!response.ok) throw new Error("保存に失敗しました");
            const savedEmployee = await response.json();

            // パスワードが入力されている場合、パスワード設定APIを呼び出す
            if (password) {
                const passwordUrl = `/api/accounts/employees/${editingEmployee?.id || savedEmployee.id}/set-password/`;
                const passwordResponse = await fetch(passwordUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        password: password
                    }),
                });

                if (!passwordResponse.ok) {
                    const errorData = await passwordResponse.json();
                    throw new Error(errorData.error || "パスワードの設定に失敗しました");
                }
            }

            await fetchEmployees();
            setIsDialogOpen(false);
            setFormData(initialFormState);
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    };

    // 従業員の削除処理
    const handleDelete = async () => {
        if (!editingEmployee) return;

        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(
                `/api/accounts/employees/${editingEmployee.id}/`,
                {
                    method: "DELETE",
                }
            );

            if (!response.ok) throw new Error("削除に失敗しました");

            await fetchEmployees();
            setIsDialogOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <HomeLink />

                <MainCard
                    icon={<Users className="w-6 h-6 text-gray-600" />}
                    title="従業員設定"
                    description="従業員情報の追加・編集・削除を行います"
                >
                    <CardContent>
                        <div className="space-y-6">
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
                                <div className="space-y-4">
                                    {employees.map((employee) => (
                                        <div
                                            key={employee.id}
                                            className="flex items-center justify-between p-4 bg-white rounded-lg border hover:border-gray-300 transition-colors"
                                        >
                                            <span className="font-medium">{employee.name}</span>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleOpenDialog(employee)}
                                            >
                                                <PenSquare className="w-4 h-4 mr-2" />
                                                編集
                                            </Button>
                                        </div>
                                    ))}

                                    <Button
                                        className="w-full bg-white hover:bg-gray-50 text-gray-600 border-2 border-dashed"
                                        variant="outline"
                                        onClick={() => handleOpenDialog()}
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        従業員を追加
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </MainCard>
            </div>

            {/* ダイアログコンポーネント */}
            <EmployeeDialog
                isOpen={isDialogOpen}
                isLoading={isLoading}
                error={error}
                formData={formData}
                onClose={() => {
                    setIsDialogOpen(false);
                    setFormData(initialFormState);
                }}
                onSave={handleSubmit}
                onDelete={editingEmployee ? handleDelete : undefined}
                setFormData={setFormData}
            />
        </div>
    );
}