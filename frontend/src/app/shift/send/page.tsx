"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ShiftSendPage() {
    return (
        // ページ全体
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            {/* メインコンテンツ */}
            <div className="max-w-2xl mx-auto space-y-8">
                {/* ホームへ */}
                <Link
                    href="/home"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    ホームに戻る
                </Link>

                {/* メインカード (ホバー時のエフェクト付き) */}
                <Card className="border-2 transition-all duration-300 hover:border-gray-400 hover:shadow-xl">
                    <CardHeader className="space-y-4">
                        <div className="rounded-lg w-12 h-12 flex items-center justify-center bg-gray-100 mb-4">
                            <Send className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="font-semibold text-2xl">シフトの送信</CardTitle>
                            <CardDescription className="text-gray-600">
                                確定したシフト(PDF)をLINEグループに送信します
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <form>
                        <CardContent>
                            <div className="space-y-6">
                                {/* PDFアップローダーとメッセージ入力部分は後で実装 */}
                                <div className="h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                                    <p className="text-gray-500">PDFアップロード機能（準備中）</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">
                                        メッセージ
                                    </label>
                                    <textarea
                                        className="flex min-h-[160px] w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                                        placeholder="PDFと一緒に送信するメッセージを入力してください"
                                        disabled
                                    />
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter>
                            <Button
                                type="submit"
                                disabled
                                className="w-full bg-gray-900 hover:bg-gray-800 text-white transition-colors"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Send className="w-4 h-4" />
                                    送信する
                                </div>
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}