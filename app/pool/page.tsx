"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { BriefCard } from "@/components/pool/brief-card";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function PoolPage() {
    const [briefs, setBriefs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Create a query against the collection.
        // Note: You might need to create a Firestore index for 'status' + 'createdAt'
        // if you use orderBy. For now, let's just filter by status.
        const q = query(
            collection(db, "briefs"),
            where("status", "==", "open")
            // orderBy("createdAt", "desc") // Un-comment once index is created if needed
        );

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const briefsData: any[] = [];
            querySnapshot.forEach((doc) => {
                briefsData.push({ id: doc.id, ...doc.data() });
            });
            console.log("Current Briefs in Pool: ", briefsData);
            setBriefs(briefsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <ProtectedRoute allowedRoles={['designer', 'admin']}>
            <div className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
                <header className="mb-8 md:mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Design Requests Pool</h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Browse and accept available design briefs. First come, first served.
                    </p>
                </header>

                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <p className="text-muted-foreground animate-pulse">Loading pool...</p>
                    </div>
                ) : briefs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg">
                        <p className="text-muted-foreground">No open briefs at the moment.</p>
                        <p className="text-xs text-muted-foreground mt-1">Chat with the bot on the home page to create one.</p>
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
