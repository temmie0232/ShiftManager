"use client";

import MainCard from "@/components/layout/MainCard";
import { Button } from "@/components/ui/button";
import HomeLink from "@/components/ui/HomeLink";
import { useRouter } from "next/navigation";
import { Calendar, HandIcon, Wand2 } from "lucide-react";

export default function ShiftCreatePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <HomeLink />

                <MainCard
                    icon={<Calendar className="w-6 h-6 text-gray-600" />}
                    title="シフトの作成方法を選択"
                    description="手動で作成するか、自動で生成するかを選択してください"
                >
                    <div className="p-6 space-y-4">
                        <Button
                            onClick={() => router.push("/shift/create/manual")}
                            className="w-full text-lg bg-white hover:bg-gray-50 text-gray-800 border flex items-center justify-center gap-2 h-24"
                            variant="outline"
                        >
                            <HandIcon className="w-5 h-5" />
                            手動で作成
                        </Button>

                        <Button
                            onClick={() => router.push("/shift/create/auto")}
                            className="w-full text-lg bg-white hover:bg-gray-50 text-gray-800 border flex items-center justify-center gap-2 h-24"
                            variant="outline"
                        >
                            <Wand2 className="w-5 h-5" />
                            自動で生成
                        </Button>
                    </div>
                </MainCard>
            </div>
        </div>
    );
}