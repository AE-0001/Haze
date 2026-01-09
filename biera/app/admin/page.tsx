"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

type UserData = {
    id: string;
    email: string;
    role: string;
};

export default function AdminPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "users"));
                const usersData: UserData[] = [];
                querySnapshot.forEach((doc) => {
                    // @ts-ignore
                    usersData.push({ id: doc.id, ...doc.data() });
                });
                setUsers(usersData);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const promoteToDesigner = async (userId: string) => {
        try {
            await updateDoc(doc(db, "users", userId), { role: "designer" });
            setUsers(users.map(u => u.id === userId ? { ...u, role: "designer" } : u));
        } catch (error) {
            console.error("Error promoting user:", error);
        }
    };

    return (
        <ProtectedRoute allowedRoles={["admin"]}>
            <div className="container mx-auto py-6 px-4 md:py-10 md:px-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    {/* Future: Add search/filter here if needed */}
                </div>

                <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-[200px] md:w-auto">Email</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">Loading users...</TableCell>
                                    </TableRow>
                                ) : (
                                    users.map((user) => (
                                        <TableRow key={user.id} className="transition-colors hover:bg-muted/50">
                                            <TableCell className="font-medium">{user.email}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={user.role === 'admin' ? 'destructive' : user.role === 'designer' ? 'default' : 'secondary'}
                                                    className="capitalize"
                                                >
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {user.role === "customer" && (
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-primary hover:text-primary/80 hover:bg-primary/10"
                                                        onClick={() => promoteToDesigner(user.id)}
                                                    >
                                                        Promote
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
