"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import PDFUploader from "@/components/ui/PDFUploader";

export default function ShiftSendPage() {
    const [message, setMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedFile) {
            setError("PDFファイルを選択してください");
            return;
        }

        setIsLoading(true);
        setError("");
        setSuccess(false);

        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('message', message);

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
            setSelectedFile(null);
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
            selectedFile={selectedFile}
            onFileSelect={setSelectedFile}
        />
    );
}