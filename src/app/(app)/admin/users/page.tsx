
"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Edit3, Trash2, Loader2, AlertTriangle, PlusCircle, Search, XCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, DocumentData } from 'firebase/firestore';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';


interface UserProfile extends DocumentData {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  isAdmin?: boolean;
  createdAt: any; // Firestore Timestamp
  avatarUrl?: string;
}

const getInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase();
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(db, "users"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const recordsData: UserProfile[] = querySnapshot.docs.map(doc => ({ 
        uid: doc.id, 
        ...doc.data() 
      } as UserProfile));
      setUsers(recordsData);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching ALL user records: ", err);
      setError("Failed to load user records. Check browser console for specific Firestore error (likely a missing index or permission issue).");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return users;
    return users.filter(user =>
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      (user.phone && user.phone.toLowerCase().includes(term))
    );
  }, [users, searchTerm]);
  
  return (
    <>
      <PageHeader
        title="Manage Users"
        description="View, edit, and manage all user accounts on the platform."
        icon={Users}
        action={
          <Button disabled>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New User
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            A complete list of all registered users.
          </CardDescription>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by name, email, or phone..." 
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchTerm('')}
                >
                    <XCircle className="h-5 w-5 text-muted-foreground" />
                </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
           {isLoading ? (
             <div className="text-center py-12">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading users...</p>
             </div>
           ) : error ? (
            <div className="text-center py-12 text-destructive">
                <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
                <p className="font-semibold">Error Loading Users</p>
                <p className="text-sm">{error}</p>
             </div>
           ) : filteredUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined On</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.uid}>
                    <TableCell className="font-medium flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <span>{user.name}</span>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>
                      {user.isAdmin ? <Badge variant="destructive">Admin</Badge> : <Badge variant="secondary">User</Badge>}
                    </TableCell>
                    <TableCell>
                      {user.createdAt?.toDate ? format(user.createdAt.toDate(), "MMM dd, yyyy") : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" title="Edit User (WIP)" disabled>
                            <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete User (WIP)" disabled>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                 <p className="text-muted-foreground font-semibold">No Users Found</p>
                {searchTerm ? (
                    <p className="text-sm text-muted-foreground">No users match your search for "{searchTerm}".</p>
                ) : (
                    <p className="text-sm text-muted-foreground">There are no users on the platform yet.</p>
                )}
             </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
