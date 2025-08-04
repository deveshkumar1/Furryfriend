
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { PawPrint, Edit3, Trash2, Loader2, AlertTriangle, User } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, DocumentData } from 'firebase/firestore';
import Image from 'next/image';


interface Pet extends DocumentData {
  id: string;
  name: string;
  species: string;
  breed?: string;
  imageUrl?: string;
  dataAiHint?: string;
  userId: string;
  // We should fetch the owner's name separately or denormalize it
  ownerName?: string; 
  ownerEmail?: string;
}

export default function ManagePetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Query to get all pets, ordered by creation time
    const q = query(
      collection(db, "pets"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      // In a real app, we'd fetch owner details for each pet here.
      // For now, we'll just display the userId.
      const recordsData: Pet[] = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as Pet));
      setPets(recordsData);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching ALL pet records: ", err);
      setError("Failed to load pet records. Check browser console for specific Firestore error.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  return (
    <>
      <PageHeader
        title="Manage Pets"
        description="View and manage all pet profiles on the platform."
        icon={PawPrint}
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Pets ({pets.length})</CardTitle>
          <CardDescription>
            A complete list of all pets created by users.
          </CardDescription>
        </CardHeader>
        <CardContent>
           {isLoading ? (
             <div className="text-center py-12">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading pets...</p>
             </div>
           ) : error ? (
            <div className="text-center py-12 text-destructive">
                <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
                <p className="font-semibold">Error Loading Pets</p>
                <p className="text-sm">{error}</p>
             </div>
           ) : pets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pet</TableHead>
                  <TableHead>Species & Breed</TableHead>
                  <TableHead>Owner ID</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pets.map((pet) => (
                  <TableRow key={pet.id}>
                    <TableCell className="font-medium">
                       <Link href={`/pets/${pet.id}`} className="flex items-center gap-3 group">
                          <Image src={pet.imageUrl || 'https://placehold.co/40x40.png'} alt={pet.name} width={40} height={40} className="rounded-md object-cover" />
                          <span className="group-hover:underline text-primary">{pet.name}</span>
                       </Link>
                    </TableCell>
                    <TableCell>
                      <div>{pet.species}</div>
                      <div className="text-xs text-muted-foreground">{pet.breed || 'N/A'}</div>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                           <User className="h-4 w-4 text-muted-foreground"/>
                           <span className="text-xs font-mono">{pet.userId}</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" title="Edit Pet (WIP)" disabled>
                            <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete Pet (WIP)" disabled>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-12">
                <PawPrint className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pets found on the platform.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
