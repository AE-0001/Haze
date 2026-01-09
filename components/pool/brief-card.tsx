"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { runTransaction, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type Brief = {
    id: string;
    summary: string;
    core_design_direction: string[];
    visual_language: string[];
    status: string;
    // ... other fields if needed for display
};

export function BriefCard({ brief }: { brief: Brief }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAccept = async () => {
        setLoading(true);
        setError(null);
        try {
            await runTransaction(db, async (transaction) => {
                const briefRef = doc(db, "briefs", brief.id);
                const briefDoc = await transaction.get(briefRef);

                if (!briefDoc.exists()) {
                    throw new Error("Brief does not exist!");
                }

                const data = briefDoc.data();
                if (data.status !== "open") {
                    throw new Error("This brief has already been accepted by another designer.");
                }

                // In a real app, you'd use the current user's ID
                const fakeUserId = "designer-123";

                transaction.update(briefRef, {
                    status: "assigned",
                    designerId: fakeUserId,
                    assignedAt: new Date(),
                });
            });
            console.log("Brief accepted successfully!");
        } catch (e: any) {
            console.error("Transaction failed: ", e);
            setError(e.message || "Failed to accept brief");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-zinc-200/50 dark:border-zinc-800">
            <CardHeader>
                <div className="flex justify-between items-center mb-2">
                    <Badge variant="outline" className="uppercase text-xs tracking-wider">
                        {brief.status}
                    </Badge>
                </div>
                <CardTitle className="text-xl">Design Brief</CardTitle>
                <CardDescription className="line-clamp-2">
                    {brief.summary}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Core Direction</h4>
                        <div className="flex flex-wrap gap-1">
                            {brief.core_design_direction?.slice(0, 2).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                            ))}
                            {brief.core_design_direction?.length > 2 && (
                                <Badge variant="secondary" className="text-xs">+{brief.core_design_direction.length - 2}</Badge>
                            )}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">Visual Language</h4>
                        <p className="text-sm text-foreground/80 line-clamp-2">{brief.visual_language?.join(", ")}</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-2">
                {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
                <Button
                    className="w-full"
                    onClick={handleAccept}
                    disabled={loading || brief.status !== 'open'}
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {brief.status === 'open' ? 'Accept Brief' : 'Assigned (Closed)'}
                </Button>
            </CardFooter>
        </Card>
    );
}
