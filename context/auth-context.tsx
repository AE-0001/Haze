"use client";

import { createContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

type UserRole = "customer" | "designer" | "admin" | null;

interface AuthContextType {
    user: User | null;
    role: UserRole;
    loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setLoading(true);
            if (currentUser) {
                setUser(currentUser);
                // Fetch role from Firestore
                try {
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        setRole(userDoc.data().role as UserRole);
                    } else {
                        // Fallback if doc doesn't exist (e.g. might be created shortly after signup)
                        setRole("customer");
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setRole("customer"); // Default to safest role
                }
            } else {
                setUser(null);
                setRole(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, role, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
