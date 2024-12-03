import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface PasswordDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (password: string) => Promise<void>;
    mode: "set" | "verify";
    employeeName: string;
}

export default function PasswordDialog({
    isOpen,
    onClose,
    onSubmit,
    mode,
    employeeName
}: PasswordDialogProps) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!password || !/^\d{4}$/.test(password)) {
            setError("4桁の数字を入力してください");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            await onSubmit(password);
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogTitle>
                    {mode === "set" ? "誕生日を設定" : "誕生日を入力"}
                </DialogTitle>
                <DialogDescription>
                    {mode === "set" ? (
                        <div className="space-y-2">
                            <span>{`${employeeName}さんの誕生日を入力してください（例：7月4日→0704）`}</span>
                            <span className="block text-sm">この誕生日は次回以降のシフト提出の際にも使用します。</span>
                        </div>
                    ) : (
                        `${employeeName}さんの誕生日を入力してください（例：7月4日→0704）`
                    )}
                </DialogDescription>

                <div className="space-y-4">
                    <Input
                        type="password"
                        placeholder="誕生日（4桁）"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        maxLength={4}
                    />

                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            キャンセル
                        </Button>
                        <Button onClick={handleSubmit} disabled={isLoading}>
                            {isLoading ? "処理中..." : "OK"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}