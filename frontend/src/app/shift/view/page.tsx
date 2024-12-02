"use client";
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import MainCard from "@/components/layout/MainCard";
import HomeLink from "@/components/ui/HomeLink";

type Employee = {
    id: number;
    name: string;
};

type SubmissionStatus = {
    [key: number]: boolean;
};

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
            // 従業員データを取得
            const empResponse = await fetch("http://localhost:8000/api/accounts/employees/");
            if (!empResponse.ok) throw new Error("従業員データの取得に失敗しました");
            const empData = await empResponse.json();
            setEmployees(empData);

            // 次の月の年と月を取得
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);
            const year = nextMonth.getFullYear();
            const month = nextMonth.getMonth() + 1;

            // 各従業員の提出状況を確認
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
                                <div className="py-8 text-center text-gray-500">
                                    全体表示は準備中です
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </MainCard>
            </div>
        </div>
    );
}