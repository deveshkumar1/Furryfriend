
"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { PawPrint, Edit3, Trash2, Loader2, AlertTriangle, User, Search, XCircle } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, onSnapshot, orderBy, DocumentData, getDocs, where, doc, deleteDoc } from 'firebase/firestore';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';


interface Pet extends DocumentData {
  id: string;
  name: string;
  species: string;
  breed?: string;
  imageUrl?: string;
  dataAiHint?: string;
  userId: string;
  ownerName?: string; 
  ownerEmail?: string;
  ownerAvatarUrl?: string;
}

interface UserProfile extends DocumentData {
    uid: string;
    name: string;
    email: string;
    avatarUrl?: string;
}

const getInitials = (name?: string) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase();
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
};

export default function ManagePetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const petsQuery = query(
      collection(db, "pets"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(petsQuery, async (petsSnapshot) => {
      if (petsSnapshot.empty) {
        setPets([]);
        setIsLoading(false);
        return;
      }
      
      const petRecords = petsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pet));
      // Guard against empty userIds array for "in" query
      const userIds = [...new Set(petRecords.map(pet => pet.userId))].filter(Boolean);

      if (userIds.length === 0) {
        setPets(petRecords.map(p => ({ ...p, ownerName: 'Unknown User', ownerEmail: 'N/A' })));
        setIsLoading(false);
        return;
      }

      // Fetch user data for all unique user IDs
      try {
        const usersQuery = query(collection(db, "users"), where("uid", "in", userIds));
        const usersSnapshot = await getDocs(usersQuery);
        const usersMap = new Map<string, UserProfile>();
        usersSnapshot.forEach(doc => {
            const userData = doc.data() as UserProfile;
            usersMap.set(userData.uid, userData);
        });

        // Combine pet data with owner data
        const enrichedPets = petRecords.map(pet => {
          const owner = usersMap.get(pet.userId);
          return {
            ...pet,
            ownerName: owner?.name || 'Unknown User',
            ownerEmail: owner?.email || 'N/A',
            ownerAvatarUrl: owner?.avatarUrl,
          };
        });

        setPets(enrichedPets);
      } catch (err: any) {
         console.error("Error fetching user details for pets: ", err);
         setPets(petRecords.map(p => ({ ...p, ownerName: 'Unknown User', ownerEmail: 'N/A' })));
         setError("Failed to load full owner details for some pets. Displaying basic info.");
      } finally {
         setIsLoading(false);
      }
      
    }, (err) => {
      console.error("Error fetching ALL pet records: ", err);
      setError("Failed to load pet records. Check browser console for specific Firestore error.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const filteredPets = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (!term) return pets;
    return pets.filter(pet => 
      pet.name.toLowerCase().includes(term) ||
      pet.ownerName?.toLowerCase().includes(term)
    );
  }, [pets, searchTerm]);

  const handleDeletePet = async (petId: string) => {
    try {
      await deleteDoc(doc(db, "pets", petId));
      toast({
        title: "Pet Deleted",
        description: "The pet profile has been successfully deleted.",
      });
    } catch (err) {
      console.error("Error deleting pet:", err);
      toast({
        title: "Error",
        description: "Could not delete the pet profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <PageHeader
        title="Manage Pets"
        description="View and manage all pet profiles on the platform."
        icon={PawPrint}
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>All Pets ({filteredPets.length})</CardTitle>
          <CardDescription>
            A complete list of all pets created by users.
          </CardDescription>
           <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Search by pet name or owner name..." 
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
                <p className="text-muted-foreground">Loading pets...</p>
             </div>
           ) : error ? (
            <div className="text-center py-12 text-destructive">
                <AlertTriangle className="mx-auto h-12 w-12 mb-4" />
                <p className="font-semibold">Error Loading Pets</p>
                <p className="text-sm">{error}</p>
             </div>
           ) : filteredPets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pet</TableHead>
                  <TableHead>Species & Breed</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPets.map((pet) => (
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
                           <Avatar className="h-8 w-8">
                                <AvatarImage src={pet.ownerAvatarUrl} />
                                <AvatarFallback>{getInitials(pet.ownerName)}</AvatarFallback>
                           </Avatar>
                           <div>
                                <Button 
                                    variant="link" 
                                    className="p-0 h-auto font-medium text-sm text-primary"
                                    onClick={() => setSearchTerm(pet.ownerName || '')}
                                >
                                  {pet.ownerName}
                                </Button>
                                <div className="text-xs text-muted-foreground">{pet.ownerEmail}</div>
                           </div>
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <Link href={`/pets/${pet.id}`} passHref>
                          <Button variant="ghost" size="icon" title="Edit Pet">
                              <Edit3 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" title="Delete Pet" className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the pet profile for <span className="font-bold">{pet.name}</span>.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeletePet(pet.id)}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
             <div className="text-center py-12">
                <PawPrint className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground font-semibold">No Pets Found</p>
                {searchTerm ? (
                    <p className="text-sm text-muted-foreground">No pets match your search for "{searchTerm}".</p>
                ) : (
                    <p className="text-sm text-muted-foreground">There are no pets on the platform yet.</p>
                )}
             </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
