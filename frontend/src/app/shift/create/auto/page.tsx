import React from 'react';
import { Clock } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import HomeLink from '@/components/ui/HomeLink';

const AutoShiftCreatePage = () => {
    return (
        <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-lg">
                <CardContent className="flex flex-col items-center pt-6 pb-8 px-4">
                    <Clock className="w-16 h-16 text-blue-500 mb-6" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        これから作る
                    </h1>
                    <HomeLink />
                </CardContent>
            </Card>
        </div>
    );
};

export default AutoShiftCreatePage;