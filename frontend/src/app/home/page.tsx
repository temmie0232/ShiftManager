import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileSpreadsheet, Users, Send, Calendar } from "lucide-react";

export default function HomePage() {
    return (
        // メインコンテナ (グラデーション背景とパディングの設定)
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            {/* コンテンツの最大幅の制限、中央寄せ */}
            <div className="max-w-4xl mx-auto">
                {/* ページタイトル */}
                <div className="text-center mt-8">
                    <h1 className="text-4xl font-bold text-gray-800">
                        シフト管理システム
                    </h1>
                    <p className="text-gray-600">効率的なシフト管理をサポートします</p>
                </div>

                {/* カードのグリッド表示(モバイル->1列, デスクトップ->2列) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                    {/* シフト提出フォーム送信カード */}
                    <Link href="/shift/form-send">
                        <Card className="border-2 shadow-md">
                            <CardHeader>
                                {/* アイコンを含む丸いコンテナ */}
                                <div className="rounded-lg w-12 h-12 flex items-center justify-center bg-gray-100 mb-4">
                                    <FileSpreadsheet className="w-6 h-6 text-gray-600" />
                                </div>
                                <CardTitle className="text-gray-800">シフトの提出フォームの送信</CardTitle>
                                <CardDescription className="text-gray-600">
                                    シフト提出フォームをLINEグループに送信します
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href="/shift">
                        <Card className="border-2 shadow-md">
                            <CardHeader>
                                <div className="rounded-lg w-12 h-12 flex items-center justify-center bg-gray-100 mb-4">
                                    <Calendar className="w-6 h-6 text-gray-600" />
                                </div>
                                <CardTitle className="text-gray-800">シフトの作成</CardTitle>
                                <CardDescription className="text-gray-600">
                                    提出された希望シフトから新しいシフトを作成します
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href="/shift/send">
                        <Card className="border-2 shadow-md">
                            <CardHeader>
                                <div className="rounded-lg w-12 h-12 flex items-center justify-center bg-gray-100 mb-4">
                                    <Send className="w-6 h-6 text-gray-600" />
                                </div>
                                <CardTitle className="text-gray-800">作成済みシフトの送信</CardTitle>
                                <CardDescription className="text-gray-600">
                                    確定したシフトをLINEグループに送信します
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href="/employee/setting">
                        <Card className="border-2 shadow-md">
                            <CardHeader>
                                <div className="rounded-lg w-12 h-12 flex items-center justify-center bg-gray-100 mb-4">
                                    <Users className="w-6 h-6 text-gray-600" />
                                </div>
                                <CardTitle className="text-gray-800">従業員設定</CardTitle>
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