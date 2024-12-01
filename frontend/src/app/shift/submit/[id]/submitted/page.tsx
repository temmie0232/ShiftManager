"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Home } from "lucide-react";
import Link from "next/link";

export default function SubmittedPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
            <div className="max-w-2xl mx-auto">
                <Card className="border-2 transition-all duration-300 hover:border-gray-400 hover:shadow-xl">
                    <CardHeader className="space-y-4">
                        <div className="rounded-full w-12 h-12 flex items-center justify-center bg-green-100 mb-4">
                            <Check className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="space-y-2">
                            <CardTitle className="text-2xl font-bold text-center">
                                シフトは提出済みです
                            </CardTitle>
                            <CardDescription className="text-center">
                                今月のシフトはすでに提出されています。
                            </CardDescription>
                        </div>
                    </CardHeader>

                    <CardContent className="flex justify-center p-6">
                        <Link href="/home">
                            <Button className="bg-gray-900">
                                <Home className="mr-2 h-4 w-4" />
                                ホームに戻る
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}