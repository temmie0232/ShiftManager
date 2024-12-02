import React from 'react';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, format, isSameMonth, isBefore, isAfter, startOfDay, getDay, isSameDay } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Button } from "@/components/ui/button";
import { cn } from '@/lib/utils';

interface CustomCalendarProps {
    selectedDates: Date[];
    onDateSelect: (date: Date) => void;
    onWeekdaySelect: (weekday: number) => void;
    shiftData: { [key: string]: { startTime: string, endTime: string, color?: string } };
    currentMonth: Date;
    className?: string;
}

const CustomCalendar: React.FC<CustomCalendarProps> = ({
    selectedDates,
    onDateSelect,
    onWeekdaySelect,
    shiftData,
    currentMonth,
    className
}) => {
    const startMonth = startOfMonth(currentMonth);
    const endMonth = endOfMonth(currentMonth);
    const startDate = startOfWeek(startMonth, { weekStartsOn: 0 });
    const endDate = endOfWeek(endMonth, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const weekdays = ['日', '月', '火', '水', '木', '金', '土'];

    const isDateSelectable = (date: Date) => {
        const startOfDate = startOfDay(date);
        return isSameMonth(startOfDate, currentMonth);
    };

    // シフトの背景色を取得する関数を変更
    const getShiftBackgroundColor = (shiftInfo: { startTime: string, endTime: string } | undefined) => {
        if (!shiftInfo) return '#ffffff'; // シフトなし: 白
        if (shiftInfo.startTime === '00:00' && shiftInfo.endTime === '00:00') {
            return '#333333'; // 休み: 濃いグレー（ほぼ黒）
        }
        return '#f3f4f6'; // 通常シフト: 薄いグレー
    };

    return (
        <div className={cn("bg-white rounded-lg shadow-lg border-2 border-gray-200", className)}>
            <div className="p-4">
                {/* 月表示 */}
                <div className="text-center font-bold text-lg text-gray-900 mb-4">
                    {format(currentMonth, 'yyyy年M月', { locale: ja })}
                </div>

                {/* カレンダーグリッド */}
                <div className="grid grid-cols-7 gap-1">
                    {/* 曜日ヘッダー */}
                    {weekdays.map((day, index) => (
                        <button
                            key={day}
                            className={cn(
                                "text-center font-medium p-2 rounded transition-colors hover:bg-gray-100",
                                index === 0 ? "text-red-500" : index === 6 ? "text-blue-500" : "text-gray-700"
                            )}
                            onClick={() => onWeekdaySelect(index)}
                        >
                            {day}
                        </button>
                    ))}

                    {/* 日付セル */}
                    {days.map(day => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                        const shiftInfo = shiftData[dateKey];
                        const isSelectable = isDateSelectable(day);
                        const isHoliday = shiftInfo && shiftInfo.startTime === '00:00' && shiftInfo.endTime === '00:00';
                        const dayOfWeek = getDay(day);
                        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => isSelectable && onDateSelect(day)}
                                className={cn(
                                    "p-2 relative rounded-lg transition-all",
                                    isSelectable
                                        ? "hover:bg-gray-50"
                                        : "cursor-not-allowed bg-gray-50",
                                    shiftInfo ? "shadow-sm" : "",
                                    !isSelectable && "opacity-50"
                                )}
                                style={{
                                    backgroundColor: isSelectable ? getShiftBackgroundColor(shiftInfo) : '#ffffff',
                                }}
                                disabled={!isSelectable}
                            >
                                {/* 日付 */}
                                <div className={cn(
                                    "font-medium",
                                    isHoliday ? "text-white" : // 休みの場合は白文字
                                        isWeekend ? (dayOfWeek === 0 ? "text-red-500" : "text-blue-500") : "text-gray-900",
                                    !isSelectable && "text-gray-400"
                                )}>
                                    {format(day, 'd')}
                                </div>

                                {/* シフト情報 */}
                                {shiftInfo && isSelectable && (
                                    <>
                                        <div className="my-1 h-px bg-gray-200"></div>
                                        <div className={cn(
                                            "text-xs flex flex-col items-center",
                                            isHoliday ? "text-white" : "text-gray-600"
                                        )}>
                                            {isHoliday ? (
                                                <div className="font-medium">休</div>
                                            ) : (
                                                <>
                                                    <div>{shiftInfo.startTime}</div>
                                                    <div className="h-2 w-px bg-gray-400"></div>
                                                    <div>{shiftInfo.endTime}</div>
                                                </>
                                            )}
                                        </div>
                                    </>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default CustomCalendar;