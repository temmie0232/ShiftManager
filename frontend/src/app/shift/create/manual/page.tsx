"use client";

import { useState, useEffect } from "react";
import MainCard from "@/components/layout/MainCard";
import { Button } from "@/components/ui/button";
import HomeLink from "@/components/ui/HomeLink";
import { Calendar, Clock } from "lucide-react";
import { addMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';

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
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [employees, setEmployees] = useState<ShiftData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const nextMonth = addMonths(startOfMonth(new Date()), 1);
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
            // 従業員データの取得
            const empResponse = await fetch("http://localhost:8000/api/accounts/employees/");
            const employees = await empResponse.json();

            // 各従業員のシフトデータを取得
            const year = nextMonth.getFullYear();
            const month = nextMonth.getMonth() + 1;

            const shiftsData = await Promise.all(
                employees.map(async (emp: Employee) => {
                    const shiftResponse = await fetch(
                        `http://localhost:8000/api/shifts/history/${emp.id}/?year=${year}&month=${month}`
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
            console.error('Error fetching data:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // 選択された日付の従業員シフトをフィルタリング
    const getAvailableEmployees = () => {
        return employees.map(emp => {
            const dayShift = emp.shift_details.find(
                detail => detail.date === format(selectedDate, 'yyyy-MM-dd')
            );
            return {
                name: emp.name,
                shift: dayShift
            };
        }).filter(emp => emp.shift && !emp.shift.is_holiday);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex h-screen">
                <div className="w-28 bg-white border-r overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-transparent">
                    <HomeLink />
                    <style jsx global>{`
                        .scrollbar-thin::-webkit-scrollbar {
                            width: 6px;
                        }
                        .scrollbar-thin::-webkit-scrollbar-track {
                            background: transparent;
                        }
                        .scrollbar-thin::-webkit-scrollbar-thumb {
                            background-color: rgb(209, 213, 219);
                            border-radius: 3px;
                            transition: background-color 0.2s;
                        }
                        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                            background-color: rgb(156, 163, 175);
                        }
                    `}</style>
                    <div className="mt-4 ">
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

                {/* メインコンテンツ */}
                <div className="flex-1 p-8">
                    <MainCard
                        icon={<Calendar className="w-6 h-6 text-gray-600" />}
                        title="シフトの作成"
                        description={`${format(selectedDate, 'yyyy年M月d日(EEEE)', { locale: ja })}のシフト`}
                    >
                        <div className="p-6">
                            {isLoading ? (
                                <div className="text-center py-8">
                                    <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                                    <p className="mt-2 text-sm text-gray-600">読み込み中...</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {getAvailableEmployees().map((emp, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                        >
                                            <div className="font-medium">{emp.name}</div>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Clock className="w-4 h-4 mr-2" />
                                                {emp.shift?.start_time.slice(0, 5)} - {emp.shift?.end_time.slice(0, 5)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </MainCard>
                </div>
            </div>
        </div>
    );
}