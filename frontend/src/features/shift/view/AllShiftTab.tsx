import { useState, useEffect } from "react";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ja } from "date-fns/locale";

type ShiftTableData = {
    [key: string]: {
        name: string;
        shifts: {
            [key: string]: {
                startTime: string;
                endTime: string;
                isSubmitted: boolean;
            };
        };
    };
};

export default function AllShiftsTab() {
    const [tableData, setTableData] = useState<ShiftTableData>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const nextMonth = addMonths(startOfMonth(new Date()), 1);
    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(nextMonth),
        end: endOfMonth(nextMonth),
    });

    useEffect(() => {
        fetchAllShifts();
    }, []);

    const fetchAllShifts = async () => {
        setIsLoading(true);
        setError("");

        try {
            const empResponse = await fetch("http://localhost:8000/api/accounts/employees/");
            const employees = await empResponse.json();

            const year = nextMonth.getFullYear();
            const month = nextMonth.getMonth() + 1;
            const data: ShiftTableData = {};

            for (const emp of employees) {
                const statusResponse = await fetch(
                    `http://localhost:8000/api/shifts/draft/${emp.id}/${year}/${month}/`
                );
                const statusData = await statusResponse.json();
                const isSubmitted = statusData.submitted;

                let shifts = {};
                if (isSubmitted) {
                    const shiftResponse = await fetch(
                        `http://localhost:8000/api/shifts/history/${emp.id}/?year=${year}&month=${month}`
                    );
                    const shiftData = await shiftResponse.json();

                    if (shiftData && shiftData.length > 0) {
                        shifts = shiftData[0].shift_details.reduce((acc: any, detail: any) => {
                            acc[detail.date] = {
                                startTime: detail.start_time,
                                endTime: detail.end_time,
                                isSubmitted: true,
                            };
                            return acc;
                        }, {});
                    }
                }

                data[emp.id] = {
                    name: emp.name,
                    shifts,
                };
            }

            setTableData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-8">
                <div className="inline-block w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                <p className="mt-2 text-sm text-gray-600">読み込み中...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
                <thead>
                    <tr>
                        <th className="p-2 border bg-gray-50 sticky left-0 z-10">従業員名</th>
                        {daysInMonth.map((day) => (
                            <th
                                key={format(day, "yyyy-MM-dd")}
                                className="p-2 border bg-gray-50 min-w-[100px]"
                            >
                                <div>{format(day, "d")}</div>
                                <div className="text-xs text-gray-500">
                                    {format(day, "E", { locale: ja })}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(tableData).map(([empId, data]) => (
                        <tr key={empId}>
                            <td className="p-2 border font-medium sticky left-0 bg-white z-10">
                                {data.name}
                            </td>
                            {daysInMonth.map((day) => {
                                const dateKey = format(day, "yyyy-MM-dd");
                                const shift = data.shifts[dateKey];

                                return (
                                    <td key={dateKey} className="p-2 border">
                                        {shift && (
                                            <div className="text-xs bg-gray-50 rounded p-1 text-center">
                                                {shift.startTime.slice(0, 5)}
                                                <div className="h-px bg-gray-300 my-1" />
                                                {shift.endTime.slice(0, 5)}
                                            </div>
                                        )}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
