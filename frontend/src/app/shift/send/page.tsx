"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast"; // toastをインポート
import PDFUploader from "@/features/shift/send/components/PDFUploader";

export default function ShiftSendPage() {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!e.currentTarget) {
            setError("フォームデータの取得に失敗しました");
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccess(false);

        const formData = new FormData(e.currentTarget as HTMLFormElement);

        try {
            const response = await fetch("http://localhost:8000/api/notifications/send-shift-notification/", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("送信に失敗しました");
            }

            setSuccess(true);
            setMessage("");
            toast({
                title: "送信成功",
                description: "通知の送信が完了しました",
                duration: 3000,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "エラーが発生しました";
            setError(errorMessage);
            toast({
                title: "エラー",
                description: errorMessage,
                variant: "destructive",
                duration: 3000,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PDFUploader
            message={message}
            onMessageChange={setMessage}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            error={error}
            success={success}
        />
    );
}
