"use client"
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ShiftFormSendPage() {

    // メッセージの内容を管理
    const [message, setMessage] = useState("");
    // 送信中かどうかを管理
    const [isLoading, setIsLoading] = useState(false);
    // エラーメッセージを管理
    const [error, setError] = useState("");
    // 送信成功を管理
    const [success, setSuccess] = useState(false);

    // フォーム送信時の処理を行う関数
    const handleSubmit = async (e: React.FormEvent) => {
        // フォームのデフォルトの送信動作を防止
        e.preventDefault();

        // 送信開始時の状態設定
        setIsLoading(true);    // ローディング状態を開始
        setError("");          // エラーメッセージをリセット
        setSuccess(false);     // 成功状態をリセット

        try {
            // APIエンドポイントへのPOSTリクエスト
            const response = await fetch("/api/notifications/send-shift-form/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message,
                    // 現在のURLからフォームのURLを生成
                    form_url: `${window.location.origin}/staff`,
                }),
            });

            // レスポンスが正常でない場合はエラーを投げる
            if (!response.ok) {
                throw new Error("送信に失敗しました");
            }

            // 送信成功時の処理
            setSuccess(true);
            setMessage("");     // 入力フォームをクリア
        } catch (err) {
            // エラー発生時の処理
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            // 処理完了時の共通処理
            setIsLoading(false);  // ローディング状態を解除
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* ナビゲーションリンク */}
                <Link
                    href="/home"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    ホームに戻る
                </Link>

                <Card className="border-2 transition-all duration-300 hover:border-gray-400 hover:shadow-xl">
                    <CardHeader className="space-y-4">
                        {/* アイコンを含む丸いコンテナ */}
                        <div className="rounded-lg w-12 h-12 flex items-center justify-center bg-gray-100 mb-4">
                            <Send className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="font-semibold">シフト提出フォームの送信</CardTitle>
                            <CardDescription className="text-gray-600">
                                LINEグループにシフト提出フォームのURLを送信します
                            </CardDescription>
                        </div>
                    </CardHeader>

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
                                        placeholder="シフト提出フォームと一緒に送信するメッセージを入力してください"
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
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-gray-900 hover:bg-gray-800 text-white transition-colors"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        {/* ローディング */}
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        送信中...
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center gap-2">
                                        <Send className="w-4 h-4" />
                                        送信する
                                    </div>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}