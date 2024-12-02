"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import MainCard from "@/components/layout/MainCard";
import HomeLink from "@/components/ui/HomeLink";
import { format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { ja } from 'date-fns/locale';

type Employee = {
    id: number;
    name: string;
};

type SubmissionStatus = {
    [key: number]: boolean;
};

type ShiftTableData = {
    [key: string]: {
        name: string;
        shifts: {
            [key: string]: {
                startTime: string;
                endTime: string;
                isSubmitted: boolean;
            }
        }
    }
};

function AllShiftsTab() {
    const [tableData, setTableData] = useState<ShiftTableData>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    const nextMonth = addMonths(startOfMonth(new Date()), 1);
    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(nextMonth),
        end: endOfMonth(nextMonth)
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
                                isSubmitted: true
                            };
                            return acc;
                        }, {});
                    }
                }

                data[emp.id] = {
                    name: emp.name,
                    shifts
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
                        {daysInMonth.map(day => (
                            <th key={format(day, 'yyyy-MM-dd')} className="p-2 border bg-gray-50 min-w-[100px]">
                                <div>{format(day, 'd')}</div>
                                <div className="text-xs text-gray-500">
                                    {format(day, 'E', { locale: ja })}
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
                            {daysInMonth.map(day => {
                                const dateKey = format(day, 'yyyy-MM-dd');
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

export default function ShiftViewPage() {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchEmployeesAndStatus();
    }, []);

    const fetchEmployeesAndStatus = async () => {
        setIsLoading(true);
        setError("");

        try {
            const empResponse = await fetch("http://localhost:8000/api/accounts/employees/");
            if (!empResponse.ok) throw new Error("従業員データの取得に失敗しました");
            const empData = await empResponse.json();
            setEmployees(empData);

            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            const year = nextMonth.getFullYear();
            const month = nextMonth.getMonth() + 1;

            const statuses: SubmissionStatus = {};
            for (const emp of empData) {
                const statusResponse = await fetch(
                    `http://localhost:8000/api/shifts/draft/${emp.id}/${year}/${month}/`
                );
                const statusData = await statusResponse.json();
                statuses[emp.id] = statusData.submitted || false;
            }
            setSubmissionStatus(statuses);
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmployeeClick = (empId: number) => {
        if (submissionStatus[empId]) {
            router.push(`/shift/view/${empId}`);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <HomeLink />

                <MainCard
                    title="シフト確認"
                    description="提出されたシフトを確認できます"
                >
                    <div className="p-6">
                        <Tabs defaultValue="individual" className="w-full">
                            <TabsList className="w-full mb-6">
                                <TabsTrigger value="individual" className="flex-1">個人</TabsTrigger>
                                <TabsTrigger value="all" className="flex-1">全体</TabsTrigger>
                            </TabsList>

                            <TabsContent value="individual">
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
                                    <div className="space-y-2">
                                        {employees.map((employee) => (
                                            <button
                                                key={employee.id}
                                                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-colors ${submissionStatus[employee.id]
                                                    ? "hover:bg-gray-50 border-gray-200"
                                                    : "bg-gray-50 border-gray-100 cursor-not-allowed"
                                                    }`}
                                                onClick={() => handleEmployeeClick(employee.id)}
                                                disabled={!submissionStatus[employee.id]}
                                            >
                                                <span className={`font-medium ${!submissionStatus[employee.id] && "text-gray-500"}`}>
                                                    {employee.name}
                                                </span>
                                                {submissionStatus[employee.id] ? (
                                                    <Check className="w-5 h-5 text-green-500" />
                                                ) : (
                                                    <X className="w-5 h-5 text-red-500" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </TabsContent>

                            <TabsContent value="all">
                                <AllShiftsTab />
                            </TabsContent>
                        </Tabs>
                    </div>
                </MainCard>
            </div>
        </div>
    );
}