import React from 'react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function UserAvailabilityTimeline({ employees, selectedDate }) {
    const hours = Array.from({ length: 16 }, (_, i) => i + 7);
    const formatTime = (hour) => `${hour.toString().padStart(2, '0')}:00`;

    const calculateBarStyle = (startTime, endTime) => {
        const startHour = parseInt(startTime.split(':')[0]);
        const endHour = parseInt(endTime.split(':')[0]);
        const totalWidth = 100;
        const startPosition = ((startHour - 7) / 15) * totalWidth;
        const width = ((endHour - startHour) / 15) * totalWidth;

        return {
            left: `${startPosition}%`,
            width: `${width}%`,
            backgroundColor: 'rgba(37, 99, 235, 0.4)',  // blue-600 with 0.4 opacity
        };
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-semibold">
                {format(selectedDate, 'yyyy年M月d日(EEEE)', { locale: ja })}の出勤可能な従業員
            </h2>

            <div className="relative border rounded-lg bg-white p-6">
                <div className="flex justify-between mb-8 border-b pb-2">
                    {hours.map(hour => (
                        <div key={hour} className="text-sm text-gray-500">
                            {formatTime(hour)}
                        </div>
                    ))}
                </div>

                <div className="space-y-4">
                    {employees.map((emp, index) => (
                        <div key={index} className="relative h-12 flex items-center">
                            <div className="w-24 flex-shrink-0 font-medium">
                                {emp.name}
                            </div>

                            <div className="flex-1 relative h-8 bg-gray-50 rounded">
                                <div
                                    className="absolute h-full rounded transition-colors"
                                    style={calculateBarStyle(emp.shift.start_time, emp.shift.end_time)}
                                >
                                    <div className="h-full w-full flex items-center justify-center text-sm font-medium text-blue-900">
                                        {emp.shift.start_time.slice(0, 5)} - {emp.shift.end_time.slice(0, 5)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}