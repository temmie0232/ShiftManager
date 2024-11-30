import Link from "next/link";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileSpreadsheet, Users, Send, Calendar } from "lucide-react";

export default function HomePage() {
    return (
        <div className="min-h-screen p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mt-8">
                    <h1 className="text-4xl font-bold">
                        シフト管理システム
                    </h1>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                    <Link href="/shift/form-send">
                        <Card>
                            <CardHeader>
                                <div className="w-12 h-12 flex items-center justify-center mb-4">
                                    <FileSpreadsheet className="w-6 h-6" />
                                </div>
                                <CardTitle>シフトの提出フォームの送信</CardTitle>
                                <CardDescription>
                                    シフト提出フォームをLINEグループに送信します
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href="/shift">
                        <Card>
                            <CardHeader>
                                <div className="w-12 h-12 flex items-center justify-center mb-4">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <CardTitle>シフトの作成</CardTitle>
                                <CardDescription>
                                    提出された希望シフトから新しいシフトを作成します
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href="/shift/send">
                        <Card>
                            <CardHeader>
                                <div className="w-12 h-12 flex items-center justify-center mb-4">
                                    <Send className="w-6 h-6" />
                                </div>
                                <CardTitle>作成済みシフトの送信</CardTitle>
                                <CardDescription>
                                    確定したシフトをLINEグループに送信します
                                </CardDescription>
                            </CardHeader>
                        </Card>
                    </Link>

                    <Link href="/employee/setting">
                        <Card>
                            <CardHeader>
                                <div className="w-12 h-12 flex items-center justify-center mb-4">
                                    <Users className="w-6 h-6" />
                                </div>
                                <CardTitle>従業員設定</CardTitle>
                                <CardDescription>
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