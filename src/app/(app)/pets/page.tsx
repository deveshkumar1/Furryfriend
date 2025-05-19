
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint, PlusCircle, Edit3, Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, DocumentData } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface Pet extends DocumentData {
  id: string;
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
  userId?: string;
  createdAt?: any; // To match Firestore timestamp for ordering
}

export default function PetsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      setIsLoading(false);
      setPets([]);
      setError("User not authenticated. Please log in to see your pets.");
      return;
    }

    if (!user.uid) {
        setIsLoading(false);
        setPets([]);
        setError("User authenticated, but UID is missing. Cannot fetch pets.");
        console.error("AuthContext user object is present, but user.uid is missing:", user);
        return;
    }

    setIsLoading(true);
    setError(null);

    console.log(`Attempting to fetch pets for user ID: ${user.uid}`);

    const q = query(
      collection(db, "pets"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const petsData: Pet[] = [];
      querySnapshot.forEach((doc) => {
        petsData.push({ id: doc.id, ...doc.data() } as Pet);
      });
      setPets(petsData);
      setIsLoading(false);
      console.log("Pets loaded successfully:", petsData);
    }, (err) => {
      console.error("Firestore error in onSnapshot (PetsPage):", err); // Detailed error log
      setError(`Error loading pets. Firestore error: ${err.name} - ${err.message}. Check browser console for full details (may include index creation link or permission issues).`);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  if (authLoading || isLoading) {
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

  if (!user && !authLoading) {
     return (
      <>
      <PageHeader
        title="My Pets"
        description="Manage profiles for all your beloved pets."
        icon={PawPrint}
      />
      <Card className="text-center py-12 shadow-lg">
        <CardHeader>
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>Please log in to view your pets.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button onClick={() => router.push('/')}>Go to Login</Button>
        </CardContent>
      </Card>
      </>
    );
  }


  if (error) {
     return (
      <>
        <PageHeader
          title="Error"
          description="Could not load your pets."
          icon={AlertTriangle}
        />
        <Card className="text-center py-12 shadow-lg border-destructive">
          <CardHeader>
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <CardTitle className="text-destructive">Error Loading Pets</CardTitle>
            <CardDescription>{error}</CardDescription> {/* This will now display the more detailed Firestore error name/message */}
          </CardHeader>
           <CardContent>
            <Button onClick={() => router.push('/dashboard')}>Go to Dashboard</Button>
          </CardContent>
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
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
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

