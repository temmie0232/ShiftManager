import { Button } from "@/components/ui/button";
import { Save, Send } from "lucide-react";

type SubmitButtonProps = {
    label: string; // ボタンに表示するラベル
    onClick: React.FormEventHandler | (() => void); // クリック時の処理
    isLoading: boolean; // ローディング中かどうか
    disabled?: boolean; // ボタンを無効化するかどうか
    iconType?: "save" | "send"; // 表示するアイコンの種類
};

export default function SubmitButton({
    label,
    onClick,
    isLoading,
    disabled = false,
    iconType = "send",
}: SubmitButtonProps) {
    const Icon = iconType === "save" ? Save : Send;

    return (
        <Button
            onClick={onClick}
            disabled={isLoading || disabled}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white transition-colors"
        >
            {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    処理中...
                </div>
            ) : (
                <div className="flex items-center justify-center gap-2">
                    <Icon className="w-4 h-4" />
                    {label}
                </div>
            )}
        </Button>
    );
}
