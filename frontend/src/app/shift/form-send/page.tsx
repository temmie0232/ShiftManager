import React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
export default function ShiftFormSendPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* ナビゲーションリンク */}
                <Link
                    href="/home"
                    className="inline-flex items-center gap-2 text-sm text-gray-600"
                >
                    <ArrowLeft className="w-4 h-4" />
                    ホームに戻る
                </Link>
                <Card>
                    <CardHeader>
                        {/* アイコンコンテナ */}
                        <div className="rounded-lg w-12 h-12 flex items-center justify-center bg-gray-100 mb-4">
                            <Send className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle>シフト提出フォームの送信</CardTitle>
                            <CardDescription>
                                LINEグループにシフト提出フォームのURLを送信します
                            </CardDescription>
                        </div>
                    </CardHeader>
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
                                    className="flex min-h-[160px] w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm"
                                    placeholder="シフト提出フォームと一緒に送信するメッセージを入力してください"
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full">
                            <div className="flex items-center justify-center gap-2">
                                <Send className="w-4 h-4" />
                                送信する
                            </div>
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}