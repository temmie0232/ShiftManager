"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainCard from "@/components/layout/MainCard";
import HomeLink from "@/components/ui/HomeLink";
import IndividualShiftsTab from "@/features/shift/view/IndividualShiftTab";
import AllShiftsTab from "@/components/ui/AllShiftTab";

export default function ShiftViewPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <HomeLink />

                <MainCard
                    title="シフト確認 / 編集"
                    description="提出されたシフトを確認 / 編集(個人タブから)できます"
                >
                    <div className="p-6">
                        <Tabs defaultValue="individual" className="w-full">
                            <TabsList className="w-full mb-6">
                                <TabsTrigger value="individual" className="flex-1">個人</TabsTrigger>
                                <TabsTrigger value="all" className="flex-1">全体</TabsTrigger>
                            </TabsList>

                            <TabsContent value="individual">
                                <IndividualShiftsTab />
                            </TabsContent>

                            <TabsContent value="all">
                                <AllShiftsTab />
                            </TabsContent>
                        </Tabs>
                    </div>
                </MainCard>
            </div>
        </div>
    );
}
