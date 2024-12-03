import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export type ShiftEditData = {
    startTime: string;
    endTime: string;
    isHoliday: boolean;
};

interface ShiftEditDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (shiftData: ShiftEditData) => Promise<void>;
    initialData?: ShiftEditData;
    date: Date;
    isLoading?: boolean;
}

const TIME_OPTIONS = Array.from({ length: 31 }, (_, i) => {
    const hour = Math.floor(i / 2) + 7;
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, "0")}:${minute}`;
});

export default function ShiftEditDialog({
    isOpen,
    onClose,
    onSave,
    initialData,
    date,
    isLoading = false
}: ShiftEditDialogProps) {
    const [shiftData, setShiftData] = useState<ShiftEditData>(
        initialData ?? {
            startTime: "09:00",
            endTime: "17:00",
            isHoliday: false
        }
    );

    const handleSave = async () => {
        await onSave(shiftData);
    };

    const handleHolidayChange = (checked: boolean) => {
        setShiftData({
            startTime: checked ? "00:00" : "09:00",
            endTime: checked ? "00:00" : "17:00",
            isHoliday: checked
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>シフトを編集</DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="holiday-switch">休み</Label>
                        <Switch
                            id="holiday-switch"
                            checked={shiftData.isHoliday}
                            onCheckedChange={handleHolidayChange}
                        />
                    </div>

                    {!shiftData.isHoliday && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>開始時間</Label>
                                <select
                                    className="w-full px-3 py-2 border rounded-md bg-white"
                                    value={shiftData.startTime}
                                    onChange={(e) => setShiftData(prev => ({ ...prev, startTime: e.target.value }))}
                                >
                                    {TIME_OPTIONS.map(time => (
                                        <option key={time} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label>終了時間</Label>
                                <select
                                    className="w-full px-3 py-2 border rounded-md bg-white"
                                    value={shiftData.endTime}
                                    onChange={(e) => setShiftData(prev => ({ ...prev, endTime: e.target.value }))}
                                >
                                    {TIME_OPTIONS.map(time => (
                                        <option key={time} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        キャンセル
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                保存中...
                            </div>
                        ) : (
                            "保存"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}