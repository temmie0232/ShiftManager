import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus, Clock, PenSquare, Trash2 } from "lucide-react"
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export type TimePreset = {
    id: string;
    name: string;
    start_time: string;
    end_time: string;
    isFixed?: boolean;
    created_at?: string;
    updated_at?: string;
}

interface TimePresetDrawerProps {
    selectedPreset: TimePreset | null;
    onPresetSelect: (preset: TimePreset) => void;
    employeeId: string;
}

// 固定の休みプリセット
const HOLIDAY_PRESET: TimePreset = {
    id: 'holiday',
    name: '休み',
    start_time: '00:00',
    end_time: '00:00',
    isFixed: true,
};

// 時間選択用の選択肢を生成
const TIME_OPTIONS = Array.from({ length: 31 }, (_, i) => {
    const hour = Math.floor(i / 2) + 7;  // 7時から22時
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, '0')}:${minute}`;
});

export function TimePresetDrawer({ selectedPreset, onPresetSelect, employeeId }: TimePresetDrawerProps) {
    const [presets, setPresets] = useState<TimePreset[]>([]);
    const [editingPreset, setEditingPreset] = useState<TimePreset | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // プリセットの取得
    useEffect(() => {
        if (employeeId) {
            fetchPresets();
        }
    }, [employeeId]);

    const fetchPresets = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/shifts/presets/${employeeId}/`
            );
            if (!response.ok) throw new Error("プリセットの取得に失敗しました");
            const data = await response.json();
            setPresets(data);
        } catch (err) {
            console.error('プリセットの取得エラー:', err);
            toast({
                title: "エラー",
                description: "プリセットの取得に失敗しました",
                variant: "destructive",
            });
        }
    };

    const handlePresetSelect = (preset: TimePreset) => {
        // APIのレスポンスに合わせてキー名を変更
        const formattedPreset = {
            ...preset,
            startTime: preset.start_time,
            endTime: preset.end_time,
        };
        onPresetSelect(formattedPreset);
        setIsOpen(false);
    };

    const getSelectedPresetText = () => {
        if (!selectedPreset) return "時間帯を選択";
        if (selectedPreset.id === 'holiday') return "選択中 - 休み";
        // 時間文字列から秒数を削除
        const startTime = selectedPreset.start_time.slice(0, 5);
        const endTime = selectedPreset.end_time.slice(0, 5);
        return `選択中 - ${startTime}~${endTime}`;
    };

    const handleSavePreset = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData(e.currentTarget);
        const presetData = {
            name: formData.get('name') as string,
            start_time: formData.get('startTime') as string,
            end_time: formData.get('endTime') as string,
        };

        try {
            const url = editingPreset
                ? `${process.env.NEXT_PUBLIC_API_URL}/api/shifts/presets/${employeeId}/${editingPreset.id}/`
                : `${process.env.NEXT_PUBLIC_API_URL}/api/shifts/presets/${employeeId}/`;

            const response = await fetch(url, {
                method: editingPreset ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(presetData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || "プリセットの保存に失敗しました");
            }

            await fetchPresets();
            setIsDialogOpen(false);
            toast({
                title: "成功",
                description: `プリセットを${editingPreset ? '更新' : '作成'}しました`,
            });
        } catch (err) {
            toast({
                title: "エラー",
                description: err instanceof Error ? err.message : "エラーが発生しました",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeletePreset = async (id: string) => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/shifts/presets/${employeeId}/${id}/`,
                { method: 'DELETE' }
            );

            if (!response.ok) throw new Error("プリセットの削除に失敗しました");

            await fetchPresets();
            setIsDialogOpen(false);
            toast({
                title: "成功",
                description: "プリセットを削除しました",
            });
        } catch (err) {
            toast({
                title: "エラー",
                description: err instanceof Error ? err.message : "エラーが発生しました",
                variant: "destructive",
            });
        }
    };

    return (
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
            <DrawerTrigger asChild>
                <Button variant="outline" className="w-full">
                    <Clock className="mr-2 h-4 w-4" />
                    {getSelectedPresetText()}
                </Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>時間帯の選択</DrawerTitle>
                    <DrawerDescription>
                        登録済みの時間帯から選択するか、新しい時間帯を追加してください
                    </DrawerDescription>
                </DrawerHeader>

                <div className="p-4 space-y-4">
                    {/* 休みプリセット */}
                    <div className="border-b pb-4">
                        <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                            <button
                                className="flex-1 text-left"
                                onClick={() => handlePresetSelect(HOLIDAY_PRESET)}
                            >
                                <div className="font-medium">{HOLIDAY_PRESET.name}</div>
                                <div className="text-sm text-gray-500">終日</div>
                            </button>
                        </div>
                    </div>

                    {/* 新規追加ボタン */}
                    <Button
                        onClick={() => {
                            setEditingPreset(null);
                            setIsDialogOpen(true);
                        }}
                        className="w-full"
                    >
                        <Plus className="mr-2 h-4 w-4" />
                        新しい時間帯を追加
                    </Button>

                    {/* プリセット一覧 */}
                    <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                        {presets.map((preset) => (
                            <div
                                key={preset.id}
                                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                            >
                                <button
                                    className="flex-1 text-left"
                                    onClick={() => handlePresetSelect(preset)}
                                >
                                    <div className="font-medium">{preset.name}</div>
                                    <div className="text-sm text-gray-500">
                                        {preset.start_time.slice(0, 5)} ~ {preset.end_time.slice(0, 5)}
                                    </div>
                                </button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingPreset(preset);
                                        setIsDialogOpen(true);
                                    }}
                                >
                                    <PenSquare className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </DrawerContent>

            {/* 編集ダイアログ */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPreset ? '時間帯を編集' : '新しい時間帯を追加'}
                        </DialogTitle>
                        <DialogDescription>
                            時間帯の詳細を入力してください
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSavePreset} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">名前</label>
                            <Input
                                name="name"
                                defaultValue={editingPreset?.name}
                                placeholder="早番"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">開始時間</label>
                                <select
                                    name="startTime"
                                    className="w-full px-3 py-2 border rounded-md bg-white"
                                    defaultValue={editingPreset?.start_time}
                                    required
                                    size={6}
                                >
                                    {TIME_OPTIONS.map(time => (
                                        <option key={time} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">終了時間</label>
                                <select
                                    name="endTime"
                                    className="w-full px-3 py-2 border rounded-md bg-white"
                                    defaultValue={editingPreset?.end_time}
                                    required
                                    size={6}
                                >
                                    {TIME_OPTIONS.map(time => (
                                        <option key={time} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <DialogFooter className="flex justify-between">
                            {editingPreset && !editingPreset.isFixed && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => handleDeletePreset(editingPreset.id)}
                                    disabled={isLoading}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    削除
                                </Button>
                            )}
                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsDialogOpen(false)}
                                    disabled={isLoading}
                                >
                                    キャンセル
                                </Button>
                                <Button type="submit" disabled={isLoading}>
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            保存中...
                                        </div>
                                    ) : (
                                        "保存"
                                    )}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Drawer >
    );
}