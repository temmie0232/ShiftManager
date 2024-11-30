import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileSpreadsheet, Users, Send, Calendar } from "lucide-react";

export default function HomePage() {
    return (
        // メインコンテナ (グラデーション背景とパディングの設定)
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            {/* コンテンツの最大幅の制限、中央寄せ */}
            <div className="max-w-4xl mx-auto space-y-12">
                {/* ページタイトル */}
                <div className="text-center space-y-4 mt-8">
                    <h1 className="text-4xl font-bold text-gray-800">
                        シフト管理システム
                    </h1>
                </div>

                {/* カードのグリッド表示(モバイル->1列, デスクトップ->2列) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* シフト提出フォーム送信カード */}
                    {/* group classを追加してホバー時の親子関係を制御 */}
                    <Link href="/shift/form-send" className="group">
                        {/* hover効果とトランジションを追加 */}
                        <Card className="h-full border-2 transition-all duration-300 hover:border-gray-400 hover:shadow-xl group-hover:-translate-y-1">
                            <CardHeader>
                                {/* アイコンを含む丸いコンテナ */}
                                {/* ホバー時の背景色変更アニメーション */}
                                <div className="rounded-lg w-12 h-12 flex items-center justify-center bg-gray-100 mb-4 group-hover:bg-gray-200 transition-colors">
                                    <FileSpreadsheet className="w-6 h-6 text-gray-600" />
                                </div>
                                {/* ホバー時のテキストカラー変更 */}
                                <CardTitle className="group-hover:text-gray-900 transition-colors">シフトの提出フォームの送信</CardTitle>
                                <CardDescription className="text-gray-600">
                                    シフト提出フォームをLINEグループに送信します
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href="/shift" className="group">
                        <Card className="h-full border-2 transition-all duration-300 hover:border-gray-400 hover:shadow-xl group-hover:-translate-y-1">
                            <CardHeader>
                                <div className="rounded-lg w-12 h-12 flex items-center justify-center bg-gray-100 mb-4 group-hover:bg-gray-200 transition-colors">
                                    <Calendar className="w-6 h-6 text-gray-600" />
                                </div>
                                <CardTitle className="group-hover:text-gray-900 transition-colors">シフトの作成</CardTitle>
                                <CardDescription className="text-gray-600">
                                    提出された希望シフトから新しいシフトを作成します
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href="/shift/send" className="group">
                        <Card className="h-full border-2 transition-all duration-300 hover:border-gray-400 hover:shadow-xl group-hover:-translate-y-1">
                            <CardHeader>
                                <div className="rounded-lg w-12 h-12 flex items-center justify-center bg-gray-100 mb-4 group-hover:bg-gray-200 transition-colors">
                                    <Send className="w-6 h-6 text-gray-600" />
                                </div>
                                <CardTitle className="group-hover:text-gray-900 transition-colors">作成済みシフトの送信</CardTitle>
                                <CardDescription className="text-gray-600">
                                    確定したシフトをLINEグループに送信します
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href="/employee/setting" className="group">
                        <Card className="h-full border-2 transition-all duration-300 hover:border-gray-400 hover:shadow-xl group-hover:-translate-y-1">
                            <CardHeader>
                                <div className="rounded-lg w-12 h-12 flex items-center justify-center bg-gray-100 mb-4 group-hover:bg-gray-200 transition-colors">
                                    <Users className="w-6 h-6 text-gray-600" />
                                </div>
                                <CardTitle className="group-hover:text-gray-900 transition-colors">従業員設定</CardTitle>
                                <CardDescription className="text-gray-600">
                                    従業員情報の追加・編集・削除を行います
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    );
}