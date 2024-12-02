"use client";

import { useState } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import HomeLink from "@/components/ui/HomeLink";
import MainCard from "@/components/layout/MainCard";
import PDFUploader from "@/features/shift/send/components/PDFUploader";
import SubmitButton from "@/components/ui/SubmitButton";

export default function ShiftSendPage() {
    // 状態管理の設定
    const [message, setMessage] = useState("");  // メッセージの内容
    const [selectedFile, setSelectedFile] = useState<File | null>(null);  // 選択されたファイル
    const [error, setError] = useState("");  // エラーメッセージ
    const [isLoading, setIsLoading] = useState(false);  // 送信状態
    const [success, setSuccess] = useState(false);  // 送信成功状態

    // フォーム送信時の処理を行う関数
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 送信前のバリデーション
        if (!selectedFile) {
            setError("PDFファイルを選択してください");
            return;
        }

        // 送信中の状態を設定
        setIsLoading(true);
        setError("");
        setSuccess(false);

        // FormDataの作成
        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("message", message);

        try {
            // APIにリクエストを送信
            const response = await fetch("http://localhost:8000/api/notifications/send-shift-notification/", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("送信に失敗しました");
            }

            // 送信成功時の処理
            setSuccess(true);
            setMessage("");
            setSelectedFile(null);
        } catch (err) {
            // エラー発生時の処理
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            // 送信状態を解除
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* ホームへのリンク */}
                <HomeLink />

                {/* メインカード */}
                <MainCard
                    icon={<Send className="w-6 h-6 text-gray-600" />}
                    title="シフトの送信"
                    description="確定したシフト(PDF)をLINEグループに送信します"
                >
                    <form onSubmit={handleSubmit}>
                        <CardContent>
                            {/* PDFアップローダー */}
                            <PDFUploader
                                onFileChange={setSelectedFile}
                                selectedFile={selectedFile}
                                isLoading={isLoading}
                                error={error}
                            />

                            {/* メッセージ入力 */}
                            <div className="space-y-4 mt-6">
                                <label htmlFor="message" className="text-sm font-medium text-gray-700">
                                    メッセージ
                                </label>
                                <textarea
                                    id="message"
                                    className="flex min-h-[160px] w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="PDFと一緒に送信するメッセージを入力してください"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            {/* 成功メッセージ表示 */}
                            {success && (
                                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md mt-4">
                                    送信が完了しました！
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>

                            <SubmitButton
                                label="送信する"
                                onClick={handleSubmit}
                                isLoading={isLoading}
                                disabled={!selectedFile}
                                iconType="send"
                            />
                        </CardFooter>
                    </form>
                </MainCard>
            </div>
        </div>
    );
}
