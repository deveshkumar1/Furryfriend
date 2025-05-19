
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint, PlusCircle, Edit3, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase'; // Import Firestore instance
import { collection, query, onSnapshot, orderBy, DocumentData } from 'firebase/firestore';
// TODO: Once auth is implemented, add 'where' to filter by userId:
// import { collection, query, where, onSnapshot, orderBy, DocumentData } from 'firebase/firestore';
// import { auth } from '@/lib/firebase'; // Assuming auth is exported from firebase.ts
// import { useAuthState } from 'react-firebase-hooks/auth'; // Optional: for easier auth state management

interface Pet extends DocumentData {
  id: string; // Firestore document ID
  name: string;
  species: string;
  breed?: string;
  age?: string;
  imageUrl?: string;
  dataAiHint?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "unknown";
  color?: string;
  weight?: string;
  notes?: string;
  // userId?: string; // To associate pet with a user
}

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // const [user, loadingAuth, errorAuth] = useAuthState(auth); // Optional: for auth state

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // TODO: Replace with user-specific query once authentication is implemented
    // if (!user && !loadingAuth) {
    //   setIsLoading(false);
    //   // Redirect to login or show message if user is not authenticated
    //   // For now, we'll just not fetch data if no user (or load all for demo)
    //   // To fetch all for demo purposes without auth:
    //   // const q = query(collection(db, "pets"), orderBy("createdAt", "desc"));
    //   setPets([]); // Clear pets if no user
    //   return;
    // }
    // if (loadingAuth) return; // Wait for auth state to load

    // Example: Fetch all pets for now. Replace with user-specific query later.
    const q = query(collection(db, "pets"), orderBy("createdAt", "desc"));
    // const q = query(collection(db, "pets"), where("userId", "==", user.uid), orderBy("createdAt", "desc"));


    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const petsData: Pet[] = [];
      querySnapshot.forEach((doc) => {
        petsData.push({ id: doc.id, ...doc.data() } as Pet);
      });
      setPets(petsData);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching pets: ", err);
      setError("Failed to load pets. Please try again.");
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []); // Add 'user', 'loadingAuth' to dependency array if using useAuthState

  if (isLoading) {
    return (
      <>
        <PageHeader
          title="My Pets"
          description="Manage profiles for all your beloved pets."
          icon={PawPrint}
          action={
            <Link href="/pets/new">
              <Button disabled>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Pet
              </Button>
            </Link>
          }
        />
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
            <CardTitle>Loading Your Pets...</CardTitle>
            <CardDescription>Fetching the latest information.</CardDescription>
          </CardHeader>
        </Card>
      </>
    );
  }

  if (error) {
     return (
      <>
        <PageHeader
          title="My Pets"
          description="Manage profiles for all your beloved pets."
          icon={PawPrint}
           action={
            <Link href="/pets/new">
              <Button>
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Pet
              </Button>
            </Link>
          }
        />
        <Card className="text-center py-12 shadow-lg border-destructive">
          <CardHeader>
            <PawPrint className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle className="text-destructive">Error Loading Pets</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </>
    );
  }


  return (
    <>
      <PageHeader
        title="My Pets"
        description="Manage profiles for all your beloved pets."
        icon={PawPrint}
        action={
          <Link href="/pets/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Pet
            </Button>
          </Link>
        }
      />

      {pets.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <PawPrint className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>No Pets Yet!</CardTitle>
            <CardDescription>Start by adding your first furry friend.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/pets/new">
              <Button size="lg">
                <PlusCircle className="mr-2 h-5 w-5" /> Add Your First Pet
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <Card key={pet.id} className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-48 w-full">
                <Image 
                  src={pet.imageUrl || 'https://placehold.co/300x200.png'} 
                  alt={pet.name} 
                  fill // Use fill instead of layout
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Add sizes prop
                  style={{ objectFit: 'cover' }} // Use style for objectFit
                  data-ai-hint={pet.dataAiHint || pet.species?.toLowerCase() || 'animal'}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/300x200.png';
                    (e.target as HTMLImageElement).dataset.aiHint = 'placeholder animal';
                  }}
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{pet.name}</CardTitle>
                    <CardDescription>{pet.species}{pet.breed ? ` - ${pet.breed}` : ''}</CardDescription>
                  </div>
                  {pet.age && <Badge variant="secondary">{pet.age}</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground truncate">
                  View {pet.name}'s detailed profile, health records, and more.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Link href={`/pets/${pet.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </Link>
                {/* <Link href={`/pets/${pet.id}/edit`} className="w-full"> 
                   <Button className="w-full">
                    <Edit3 className="mr-2 h-4 w-4" /> Edit
                  </Button>
                </Link> */}
                {/* Edit button functionality would require a separate edit page or modal and Firestore update logic */}
                 <Button className="w-full" disabled> {/* Placeholder */}
                    <Edit3 className="mr-2 h-4 w-4" /> Edit
                  </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
