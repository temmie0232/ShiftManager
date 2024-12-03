"use client"
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft, CalendarRange, FileSpreadsheet } from "lucide-react";
import Link from "next/link";
import HomeLink from "@/components/ui/HomeLink";
import MainCard from "@/components/layout/MainCard";
import { BiSpreadsheet } from "react-icons/bi";
import SubmitButton from "@/components/ui/SubmitButton";

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
            const response = await fetch("http://localhost:8000/api/notifications/send-shift-form/", {
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
                <HomeLink />


                <MainCard
                    icon={<FileSpreadsheet className="w-6 h-6 text-gray-600" />}
                    title="シフト提出フォームを送信"
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