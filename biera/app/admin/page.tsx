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
            <div className="container mx-auto py-10">
                <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-4">Loading users...</TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'designer' ? 'default' : 'secondary'}>
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {user.role === "customer" && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => promoteToDesigner(user.id)}
                                                >
                                                    Promote to Designer
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
        </ProtectedRoute>
    );
}
