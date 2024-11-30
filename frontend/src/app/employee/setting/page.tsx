"use client"
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, PenSquare } from "lucide-react";
import Link from "next/link";

// 従業員データの型定義
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

    // ローディングの状態管理
    const [isLoading, setIsLoading] = useState(false);

    // エラーの状態管理
    const [error, setError] = useState("");

    // ダイアログの表示状態を管理
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // フォームの状態を管理するstate
    const [formData, setFormData] = useState<EmployeeForm>(initialFormState);

    // 編集中の従業員情報を管理するstate
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

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
                ? `http://localhost:8000/api/accounts/employees/${editingEmployee.id}/`
                : "http://localhost:8000/api/accounts/employees/";

            const method = editingEmployee ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) throw new Error("保存に失敗しました");

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
                `http://localhost:8000/api/accounts/employees/${editingEmployee.id}/`,
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

                {/* メインカード */}
                <Card className="border-2 transition-all duration-300 hover:border-gray-400 hover:shadow-xl">
                    <CardHeader className="space-y-4">
                        {/* アイコンコンテナ */}
                        <div className="rounded-lg w-12 h-12 flex items-center justify-center bg-gray-100 mb-4">
                            <PenSquare className="w-6 h-6 text-gray-600" />
                        </div>

                        {/* タイトル */}
                        <div className="space-y-2">
                            <CardTitle className="font-semibold text-2xl">従業員設定</CardTitle>
                            <CardDescription className="text-gray-600">
                                従業員情報の追加・編集・削除を行います
                            </CardDescription>
                        </div>
                    </CardHeader>

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

                                    {/* 従業員追加ボタン */}
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
                </Card>
            </div>

            {/* 従業員追加・編集ダイアログ */}
            {isDialogOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-6">
                        <h3 className="text-lg font-semibold">
                            {editingEmployee ? "従業員を編集" : "従業員を追加"}
                        </h3>

                        <div className="space-y-4">
                            {/* 名前入力 */}
                            <div>
                                <label className="text-sm font-medium text-gray-700">
                                    名前
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 w-full rounded-md border border-gray-200 p-2"
                                    value={formData.name}
                                    placeholder="例: 山田 太郎"
                                    onChange={(e) =>
                                        setFormData({ ...formData, name: e.target.value })
                                    }
                                />
                            </div>

                            {/* スイッチトグル */}
                            {Object.entries({
                                can_open: "オープン作業",
                                can_close_cleaning: "クローズ作業(洗浄)",
                                can_close_cashier: "クローズ作業(キャッシャー)",
                                can_close_floor: "クローズ作業(フロア清掃)",
                                can_order: "解凍発注作業",
                                is_beginner: "新人",
                            }).map(([key, label]) => (
                                <div
                                    key={key}
                                    className="flex items-center justify-between"
                                >
                                    <span className="text-sm">{label}</span>
                                    <button
                                        type="button"
                                        role="switch"
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData[key as keyof EmployeeForm]
                                                ? "bg-gray-900"
                                                : "bg-gray-200"
                                            }`}
                                        onClick={() =>
                                            setFormData({
                                                ...formData,
                                                [key]: !formData[key as keyof EmployeeForm],
                                            })
                                        }
                                    >
                                        <span
                                            className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${formData[key as keyof EmployeeForm]
                                                    ? "translate-x-6"
                                                    : "translate-x-1"
                                                }`}
                                        />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between gap-4">
                            {/* キャンセルボタン */}
                            <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => setIsDialogOpen(false)}
                                disabled={isLoading}
                            >
                                キャンセル
                            </Button>

                            {/* 保存ボタン */}
                            <Button
                                className="flex-1 bg-gray-900"
                                onClick={handleSubmit}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        保存中...
                                    </div>
                                ) : (
                                    "保存"
                                )}
                            </Button>

                            {/* 削除ボタン (編集時のみ表示) */}
                            {editingEmployee && (
                                <Button
                                    variant="destructive"
                                    className="flex-1"
                                    onClick={handleDelete}
                                    disabled={isLoading}
                                >
                                    削除
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}