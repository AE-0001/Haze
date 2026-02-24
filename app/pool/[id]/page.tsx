"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Brief } from "@/app/types/chat";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Extend Brief type with Firestore metadata
interface FirestoreBrief extends Brief {
    id: string;
    status: string;
    createdAt?: any;
    designerId?: string;
    assignedAt?: any;
}

export default function BriefDetailPage() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [brief, setBrief] = useState<FirestoreBrief | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchBrief() {
            if (!id) return;
            try {
                const docRef = doc(db, "briefs", id);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    // Cast to FirestoreBrief - assuming data matches structure
                    setBrief({ id: docSnap.id, ...docSnap.data() } as FirestoreBrief);
                } else {
                    setError("Brief not found");
                }
            } catch (err: any) {
                setError(err.message || "Failed to load brief");
            } finally {
                setLoading(false);
            }
        }

        fetchBrief();
    }, [id]);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (error || !brief) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4 bg-zinc-50 dark:bg-zinc-950">
                <AlertCircle className="h-10 w-10 text-red-500" />
                <h1 className="text-xl font-semibold">Error Loading Brief</h1>
                <p className="text-zinc-500">{error}</p>
                <Button onClick={() => router.push("/pool")}>Back to Pool</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/80 backdrop-blur-md px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900/80">
                <div className="mx-auto flex max-w-5xl items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                        onClick={() => router.push("/pool")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Pool
                    </Button>
                    <div className="flex items-center gap-3">
                        <Badge variant={brief.status === 'open' ? 'secondary' : 'default'} className="uppercase">
                            {brief.status}
                        </Badge>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl p-4 md:p-8 space-y-8">

                {/* Main Summary Card */}
                <Card className="border-0 shadow-lg ring-1 ring-zinc-200 dark:ring-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
                    <div className="p-6 md:p-8 pb-0">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-foreground">Project Brief</h1>
                    </div>
                    <CardContent className="p-6 md:p-8 space-y-6">
                        <div>
                            <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 mb-3">Executive Summary</h3>
                            <p className="text-lg leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">{brief.summary}</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Detailed Sections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Design Direction */}
                    <Card className="h-full border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-lg">Core Design Direction</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {brief.core_design_direction?.map((item, i) => (
                                    <Badge key={i} variant="outline" className="px-3 py-1 text-sm bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-800">
                                        {item}
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Visual Language */}
                    <Card className="h-full border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-lg">Visual Language</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="list-disc list-outside ml-4 space-y-2 text-zinc-600 dark:text-zinc-400">
                                {brief.visual_language?.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Colors & Typography */}
                    <Card className="h-full border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-lg">Colors & Typography</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-2">
                                {brief.color_and_typography?.map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-zinc-600 dark:text-zinc-400">
                                        <span className="block mt-1.5 w-1.5 h-1.5 rounded-full bg-pink-500 shrink-0" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Do's and Don'ts */}
                    <Card className="h-full border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle className="text-lg">Guidelines</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="text-xs font-bold uppercase text-emerald-600 mb-2 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Do's
                                </h4>
                                <ul className="list-none space-y-1">
                                    {brief.dos?.map((item, i) => (
                                        <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 pl-4 border-l-2 border-emerald-100 dark:border-emerald-900/30">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h4 className="text-xs font-bold uppercase text-red-500 mb-2 flex items-center gap-1">
                                    <AlertCircle className="w-3 h-3" /> Don'ts
                                </h4>
                                <ul className="list-none space-y-1">
                                    {brief.donts?.map((item, i) => (
                                        <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 pl-4 border-l-2 border-red-100 dark:border-red-900/30">
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Product Specific Notes */}
                {brief.product_specific_notes && (
                    <Card className="border-zinc-200 dark:border-zinc-800">
                        <CardHeader>
                            <CardTitle>Product Specific Requirements</CardTitle>
                            <CardDescription>Detailed requirements for each merchandise item.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Tee */}
                                {brief.product_specific_notes.tee && brief.product_specific_notes.tee.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 border-b pb-2">T-Shirt</h4>
                                        <ul className="space-y-2">
                                            {brief.product_specific_notes.tee.map((note, i) => (
                                                <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded">
                                                    {note}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {/* Jacket */}
                                {brief.product_specific_notes.team_jacket && brief.product_specific_notes.team_jacket.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 border-b pb-2">Team Jacket</h4>
                                        <ul className="space-y-2">
                                            {brief.product_specific_notes.team_jacket.map((note, i) => (
                                                <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded">
                                                    {note}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                                {/* Founder Wear */}
                                {brief.product_specific_notes.founder_wear && brief.product_specific_notes.founder_wear.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 border-b pb-2">Founder Wear</h4>
                                        <ul className="space-y-2">
                                            {brief.product_specific_notes.founder_wear.map((note, i) => (
                                                <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 p-2 rounded">
                                                    {note}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Helper JSON link */}
                <div className="flex justify-end">
                    <Button variant="outline" size="sm" onClick={() => {
                        const blob = new Blob([JSON.stringify(brief, null, 2)], { type: "application/json" });
                        const url = URL.createObjectURL(blob);
                        window.open(url, '_blank');
                    }}>
                        Download Raw JSON
                    </Button>
                </div>

            </main>
        </div>
    );
}
