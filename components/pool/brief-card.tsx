"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { runTransaction, doc } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

type Brief = {
    id: string;
    summary: string;
    core_design_direction: string[];
    visual_language: string[];
    status: string;
};

export function BriefCard({ brief }: { brief: Brief }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

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
                    throw new Error("This brief has already been accepted.");
                }

                transaction.update(briefRef, {
                    status: "assigned",
                    designerId: "designer-123",
                    assignedAt: new Date(),
                });
            });

            router.push(`/pool/${brief.id}`);
        } catch (e: any) {
            setError(e.message || "Failed to accept brief");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card
            className="
        w-full
        h-full
        flex
        flex-col
        overflow-visible
        transition-all
        duration-300
        hover:-translate-y-1
        hover:shadow-lg
        border-zinc-200/50
        dark:border-zinc-800
      "
        >
            {/* HEADER */}
            <CardHeader className="">
                <div className="flex justify-between items-center mb-2">
                    <Badge
                        variant={brief.status === "open" ? "outline" : "secondary"}
                        className="uppercase text-xs tracking-wider"
                    >
                        {brief.status}
                    </Badge>
                </div>

                <CardTitle className="text-xl line-clamp-1 text-foreground">
                    Project Brief
                </CardTitle>

                <CardDescription className="line-clamp-2 min-h-[40px] text-muted-foreground">
                    {brief.summary}
                </CardDescription>
            </CardHeader>

            {/* CONTENT */}
            <CardContent className="flex-grow pt-6">
                <div className="space-y-4">
                    <div>
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                            Core Direction
                        </h4>
                        <div className="flex flex-wrap gap-1">
                            {brief.core_design_direction?.slice(0, 2).map((tag, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                    {tag}
                                </Badge>
                            ))}
                            {brief.core_design_direction?.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                    +{brief.core_design_direction.length - 2}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>

            {/* FOOTER */}
            <CardFooter className="mt-auto flex flex-col gap-2">
                {error && (
                    <p className="text-xs text-red-500 font-medium w-full text-center">
                        {error}
                    </p>
                )}

                <div className="grid grid-cols-2 gap-2 w-full">
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/pool/${brief.id}`)}
                    >
                        View Details
                    </Button>

                    <Button
                        onClick={handleAccept}
                        disabled={loading || brief.status !== "open"}
                        variant={brief.status === "open" ? "default" : "secondary"}
                    >
                        {loading && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {brief.status === "open" ? "Accept" : "Assigned"}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
