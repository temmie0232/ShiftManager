// IndividualShiftsTab.tsx
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";

type Employee = { id: number; name: string };
type SubmissionStatus = { [key: number]: boolean };

export default function IndividualShiftsTab() {
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
            const empResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/accounts/employees/`);
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
                    `${process.env.NEXT_PUBLIC_API_URL}/api/shifts/draft/${emp.id}/${year}/${month}/`
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
    );
}
