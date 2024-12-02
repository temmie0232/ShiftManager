import { Save } from "lucide-react";
import SubmitButton from "@/components/ui/SubmitButton";

type ShiftSubmitButtonsProps = {
    onSave: () => void;        // シフト提出時の処理
    onDraft: () => void;       // 一時保存時の処理
    isLoading: boolean;        // ローディング状態
    draftSaving?: boolean;     // 一時保存中の状態
};

export default function ShiftSubmitButtons({
    onSave,
    onDraft,
    isLoading,
    draftSaving = false
}: ShiftSubmitButtonsProps) {
    return (
        <div className="space-y-3">
            {/* 一時保存ボタン */}
            <button
                onClick={onDraft}
                disabled={draftSaving || isLoading}
                className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center justify-center gap-2"
            >
                {draftSaving ? (
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin" />
                        保存中...
                    </div>
                ) : (
                    <>
                        <Save className="w-4 h-4" />
                        一時保存
                    </>
                )}
            </button>

            {/* 提出ボタン */}
            <SubmitButton
                label="希望を提出"
                onClick={onSave}
                isLoading={isLoading}
                iconType="save"
            />
        </div>
    );
}