"use client"
import { useState, useEffect, use } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Home } from "lucide-react";
import Link from "next/link";
import CustomCalendar from "@/components/ui/CustomCalendar";
import { addMonths, startOfMonth } from "date-fns";
import HomeLink from "@/components/ui/HomeLink";

// 提出済みシフトデータの型定義
type ShiftData = {
    year: number;
    month: number;
    min_hours: number;
    max_hours: number;
    min_days_per_week: number;
    max_days_per_week: number;
    shift_details: {
        date: string;
        start_time: string;
        end_time: string;
        is_holiday: boolean;
    }[];
    submitted_at: string;
};

// カレンダー用のシフトデータ型
type CalendarShiftData = {
    [key: string]: {
        startTime: string;
        endTime: string;
        color?: string;
    };
};

export default function SubmittedPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const employeeId = resolvedParams.id;

    const [shiftData, setShiftData] = useState<ShiftData | null>(null);
    const [calendarData, setCalendarData] = useState<CalendarShiftData>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const nextMonth = addMonths(startOfMonth(new Date()), 1);

    // useEffectでemployeeIdを依存配列に追加
    useEffect(() => {
        fetchSubmittedShift();
    }, [employeeId]);

    const fetchSubmittedShift = async () => {
        setIsLoading(true);
        setError("");

        try {
            const year = nextMonth.getFullYear();
            const month = nextMonth.getMonth() + 1;

            const response = await fetch(
                `http://localhost:8000/api/shifts/history/${employeeId}/?year=${year}&month=${month}`
            );

            if (!response.ok) {
                throw new Error("シフトデータの取得に失敗しました");
            }

            const data = await response.json();
            if (data && data.length > 0) {
                const submittedShift = data[0]; // 最新のシフトを取得
                setShiftData(submittedShift);

                // カレンダー表示用にデータを変換
                const formattedData: CalendarShiftData = {};
                submittedShift.shift_details.forEach((detail: any) => {
                    formattedData[detail.date] = {
                        startTime: detail.start_time,
                        endTime: detail.end_time,
                        color: detail.is_holiday ? '#333333' : '#f3f4f6'
                    };
                });
                setCalendarData(formattedData);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <HomeLink href="/shift/submit" text="従業員選択へ戻る" />

                <Card className="border-2 transition-all duration-300 hover:border-gray-400 hover:shadow-xl">
                    <CardHeader className="space-y-4">
                        <div className="rounded-full w-12 h-12 flex items-center justify-center bg-green-100 mb-4">
                            <Check className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-bold text-center">
                                シフト提出済み
                            </CardTitle>
                            <CardDescription className="text-center">
                                {nextMonth.getFullYear()}年{nextMonth.getMonth() + 1}月のシフト希望内容
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {isLoading ? (
                            <div className="text-center py-4">
                                <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                <p className="mt-2 text-sm text-gray-600">読み込み中...</p>
                            </div>
                        ) : error ? (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                {error}
                            </div>
                        ) : shiftData && (
                            <>
                                {/* 希望時間・日数の表示 */}
                                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">希望労働時間</span>
                                        <span className="font-medium">
                                            {shiftData.min_hours}～{shiftData.max_hours}時間
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">週の希望労働日数</span>
                                        <span className="font-medium">
                                            {shiftData.min_days_per_week}～{shiftData.max_days_per_week}日
                                        </span>
                                    </div>
                                </div>

                                {/* カレンダー表示 */}
                                <CustomCalendar
                                    selectedDates={[]}
                                    onDateSelect={() => { }}
                                    onWeekdaySelect={() => { }}
                                    shiftData={calendarData}
                                    currentMonth={nextMonth}
                                    className="w-full"
                                />
                            </>
                        )}

                    </CardContent>
                </Card>
            </div>
        </div>
    );
}