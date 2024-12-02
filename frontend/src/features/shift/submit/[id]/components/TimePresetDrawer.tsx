import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from "@/components/ui/drawer"
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Plus, Clock, PenSquare, Trash2 } from "lucide-react"
import { useState } from "react";

export type TimePreset = {
    id: string;
    name: string;
    startTime: string;
    endTime: string;
    isFixed?: boolean;
}

interface TimePresetDrawerProps {
    selectedPreset: TimePreset | null;
    onPresetSelect: (preset: TimePreset) => void;
}

// 固定の休みプリセット
const HOLIDAY_PRESET: TimePreset = {
    id: 'holiday',
    name: '休み',
    startTime: '00:00',
    endTime: '00:00',
    isFixed: true,
};

// 時間選択用の選択肢を生成
const TIME_OPTIONS = Array.from({ length: 31 }, (_, i) => {
    const hour = Math.floor(i / 2) + 7;  // 7時から22時
    const minute = i % 2 === 0 ? "00" : "30";
    return `${hour.toString().padStart(2, '0')}:${minute}`;
});

export function TimePresetDrawer({ selectedPreset, onPresetSelect }: TimePresetDrawerProps) {
    // プリセットの状態管理（カスタムプリセットのみ）
    const [presets, setPresets] = useState<TimePreset[]>([
        { id: '1', name: '早番', startTime: '08:00', endTime: '16:00' },
        { id: '2', name: '遅番', startTime: '13:00', endTime: '21:00' },
    ]);

    // 新規作成・編集用の状態
    const [editingPreset, setEditingPreset] = useState<TimePreset | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handlePresetSelect = (preset: TimePreset) => {
        onPresetSelect(preset);
        setIsOpen(false);  // ドロワーを閉じる
    };

    // 選択中のプリセットの表示テキストを生成
    const getSelectedPresetText = () => {
        if (!selectedPreset) return "時間帯を選択";
        if (selectedPreset.id === 'holiday') return "選択中 - 休み";
        return `選択中 - ${selectedPreset.startTime}~${selectedPreset.endTime}`;
    };

    // プリセットの追加・編集
    const handleSavePreset = (preset: TimePreset) => {
        if (preset.id) {
            setPresets(prev => prev.map(p => p.id === preset.id ? preset : p));
        } else {
            const newPreset = {
                ...preset,
                id: Date.now().toString()
            };
            setPresets(prev => [...prev, newPreset]);
        }
        setIsDialogOpen(false);
    };

    // プリセットの削除
    const handleDeletePreset = (id: string) => {
        setPresets(prev => prev.filter(p => p.id !== id));
        setIsDialogOpen(false);
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

                    {/* プリセット一覧（スクロール可能） */}
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
                                        {preset.startTime} ~ {preset.endTime}
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
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingPreset ? '時間帯を編集' : '新しい時間帯を追加'}
                        </DialogTitle>
                        <DialogDescription>
                            時間帯の詳細を入力してください
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            handleSavePreset({
                                id: editingPreset?.id || '',
                                name: formData.get('name') as string,
                                startTime: formData.get('startTime') as string,
                                endTime: formData.get('endTime') as string,
                            });
                        }}
                        className="space-y-4"
                    >
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
                                    defaultValue={editingPreset?.startTime}
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
                                    defaultValue={editingPreset?.endTime}
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
                                >
                                    キャンセル
                                </Button>
                                <Button type="submit">
                                    保存
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </Drawer>
    );
}
