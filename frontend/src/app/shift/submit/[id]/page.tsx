"use client"
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import CustomCalendar from "@/components/ui/CustomCalendar";
import { startOfMonth, addMonths, format } from "date-fns";
import { TimePresetDrawer, type TimePreset } from "@/components/ui/TimePresetDrawer";

// シフトデータの型定義
type ShiftData = {
    [key: string]: {
        startTime: string;
        endTime: string;
        color?: string;
    };
};

export default function ShiftSubmitPage({ params }: { params: { id: string } }) {
    // 次の月を管理
    const nextMonth = addMonths(startOfMonth(new Date()), 1);

    // 選択された日付を管理
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);

    // シフトデータを管理
    const [shiftData, setShiftData] = useState<ShiftData>({});

    // 選択中のプリセットを管理
    const [selectedPreset, setSelectedPreset] = useState<TimePreset | null>(null);

    // フォーム入力を管理
    const [monthlyPreference, setMonthlyPreference] = useState({
        minHours: 0,
        maxHours: 0,
        minDaysPerWeek: 0,
        maxDaysPerWeek: 0,
    });

    // ローディング状態の管理
    const [isLoading, setIsLoading] = useState(false);

    // エラーメッセージの管理
    const [error, setError] = useState("");

    // 成功メッセージの管理
    const [success, setSuccess] = useState(false);

    // 日付が選択された時の処理
    const handleDateSelect = (date: Date) => {
        if (!selectedPreset) {
            alert("時間帯を先に選択してください");
            return;
        }

        const dateString = format(date, 'yyyy-MM-dd');
        setShiftData(prev => ({
            ...prev,
            [dateString]: {
                startTime: selectedPreset.startTime,
                endTime: selectedPreset.endTime,
                color: '#a5d6a7' // 希望シフトの色
            }
        }));
    };

    // 曜日が選択された時の処理
    const handleWeekdaySelect = (weekday: number) => {
        if (!selectedPreset) {
            alert("時間帯を先に選択してください");
            return;
        }

        // 次の月のすべての日付に対して
        const newShiftData = { ...shiftData };
        for (let day = 1; day <= 31; day++) {
            const date = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day);
            if (date.getMonth() === nextMonth.getMonth() && date.getDay() === weekday) {
                const dateString = format(date, 'yyyy-MM-dd');
                newShiftData[dateString] = {
                    startTime: selectedPreset.startTime,
                    endTime: selectedPreset.endTime,
                    color: '#a5d6a7'
                };
            }
        }
        setShiftData(newShiftData);
    };

    // シフト希望を送信
    const handleSubmit = async () => {
        setIsLoading(true);
        setError("");
        setSuccess(false);

        try {
            const shifts = Object.entries(shiftData).map(([date, shift]) => ({
                date,
                start_time: shift.startTime,
                end_time: shift.endTime
            }));

            const response = await fetch(`/api/shifts/request/${params.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    shifts,
                    monthly_preference: monthlyPreference
                }),
            });

            if (!response.ok) {
                throw new Error("シフトの送信に失敗しました");
            }

            setSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                {/* 戻るリンク */}
                <Link
                    href="/shift/submit"
                    className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    従業員一覧へ戻る
                </Link>

                <Card className="border-2 transition-all duration-300 hover:border-gray-400 hover:shadow-xl">
                    <CardHeader className="space-y-4">
                        <CardTitle className="text-2xl font-bold">シフト希望提出</CardTitle>
                        <CardDescription>
                            カレンダーから希望の日時を選択してください
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        {/* カレンダー */}
                        <CustomCalendar
                            selectedDates={selectedDates}
                            onDateSelect={handleDateSelect}
                            onWeekdaySelect={handleWeekdaySelect}
                            shiftData={shiftData}
                            currentMonth={nextMonth}
                            className="w-full"
                        />

                        {/* 時間帯選択ドロワー */}
                        <TimePresetDrawer
                            selectedPreset={selectedPreset}
                            onPresetSelect={setSelectedPreset}
                        />

                        {/* 月間・週間希望設定 */}
                        <div className="space-y-6">
                            {/* 月間希望時間 */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">月の労働時間 (希望)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        className="w-24 px-3 py-2 border rounded-md"
                                        placeholder="最小"
                                        value={monthlyPreference.minHours || ''}
                                        onChange={(e) => setMonthlyPreference(prev => ({
                                            ...prev,
                                            minHours: parseInt(e.target.value)
                                        }))}
                                    />
                                    <span className="text-gray-500">~</span>
                                    <input
                                        type="number"
                                        className="w-24 px-3 py-2 border rounded-md"
                                        placeholder="最大"
                                        value={monthlyPreference.maxHours || ''}
                                        onChange={(e) => setMonthlyPreference(prev => ({
                                            ...prev,
                                            maxHours: parseInt(e.target.value)
                                        }))}
                                    />
                                    <span className="text-sm text-gray-500">時間</span>
                                </div>
                            </div>

                            {/* 週間希望日数 */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">週の労働日数 (希望)</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        className="w-24 px-3 py-2 border rounded-md"
                                        placeholder="最小"
                                        value={monthlyPreference.minDaysPerWeek || ''}
                                        onChange={(e) => setMonthlyPreference(prev => ({
                                            ...prev,
                                            minDaysPerWeek: parseInt(e.target.value)
                                        }))}
                                    />
                                    <span className="text-gray-500">~</span>
                                    <input
                                        type="number"
                                        className="w-24 px-3 py-2 border rounded-md"
                                        placeholder="最大"
                                        value={monthlyPreference.maxDaysPerWeek || ''}
                                        onChange={(e) => setMonthlyPreference(prev => ({
                                            ...prev,
                                            maxDaysPerWeek: parseInt(e.target.value)
                                        }))}
                                    />
                                    <span className="text-sm text-gray-500">日</span>
                                </div>
                            </div>
                        </div>

                        {/* エラーメッセージ */}
                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        {/* 成功メッセージ */}
                        {success && (
                            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                                シフトの希望を提出しました！
                            </div>
                        )}
                    </CardContent>

                    <CardFooter>
                        <Button
                            className="w-full bg-gray-900"
                            onClick={handleSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    送信中...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <Save className="w-4 h-4" />
                                    希望を提出
                                </div>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}