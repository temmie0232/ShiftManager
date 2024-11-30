"use client"

import { useState, useRef } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send, ArrowLeft, Upload, FileText, X } from "lucide-react";
import Link from "next/link";

export default function ShiftSendPage() {
    // 状態管理の設定
    const [message, setMessage] = useState("");  // メッセージの内容
    const [selectedFile, setSelectedFile] = useState<File | null>(null);  // 選択されたファイル
    const [error, setError] = useState("");  // エラーメッセージ
    const fileInputRef = useRef<HTMLInputElement>(null);  // ファイル入力のref
    // ドラッグ&ドロップの状態管理を追加
    const [isDragging, setIsDragging] = useState(false);

    // ドラッグ&ドロップのイベントハンドラ
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files[0];
        handleFile(file);
    };

    // ファイル選択時の共通処理
    const handleFile = (file: File) => {
        // PDFファイルかどうかをチェック
        if (file && file.type === "application/pdf") {
            setSelectedFile(file);
            setError("");
        } else {
            setSelectedFile(null);
            setError("PDFファイルを選択してください");
        }
    };

    // ファイル選択時の処理
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    // ファイルの削除処理
    const handleRemoveFile = () => {
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";  // input要素をリセット
        }
    };

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
                                {/* PDFアップローダー */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 block">
                                        PDFファイル
                                    </label>
                                    {/* ドラッグ&ドロップエリアを追加 */}
                                    <div
                                        className="relative mt-1 flex items-center justify-center w-full"
                                        onDragOver={handleDragOver}
                                        onDragLeave={handleDragLeave}
                                        onDrop={handleDrop}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            id="pdf"
                                            accept=".pdf"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                        {selectedFile ? (
                                            // ファイルが選択された場合の表示
                                            <div className="w-full p-4 border-2 border-gray-300 rounded-lg bg-white">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <FileText className="w-8 h-8 text-blue-500" />
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                                                            <p className="text-xs text-gray-500">
                                                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveFile}
                                                        className="p-1 rounded-full hover:bg-gray-100"
                                                    >
                                                        <X className="w-5 h-5 text-gray-500" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            // ファイル選択前の表示（ドラッグ&ドロップ対応）
                                            <label
                                                htmlFor="pdf"
                                                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer
                                                    ${isDragging
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                                                    }`}
                                            >
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className={`w-8 h-8 mb-2 ${isDragging ? 'text-blue-500' : 'text-gray-500'}`} />
                                                    <p className="text-sm text-gray-500">
                                                        クリックまたはドラッグ＆ドロップでPDFファイルを選択
                                                    </p>
                                                </div>
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* メッセージ入力 */}
                                <div className="space-y-2">
                                    <label
                                        htmlFor="message"
                                        className="text-sm font-medium text-gray-700"
                                    >
                                        メッセージ
                                    </label>
                                    <textarea
                                        id="message"
                                        className="flex min-h-[160px] w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
                                        placeholder="PDFと一緒に送信するメッセージを入力してください"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                    />
                                </div>

                                {/* エラーメッセージ表示 */}
                                {error && (
                                    <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                        {error}
                                    </div>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter>
                            <Button
                                type="submit"
                                disabled={!selectedFile}
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