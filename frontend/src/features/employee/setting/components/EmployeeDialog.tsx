import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

type EmployeeForm = {
    name: string;
    password?: string;
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

type ToggleOption = {
    [K in keyof Omit<EmployeeForm, 'name' | 'password'>]: string;
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
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const toggleOptions: ToggleOption = {
        can_open: "オープン作業",
        can_close_cleaning: "クローズ作業(洗浄)",
        can_close_cashier: "クローズ作業(キャッシャー)",
        can_close_floor: "クローズ作業(フロア清掃)",
        can_order: "解凍発注作業",
        is_beginner: "新人",
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);

        // パスワードのバリデーション
        if (value && (!value.match(/^\d+$/) || value.length !== 4)) {
            setPasswordError("パスワードは4桁の数字を入力してください");
        } else {
            setPasswordError("");
            // パスワードが有効な場合、formDataに追加
            setFormData({
                ...formData,
                password: value || undefined
            });
        }
    };

    const handleSubmit = () => {
        if (password && passwordError) {
            return;
        }
        onSave();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {onDelete ? "従業員を編集" : "従業員を追加"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="name">名前</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            placeholder="例: 山田 太郎"
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full"
                        />
                    </div>

                    {/* パスワード入力フィールド */}
                    <div className="space-y-2">
                        <Label htmlFor="password">
                            パスワード (誕生日4桁){onDelete && " - 変更する場合のみ入力"}
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={handlePasswordChange}
                            placeholder="例: 0704 (7月4日)"
                            maxLength={4}
                            className="w-full"
                        />
                        {passwordError && (
                            <div className="text-sm text-red-600">
                                {passwordError}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        {(Object.entries(toggleOptions) as [keyof Omit<EmployeeForm, 'name' | 'password'>, string][]).map(([key, label]) => (
                            <div key={key} className="flex items-center justify-between">
                                <Label htmlFor={key} className="cursor-pointer">
                                    {label}
                                </Label>
                                <Switch
                                    id={key}
                                    checked={formData[key]}
                                    onCheckedChange={(checked: boolean) =>
                                        setFormData({
                                            ...formData,
                                            [key]: checked,
                                        })
                                    }
                                />
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

                        <Button
                            className="flex-1 bg-gray-900"
                            onClick={handleSubmit}
                            disabled={isLoading || (!!password && !!passwordError)}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>保存中...</span>
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
            </DialogContent>
        </Dialog>
    );
}