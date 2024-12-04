"use client";

import { useState, useEffect } from "react";
import MainCard from "@/components/layout/MainCard";
import HomeLink from "@/components/ui/HomeLink";
import { Calendar } from "lucide-react";
import { addMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import UserAvailabilityTimeline from "@/features/shift/create/manual/UserAvailabilityTimeline";

type Employee = {
    id: number;
    name: string;
};

type ShiftDetail = {
    date: string;
    start_time: string;
    end_time: string;
    is_holiday: boolean;
};

type ShiftData = {
    id: number;
    name: string;
    shift_details: ShiftDetail[];
};

export default function ManualShiftCreatePage() {
    const nextMonth = addMonths(startOfMonth(new Date()), 1);
    const [selectedDate, setSelectedDate] = useState(nextMonth); // 初期値を nextMonth に変更
    const [employees, setEmployees] = useState<ShiftData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const days = eachDayOfInterval({
        start: startOfMonth(nextMonth),
        end: endOfMonth(nextMonth)
    });

    useEffect(() => {
        fetchShiftData();
    }, []);

    const fetchShiftData = async () => {
        setIsLoading(true);
        try {
            const empResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/accounts/employees/`);
            const employees = await empResponse.json();

            const year = nextMonth.getFullYear();
            const month = nextMonth.getMonth() + 1;

            const shiftsData = await Promise.all(
                employees.map(async (emp: Employee) => {
                    const shiftResponse = await fetch(
                        `/api/shifts/history/${emp.id}/?year=${year}&month=${month}`
                    );
                    const shiftData = await shiftResponse.json();
                    return {
                        id: emp.id,
                        name: emp.name,
                        shift_details: shiftData[0]?.shift_details || []
                    };
                })
            );

            setEmployees(shiftsData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    };

    // 選択された日付の従業員シフトをフィルタリング
    const getAvailableEmployees = () => {
        return employees.map(emp => ({
            name: emp.name,
            shift: emp.shift_details.find(
                detail => detail.date === format(selectedDate, 'yyyy-MM-dd')
            )
        })).filter(emp => emp.shift && !emp.shift.is_holiday);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex h-screen">
                {/* Left sidebar calendar */}
                <div className="w-28 bg-white border-r overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-transparent">
                    <HomeLink />
                    <div className="mt-4">
                        {days.map(day => (
                            <button
                                key={day.toString()}
                                onClick={() => setSelectedDate(day)}
                                className={`w-full text-center p-3 rounded-lg transition-colors ${isSameDay(day, selectedDate)
                                    ? "bg-gray-900 text-white"
                                    : "hover:bg-gray-100"
                                    }`}
                            >
                                <div className="font-medium">
                                    {format(day, 'd日', { locale: ja })}
                                </div>
                                <div className="text-sm opacity-70">
                                    {format(day, 'EEEE', { locale: ja })}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main content */}
                <div className="flex-1 p-8">
                    <MainCard
                    >
                        <div className="p-6">
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                    <p className="mt-2 text-sm text-gray-600">読み込み中...</p>
                                </div>
                            ) : error ? (
                                <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                    {error}
                                </div>
                            ) : (
                                <UserAvailabilityTimeline
                                    employees={getAvailableEmployees()}
                                    selectedDate={selectedDate}
                                />
                            )}
                        </div>
                    </MainCard>
                </div>
            </div>
        </div>
    );
}