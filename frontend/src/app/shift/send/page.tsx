"use client";

import { useState } from "react";
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
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
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