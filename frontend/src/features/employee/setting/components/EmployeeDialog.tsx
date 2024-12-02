import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type EmployeeForm = {
    name: string;
    can_open: boolean;
    can_close_cleaning: boolean;
    can_close_cashier: boolean;
    can_close_floor: boolean;
    can_order: boolean;
    is_beginner: boolean;
};

type Props = {
    isOpen: boolean;
    isLoading: boolean;
    error: string;
    formData: EmployeeForm;
    onClose: () => void;
    onSave: () => void;
    onDelete?: () => void;
    setFormData: (data: EmployeeForm) => void;
};

export default function EmployeeDialog({
    isOpen,
    isLoading,
    error,
    formData,
    onClose,
    onSave,
    onDelete,
    setFormData,
}: Props) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-6">
                <h3 className="text-lg font-semibold">
                    {onDelete ? "従業員を編集" : "従業員を追加"}
                </h3>

                <div className="space-y-4">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    {/* 名前入力 */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">名前</label>
                        <input
                            type="text"
                            className="mt-1 w-full rounded-md border border-gray-200 p-2"
                            value={formData.name}
                            placeholder="例: 山田 太郎"
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                        <div key={key} className="flex items-center justify-between">
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
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        キャンセル
                    </Button>

                    <Button className="flex-1 bg-gray-900" onClick={onSave} disabled={isLoading}>
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                保存中...
                            </div>
                        ) : (
                            "保存"
                        )}
                    </Button>

                    {onDelete && (
                        <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={onDelete}
                            disabled={isLoading}
                        >
                            削除
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
