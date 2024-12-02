"use client";

import React, { useState, useRef, ReactNode } from "react";
import { Upload, FileText, X } from "lucide-react";

interface PDFUploaderProps {
    onFileChange: (file: File | null) => void; // ファイル変更時のコールバック
    isLoading?: boolean;                      // アップロード中の状態
    error?: string;                           // エラーメッセージ
    selectedFile?: File | null;               // 選択されたファイル
    placeholder?: ReactNode;                  // ドラッグ&ドロップ領域のプレースホルダー
}

export default function PDFUploader({
    onFileChange,
    isLoading = false,
    error = "",
    selectedFile = null,
    placeholder = "クリックまたはドラッグ＆ドロップでPDFファイルを選択",
}: PDFUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
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

    // ファイル選択時の処理
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        handleFile(file || null);
    };

    // ファイル選択の処理ロジック
    const handleFile = (file: File | null) => {
        if (file && file.type === "application/pdf") {
            onFileChange(file);
        } else {
            onFileChange(null);
        }
    };

    // ファイル削除処理
    const handleRemoveFile = () => {
        onFileChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; // input要素をリセット
        }
    };

    return (
        <div>
            {/* ファイル選択エリア */}
            <div
                className={`relative flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer
                    ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:bg-gray-100"}
                    ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
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
                    disabled={isLoading}
                />
                {selectedFile ? (
                    // ファイルが選択された場合
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
                                disabled={isLoading}
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>
                ) : (
                    // ファイルが選択されていない場合
                    <label
                        htmlFor="pdf"
                        className="flex flex-col items-center justify-center w-full h-full text-gray-500"
                    >
                        <Upload className={`w-8 h-8 mb-2 ${isDragging ? "text-blue-500" : "text-gray-500"}`} />
                        <p className="text-sm">{placeholder}</p>
                    </label>
                )}
            </div>

            {/* エラーメッセージ */}
            {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md mt-2">{error}</div>}
        </div>
    );
}
