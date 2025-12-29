import { useState } from "react";
import { Brief } from "@/app/types/chat";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileJson, Eye, EyeOff } from "lucide-react";

interface BriefDisplayProps {
    brief: Brief;
}

export function BriefDisplay({ brief }: BriefDisplayProps) {
    const [showJson, setShowJson] = useState(false);

    return (
        <Card className="mt-6 border-stone-200 shadow-md bg-white/95 backdrop-blur-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
            <CardHeader className="bg-gradient-to-r from-indigo-50/50 to-pink-50/50 border-b border-indigo-100/50 pb-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold tracking-tight text-stone-900">
                            Merch Brief Summary
                        </CardTitle>
                        <CardDescription className="text-stone-500">
                            High-level overview for the customer.
                        </CardDescription>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowJson(!showJson)}
                        className="gap-2 text-xs font-semibold h-8 bg-white"
                    >
                        {showJson ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        {showJson ? "Hide JSON" : "View JSON"}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="p-0">
                <div className="p-6 text-sm leading-relaxed text-stone-700">
                    {brief.summary}
                </div>

                {showJson && (
                    <div className="border-t border-stone-100 bg-stone-50/50 p-4">
                        <div className="flex items-center gap-2 mb-2 text-stone-500 text-xs font-medium uppercase tracking-wider">
                            <FileJson className="h-4 w-4" />
                            Raw JSON Data
                        </div>
                        <ScrollArea className="h-[300px] w-full rounded-md border border-stone-200 bg-white">
                            <pre className="p-4 text-xs font-mono text-stone-600">
                                {JSON.stringify(brief, null, 2)}
                            </pre>
                        </ScrollArea>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
