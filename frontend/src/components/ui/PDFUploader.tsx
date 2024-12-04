import React, { useState, useRef, ReactNode } from "react";
import { Upload, FileText, X } from "lucide-react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Send } from "lucide-react";
import HomeLink from "@/components/ui/HomeLink";
import MainCard from "@/components/layout/MainCard";
import SubmitButton from "@/components/ui/SubmitButton";

interface PDFUploaderProps {
    message: string;
    onMessageChange: (message: string) => void;
    onSubmit: (e: React.FormEvent) => Promise<void>;
    isLoading: boolean;
    error: string;
    success: boolean;
    selectedFile: File | null;
    onFileSelect: (file: File | null) => void;
}

export default function PDFUploader({
    message,
    onMessageChange,
    onSubmit,
    isLoading,
    error,
    success,
    selectedFile,
    onFileSelect
}: PDFUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        handleFile(file || null);
    };

    const handleFile = (file: File | null) => {
        if (file && file.type === "application/pdf") {
            onFileSelect(file);
        } else {
            onFileSelect(null);
        }
    };

    const handleRemoveFile = () => {
        onFileSelect(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <HomeLink />

                <MainCard
                    icon={<Send className="w-6 h-6 text-gray-600" />}
                    title="シフトの送信"
                    description="確定したシフト(PDF)をLINEグループに送信します"
                >
                    <form onSubmit={onSubmit}>
                        <CardContent>
                            <input
                                ref={fileInputRef}
                                type="file"
                                name="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="hidden"
                                disabled={isLoading}
                            />

                            {selectedFile ? (
                                // ファイルが選択されている場合
                                <div className="mb-4">
                                    <div className="p-4 border-2 border-gray-300 rounded-lg bg-white">
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
                                                disabled={isLoading}
                                            >
                                                <X className="w-5 h-5 text-gray-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // ファイルが選択されていない場合
                                <div
                                    className={`relative flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg mb-4
                                        ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"}
                                        ${isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                                    `}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <div className="flex flex-col items-center justify-center w-full h-full text-gray-500">
                                        <Upload className={`w-8 h-8 mb-2 ${isDragging ? "text-blue-500" : "text-gray-500"}`} />
                                        <p className="text-sm">クリックまたはドラッグ＆ドロップでPDFファイルを選択</p>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md mb-4">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <label htmlFor="message" className="text-sm font-medium text-gray-700">
                                    メッセージ
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    className="flex min-h-[160px] w-full rounded-md border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="PDFと一緒に送信するメッセージを入力してください"
                                    value={message}
                                    onChange={(e) => onMessageChange(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>

                            {success && (
                                <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md mt-4">
                                    送信が完了しました！
                                </div>
                            )}
                        </CardContent>
                        <CardFooter>
                            <SubmitButton
                                label="送信する"
                                onClick={onSubmit}
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