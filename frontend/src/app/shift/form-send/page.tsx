"use client";

import { useState } from "react";
import { toast } from "@/hooks/use-toast"; // toastをインポート
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft, CalendarRange, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import HomeLink from "@/components/ui/HomeLink";
import MainCard from "@/components/layout/MainCard";
import { BiSpreadsheet } from "react-icons/bi";
import SubmitButton from "@/components/ui/SubmitButton";

export default function ShiftFormSendPage() {
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        setError("");
        setSuccess(false);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/send-shift-form/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message,
                    form_url: `${window.location.origin}/staff`,
                }),
            });

            if (!response.ok) {
                throw new Error("送信に失敗しました");
            }

            setSuccess(true);
            setMessage("");
            toast({
                title: "送信成功",
                description: "シフト提出用のURLの送信が完了しました",
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* ナビゲーションリンク */}
                <HomeLink />

                <MainCard
                    icon={<FileSpreadsheet className="w-6 h-6 text-gray-600" />}
                    title="シフト提出用URLを送信"
                    description="LINEグループにシフト提出用のURLを送信します"
                >
                    <form onSubmit={handleSubmit}>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label
                                        htmlFor="message"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        メッセージ
                                    </label>
                                    <textarea
                                        id="message"
                                        className="flex min-h-[160px] w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="URLと一緒に送信するメッセージを入力してください (例:15日までに入力お願いします。)"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>

                                {/* エラーメッセージの表示 */}
                                {error && (
                                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                        {error}
                                    </div>
                                )}

                                {/* 成功メッセージの表示 */}
                                {success && (
                                    <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                                        送信が完了しました！
                                    </div>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter>
                            <SubmitButton
                                label="送信する"
                                onClick={handleSubmit}
                                isLoading={isLoading}
                                iconType="send"
                            />
                        </CardFooter>
                    </form>
                </MainCard>
            </div>
        </div >
    );
}
