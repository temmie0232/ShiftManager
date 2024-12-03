"use client"

import { useState, useEffect } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import CustomCalendar from "@/components/ui/CustomCalendar";
import { startOfMonth, addMonths, format } from "date-fns";
import { TimePresetDrawer, type TimePreset } from "@/features/shift/submit/[id]/components/TimePresetDrawer";
import HomeLink from "@/components/ui/HomeLink";
import MainCard from "@/components/layout/MainCard";
import ShiftSubmitButtons from "@/features/shift/submit/[id]/components/ShiftSubmitButtons";
import { useRouter } from "next/navigation";
import { use } from "react";
import ConfirmationDialog from "@/features/shift/submit/[id]/components/ConfirmationDialog";

type ShiftData = {
    [key: string]: {
        startTime: string;
        endTime: string;
        color?: string;
    };
};

type DraftData = {
    shift_details: {
        date: string;
        start_time: string;
        end_time: string;
    }[];
    min_hours?: number;
    max_hours?: number;
    min_days_per_week?: number;
    max_days_per_week?: number;
};

export default function ShiftSubmitPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const employeeId = resolvedParams.id;
    const router = useRouter();

    const nextMonth = addMonths(startOfMonth(new Date()), 1);
    const [selectedDates, setSelectedDates] = useState<Date[]>([]);
    const [shiftData, setShiftData] = useState<ShiftData>({});
    const [selectedPreset, setSelectedPreset] = useState<TimePreset | null>(null);
    const [monthlyPreference, setMonthlyPreference] = useState({
        minHours: 0,
        maxHours: 0,
        minDaysPerWeek: 0,
        maxDaysPerWeek: 0,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [draftSaving, setDraftSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

    useEffect(() => {
        fetchDraftData();
    }, []);

    const fetchDraftData = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/shifts/draft/${employeeId}/${nextMonth.getFullYear()}/${nextMonth.getMonth() + 1}/`);

            if (!response.ok) {
                if (response.status === 303) {
                    router.push(`/shift/submit/${employeeId}/submitted`);
                    return;
                }
                return;
            }

            const data: DraftData = await response.json();

            const restoredShiftData: ShiftData = {};
            data.shift_details.forEach(detail => {
                restoredShiftData[detail.date] = {
                    startTime: detail.start_time,
                    endTime: detail.end_time,
                    color: '#a5d6a7'
                };
            });

            setShiftData(restoredShiftData);
            setMonthlyPreference({
                minHours: data.min_hours || 0,
                maxHours: data.max_hours || 0,
                minDaysPerWeek: data.min_days_per_week || 0,
                maxDaysPerWeek: data.max_days_per_week || 0,
            });
        } catch (err) {
            console.error('ドラフトデータの取得に失敗しました:', err);
        }
    };

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
                color: '#a5d6a7'
            }
        }));
    };

    const handleWeekdaySelect = (weekday: number) => {
        if (!selectedPreset) {
            alert("時間帯を先に選択してください");
            return;
        }

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

    const handleSubmit = () => {
        if (Object.keys(shiftData).length === 0) {
            setError("シフトが入力されていません");
            return;
        }

        if (!monthlyPreference.minHours || !monthlyPreference.maxHours) {
            setError("月の希望労働時間を入力してください");
            return;
        }

        if (!monthlyPreference.minDaysPerWeek || !monthlyPreference.maxDaysPerWeek) {
            setError("週の希望労働日数を入力してください");
            return;
        }

        setIsConfirmDialogOpen(true);
    };

    const handleConfirmSubmit = async () => {
        setIsLoading(true);
        setError("");
        setSuccess(false);

        try {
            const shift_details = Object.entries(shiftData).map(([date, shift]) => ({
                date,
                start_time: shift.startTime,
                end_time: shift.endTime,
                is_holiday: shift.startTime === '00:00' && shift.endTime === '00:00'
            }));

            const requestData = {
                min_hours: monthlyPreference.minHours,
                max_hours: monthlyPreference.maxHours,
                min_days_per_week: monthlyPreference.minDaysPerWeek,
                max_days_per_week: monthlyPreference.maxDaysPerWeek,
                shift_details: shift_details
            };

            const response = await fetch(`http://localhost:8000/api/shifts/submit/${employeeId}/${nextMonth.getFullYear()}/${nextMonth.getMonth() + 1}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "シフトの送信に失敗しました");
            }

            setSuccess(true);
            router.push(`/shift/submit/${employeeId}/submitted`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setIsLoading(false);
            setIsConfirmDialogOpen(false);
        }
    };

    const handleDraftSave = async () => {
        setDraftSaving(true);
        setError("");

        try {
            const shifts = Object.entries(shiftData).map(([date, shift]) => ({
                date,
                start_time: shift.startTime,
                end_time: shift.endTime
            }));

            const response = await fetch(`http://localhost:8000/api/shifts/draft/${employeeId}/${nextMonth.getFullYear()}/${nextMonth.getMonth() + 1}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    shift_details: shifts,
                    min_hours: monthlyPreference.minHours,
                    max_hours: monthlyPreference.maxHours,
                    min_days_per_week: monthlyPreference.minDaysPerWeek,
                    max_days_per_week: monthlyPreference.maxDaysPerWeek,
                }),
            });

            if (!response.ok) {
                throw new Error("一時保存に失敗しました");
            }

            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setDraftSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <HomeLink href="/shift/submit" text="従業員選択へ戻る" />

                <MainCard
                    title="シフト希望提出"
                    description="カレンダーから希望の日時を選択してください"
                >
                    <CardContent className="space-y-6">
                        <CustomCalendar
                            selectedDates={selectedDates}
                            onDateSelect={handleDateSelect}
                            onWeekdaySelect={handleWeekdaySelect}
                            shiftData={shiftData}
                            currentMonth={nextMonth}
                            className="w-full"
                        />

                        <TimePresetDrawer
                            selectedPreset={selectedPreset}
                            onPresetSelect={setSelectedPreset}
                        />

                        <div className="space-y-6">
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

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
                                シフトを保存しました！
                            </div>
                        )}
                    </CardContent>

                    <CardFooter>
                        <ShiftSubmitButtons
                            onSave={handleSubmit}
                            onDraft={handleDraftSave}
                            isLoading={isLoading}
                            draftSaving={draftSaving}
                        />
                    </CardFooter>
                </MainCard>
            </div>

            <ConfirmationDialog
                isOpen={isConfirmDialogOpen}
                onClose={() => setIsConfirmDialogOpen(false)}
                onConfirm={handleConfirmSubmit}
                isLoading={isLoading}
            />
        </div>
    );
}