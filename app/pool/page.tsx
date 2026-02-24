"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { BriefCard } from "@/components/pool/brief-card";
import { ProtectedRoute } from "@/components/auth/protected-route";

import { Briefcase, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PoolPage() {
    const [briefs, setBriefs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showMyBriefs, setShowMyBriefs] = useState(false);

    useEffect(() => {
        setLoading(true);
        let q;

        if (showMyBriefs) {
            // Fake user ID for now, as per brief-card.tsx
            const fakeUserId = "designer-123";
            q = query(
                collection(db, "briefs"),
                where("designerId", "==", fakeUserId),
                where("status", "==", "assigned")
            );
        } else {
            q = query(
                collection(db, "briefs"),
                where("status", "==", "open")
            );
        }

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const briefsData: any[] = [];
            querySnapshot.forEach((doc) => {
                briefsData.push({ id: doc.id, ...doc.data() });
            });
            console.log("Briefs Data: ", briefsData);
            setBriefs(briefsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [showMyBriefs]);

    return (
        <ProtectedRoute allowedRoles={['designer', 'admin']}>
            <div className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
                <header className="mb-8 md:mb-12 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                            {showMyBriefs ? "My Accepted Briefs" : "Design Requests Pool"}
                        </h1>
                        <p className="text-muted-foreground mt-2 text-lg">
                            {showMyBriefs
                                ? "Briefs you have accepted and are working on."
                                : "Browse and accept available design briefs. First come, first served."}
                        </p>
                    </div>
                    <Button
                        onClick={() => setShowMyBriefs(!showMyBriefs)}
                        variant="outline"
                        className="gap-2"
                    >
                        {showMyBriefs ? (
                            <>
                                <LayoutGrid className="w-4 h-4" />
                                Browse Pool
                            </>
                        ) : (
                            <>
                                <Briefcase className="w-4 h-4" />
                                My Briefs
                            </>
                        )}
                    </Button>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground animate-pulse">Loading...</p>
                    </div>
                ) : briefs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg">
                        <p className="text-muted-foreground">
                            {showMyBriefs ? "You haven't accepted any briefs yet." : "No open briefs at the moment."}
                        </p>
                        {!showMyBriefs && (
                            <p className="text-xs text-muted-foreground mt-1">Chat with the bot on the home page to create one.</p>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {briefs.map((brief) => (
                            <BriefCard key={brief.id} brief={brief} />
                        ))}
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
