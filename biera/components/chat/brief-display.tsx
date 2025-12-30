import { useState } from "react";
import { Brief } from "@/app/types/chat";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileJson, Eye, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BriefDisplayProps {
    brief: Brief;
}

export function BriefDisplay({ brief }: BriefDisplayProps) {
    const [showJson, setShowJson] = useState(false);

    return (
        <Card className="mt-6 w-full max-w-full overflow-hidden border-0 shadow-xl bg-white rounded-xl ring-1 ring-stone-200/50 p-0 gap-0 dark:bg-zinc-900 dark:ring-zinc-800/50">
            {/* Dark Header */}
            <div className="bg-black text-white p-5 flex items-start justify-between dark:bg-zinc-950 dark:text-zinc-100">
                <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-lg font-bold tracking-tight">
                            Merch Brief Summary
                        </h3>
                    </div>
                    <p className="text-stone-400 text-xs pl-7 dark:text-zinc-500">
                        High-level overview generated for the customer.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowJson(!showJson)}
                    className="gap-2 text-xs font-semibold h-9 rounded-full bg-transparent text-white border-stone-700 hover:bg-stone-800 hover:text-white hover:border-stone-600 transition-all dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                    {showJson ? (
                        <>
                            <ArrowLeft className="h-4 w-4" />
                            Back
                        </>
                    ) : (
                        <>
                            <Eye className="h-4 w-4" />
                            View JSON
                        </>
                    )}
                </Button>
            </div>

            <CardContent className="p-0 relative bg-white dark:bg-zinc-900">
                <AnimatePresence mode="wait">
                    {!showJson ? (
                        <motion.div
                            key="summary"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="p-8 text-[15px] leading-relaxed text-stone-600 font-medium dark:text-zinc-300"
                        >
                            <p className="whitespace-pre-wrap">{brief.summary}</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="json"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="bg-white dark:bg-zinc-900"
                        >
                            <div className="p-4 border-b border-stone-100 flex items-center gap-2 text-stone-900 text-xs font-bold uppercase tracking-wider bg-stone-50/50 dark:bg-zinc-950/50 dark:border-zinc-800 dark:text-zinc-400">
                                <FileJson className="h-4 w-4 text-black dark:text-zinc-400" />
                                Raw JSON Data
                            </div>
                            <ScrollArea className="h-[300px] w-full bg-stone-50/30 dark:bg-zinc-950/30">
                                <div className="p-6">
                                    <pre className="text-xs font-mono text-stone-600 whitespace-pre-wrap break-words leading-relaxed custom-json-theme dark:text-zinc-400">
                                        {JSON.stringify(brief, null, 2)}
                                    </pre>
                                </div>
                            </ScrollArea>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
