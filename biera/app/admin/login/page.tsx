"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent, CardDescription, CardTitle } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (!userDoc.exists() || userDoc.data().role !== "admin") {
                throw new Error("Access Denied: You do not have admin privileges.");
            }

            router.push("/admin");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to login");
            // Force logout if they managed to auth but aren't admin (so they don't get stuck in logged-in state on this page)
            auth.signOut();
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-zinc-950 p-4">
            <Card className="w-full max-w-sm border-zinc-800 bg-zinc-900 text-zinc-100">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 bg-primary/10 p-3 rounded-full w-fit">
                        <ShieldCheck className="w-8 h-8 text-primary" />
                    </div>
                    <CardTitle className="text-2xl tracking-tight">Admin Portal</CardTitle>
                    <CardDescription className="text-zinc-400">Restricted Access only</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="grid gap-4">
                        <div className="grid gap-2">
                            <label htmlFor="email">Admin Email</label>
                            <Input
                                id="email"
                                type="email"
                                required
                                className="bg-zinc-800 border-zinc-700 text-zinc-100 focus-visible:ring-primary"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="grid gap-2">
                            <label htmlFor="password">Password</label>
                            <Input
                                id="password"
                                type="password"
                                required
                                className="bg-zinc-800 border-zinc-700 text-zinc-100 focus-visible:ring-primary"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <Button type="submit" className="w-full" variant="default" disabled={loading}>
                            {loading ? "Authenticating..." : "Enter Portal"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
