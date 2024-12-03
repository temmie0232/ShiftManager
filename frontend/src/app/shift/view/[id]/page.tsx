"use client"

import { useState, useEffect } from 'react';
import { CardContent } from "@/components/ui/card";
import CustomCalendar from "@/components/ui/CustomCalendar";
import { addMonths, startOfMonth, format } from "date-fns";
import HomeLink from "@/components/ui/HomeLink";
import MainCard from "@/components/layout/MainCard";
import { use } from 'react';
import { Calendar, Check } from "lucide-react";
import ShiftEditDialog, { ShiftEditData } from '@/features/shift/view/[id]/components/ShiftEditDialog';
import { useToast } from "@/hooks/use-toast";

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
};

type CalendarShiftData = {
    [key: string]: {
        startTime: string;
        endTime: string;
        color?: string;
    };
};

export default function ShiftViewDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const employeeId = resolvedParams.id;
    const nextMonth = addMonths(startOfMonth(new Date()), 1);
    const { toast } = useToast();

    const [shiftData, setShiftData] = useState<ShiftData | null>(null);
    const [employeeName, setEmployeeName] = useState("");
    const [calendarData, setCalendarData] = useState<CalendarShiftData>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Dialog states
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isEditLoading, setIsEditLoading] = useState(false);

    useEffect(() => {
        Promise.all([
            fetchEmployeeName(),
            fetchShiftData()
        ]);
    }, [employeeId]);

    const fetchEmployeeName = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/accounts/employees/${employeeId}/`);
            const data = await response.json();
            setEmployeeName(data.name);
        } catch (err) {
            console.error("従業員名の取得に失敗しました:", err);
        }
    };

    const fetchShiftData = async () => {
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
                const submittedShift = data[0];
                setShiftData(submittedShift);

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

    const handleDateSelect = (date: Date) => {
        setSelectedDate(date);
        setIsEditDialogOpen(true);
    };

    const handleShiftSave = async (shiftData: ShiftEditData) => {
        if (!selectedDate) return;

        setIsEditLoading(true);
        try {
            const dateString = format(selectedDate, 'yyyy-MM-dd');
            const year = nextMonth.getFullYear();
            const month = nextMonth.getMonth() + 1;

            const response = await fetch(
                `http://localhost:8000/api/shifts/history/${employeeId}/update/`,
                {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        year,
                        month,
                        date: dateString,
                        start_time: shiftData.startTime,
                        end_time: shiftData.endTime,
                        is_holiday: shiftData.isHoliday
                    }),
                }
            );

            if (!response.ok) {
                throw new Error("シフトの更新に失敗しました");
            }

            // Update local state
            setCalendarData(prev => ({
                ...prev,
                [dateString]: {
                    startTime: shiftData.startTime,
                    endTime: shiftData.endTime,
                    color: shiftData.isHoliday ? '#333333' : '#f3f4f6'
                }
            }));

            toast({
                // @ts-ignore
                title: (
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>保存完了</span>
                    </div>
                ),
                description: "シフトを保存しました",
                duration: 3000
            });

            setIsEditDialogOpen(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
            toast({
                title: "エラー",
                description: err instanceof Error ? err.message : "エラーが発生しました",
                variant: "destructive",
                duration: 3000
            });
        } finally {
            setIsEditLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <HomeLink href="/shift/view" text="シフト一覧へ戻る" />

                <MainCard
                    icon={<Calendar className="w-6 h-6 text-gray-600" />}
                    title={`${employeeName}さんの希望シフト`}
                    description={`${nextMonth.getFullYear()}年${nextMonth.getMonth() + 1}月の希望シフト`}
                >
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

                                <CustomCalendar
                                    selectedDates={[]}
                                    onDateSelect={handleDateSelect}
                                    onWeekdaySelect={() => { }}
                                    shiftData={calendarData}
                                    currentMonth={nextMonth}
                                    className="w-full"
                                />
                            </>
                        )}
                    </CardContent>
                </MainCard>
            </div>

            {selectedDate && (
                <ShiftEditDialog
                    isOpen={isEditDialogOpen}
                    onClose={() => setIsEditDialogOpen(false)}
                    onSave={handleShiftSave}
                    date={selectedDate}
                    isLoading={isEditLoading}
                    initialData={
                        calendarData[format(selectedDate, 'yyyy-MM-dd')] ? {
                            startTime: calendarData[format(selectedDate, 'yyyy-MM-dd')].startTime,
                            endTime: calendarData[format(selectedDate, 'yyyy-MM-dd')].endTime,
                            isHoliday: calendarData[format(selectedDate, 'yyyy-MM-dd')].color === '#333333'
                        } : undefined
                    }
                />
            )}
        </div>
    );
}