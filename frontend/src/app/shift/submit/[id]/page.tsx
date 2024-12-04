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
import { toast } from "@/hooks/use-toast";
import { CalendarDays, Check, Clock, HelpCircle, Plus } from "lucide-react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

//export default function ShiftSubmitPage({ params }: { params: Promise<{ id: string }> }) {
// const resolvedParams = use(params);
// const employeeId = resolvedParams.id;
export default function ShiftSubmitPage({ params }: { params: { id: string } }) {
    const employeeId = params.id;
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
    const [isHelpDialogOpen, setIsHelpDialogOpen] = useState(false);

    const carouselImages = [
        { src: "/images/step1.png", alt: "ステップ1: 時間帯を作成 / 選択" },
        { src: "/images/step2.png", alt: "ステップ2: カレンダーをクリック" },
        { src: "/images/step3.png", alt: "ステップ3: 曜日をクリック" },
    ];

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
            toast({
                // @ts-ignore
                title: (
                    <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500" />
                        <span>提出完了</span>
                    </div>
                ),
                description: "シフトを提出しました",
                duration: 3000
            });

            router.push(`/shift/submit/${employeeId}/submitted`);
        } catch (err) {
            setError(err instanceof Error ? err.message : "エラーが発生しました");
            toast({
                title: "エラー",
                description: err instanceof Error ? err.message : "エラーが発生しました",
                variant: "destructive",
                duration: 3000
            });
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
                >
                    <CardContent className="space-y-6">
                        <div className="flex justify-between items-center">
                            <Dialog open={isHelpDialogOpen} onOpenChange={setIsHelpDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full">
                                        <HelpCircle className="h-4 w-4 mr-2" />
                                        使い方
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <div className="space-y-6">
                                        <h2 className="text-lg font-semibold">シフトの入れ方</h2>

                                        {/* ステップ1 */}
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                            <div className="flex items-center text-base font-medium text-gray-900">
                                                <Clock className="h-5 w-5 mr-2 text-blue-500" />
                                                <h3>Step 1: 時間帯を準備する</h3>
                                            </div>
                                            <div className="ml-7 space-y-1 text-sm text-gray-600">
                                                <p>① 「時間帯を選択」ボタンをクリック</p>
                                                <p>② 「新しい時間帯を追加」を選択</p>
                                                <p>③ 名前と時間を設定して保存</p>
                                            </div>
                                        </div>

                                        {/* ステップ2 */}
                                        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                            <div className="flex items-center text-base font-medium text-gray-900">
                                                <CalendarDays className="h-5 w-5 mr-2 text-blue-500" />
                                                <h3>Step 2: カレンダーに入れる</h3>
                                            </div>
                                            <div className="ml-7 space-y-1 text-sm text-gray-600">
                                                <p>作成した時間帯を選んで...</p>
                                                <p>• 1日だけ: 日付をクリック</p>
                                                <p>• 毎週同じ曜日: 曜日名(月)などをクリック</p>
                                            </div>
                                        </div>

                                        {/* 具体例 */}
                                        <div className="border-t pt-4">
                                            <p className="font-medium mb-2">例: 毎週土曜日 13:00-22:00 で働きたい場合</p>
                                            <div className="bg-blue-50 p-3 rounded text-sm space-y-2">
                                                <div className="flex items-center">
                                                    <span className="bg-blue-100 px-2 py-1 rounded mr-2">手順1</span>
                                                    <p>新しい時間帯を追加</p>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="bg-blue-100 px-2 py-1 rounded mr-2">手順2</span>
                                                    <div>
                                                        <p>名前:「土曜シフト」</p>
                                                        <p>時間: 13:00-22:00</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="bg-blue-100 px-2 py-1 rounded mr-2">手順3</span>
                                                    <p>カレンダーの「土」をクリック</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </DialogContent>
                            </Dialog>

                        </div>
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