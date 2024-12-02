import LinkCard from "@/components/LinkCard";
import { FileSpreadsheet, Calendar, Send, Users } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4 mt-8">
                    <h1 className="text-4xl font-bold text-gray-800">
                        シフト管理システム
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <LinkCard
                        href="/shift/form-send"
                        icon={<FileSpreadsheet className="w-6 h-6 text-gray-600" />}
                        title="シフトの提出フォームの送信"
                        description="シフト提出フォームをLINEグループに送信します"
                    />
                    <LinkCard
                        href="/shift"
                        icon={<Calendar className="w-6 h-6 text-gray-600" />}
                        title="シフトの作成"
                        description="提出された希望シフトから新しいシフトを作成します"
                    />
                    <LinkCard
                        href="/shift/send"
                        icon={<Send className="w-6 h-6 text-gray-600" />}
                        title="作成済みシフトの送信"
                        description="確定したシフトをLINEグループに送信します"
                    />
                    <LinkCard
                        href="/employee/setting"
                        icon={<Users className="w-6 h-6 text-gray-600" />}
                        title="従業員設定"
                        description="従業員情報の追加・編集・削除を行います"
                    />
                </div>
            </div>
        </div>
    );
}
