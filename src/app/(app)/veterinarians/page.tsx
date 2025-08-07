
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, PlusCircle, Edit3, MapPin, Phone, Mail, Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, DocumentData, orderBy } from 'firebase/firestore';

interface SavedVet extends DocumentData {
  id: string; // This will be the original vet's ID from the public collection
  name: string;
  clinicName: string;
  specialty: string;
  phone?: string;
  email?: string;
  address?: string;
  imageUrl?: string;
  dataAiHint?: string;
}

export default function VeterinariansPage() {
  const { user, loading: authLoading } = useAuth();
  const [savedVets, setSavedVets] = useState<SavedVet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      setIsLoading(false);
      setError("Please log in to see your saved veterinarians.");
      setSavedVets([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    const q = query(collection(db, `users/${user.uid}/savedVets`), orderBy("name")); // Order by name, or another field

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const vetsData: SavedVet[] = [];
      querySnapshot.forEach((doc) => {
        vetsData.push({ ...doc.data(), id: doc.id } as SavedVet); // Use doc.id as the 'id'
      });
      setSavedVets(vetsData);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching saved veterinarians: ", err);
      setError("Failed to load saved veterinarians. Check console for details (possible missing index or rules issue).");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  if (authLoading || isLoading) {
    return (
      <>
        <PageHeader
          title="My Veterinarians"
          description="Manage your preferred veterinarians and their contact information."
          icon={Stethoscope}
           action={
             <div className="flex gap-2">
              <Link href="/veterinarians/find">
                <Button variant="outline">
                  <MapPin className="mr-2 h-4 w-4" /> Find a New Vet
                </Button>
              </Link>
              <Button disabled>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Vet Manually
              </Button>
            </div>
           }
        />
        <Card className="text-center py-12 shadow-lg">
          <Loader2 className="mx-auto h-12 w-12 text-primary animate-spin mb-4" />
          <CardTitle>Loading Your Veterinarians...</CardTitle>
        </Card>
      </>
    );
  }

  if (error) {
    return (
      <>
      <PageHeader title="My Veterinarians" icon={Stethoscope} />
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-destructive">Error</h2>
        <p className="text-muted-foreground mb-4 px-4 whitespace-pre-wrap">{error}</p>
      </div>
      </>
    );
  }


  return (
    <>
      <PageHeader
        title="My Veterinarians"
        description="Manage your preferred veterinarians and their contact information."
        icon={Stethoscope}
        action={
          <div className="flex gap-2">
            <Link href="/veterinarians/find">
              <Button variant="outline">
                <MapPin className="mr-2 h-4 w-4" /> Find a New Vet
              </Button>
            </Link>
            <Button disabled> {/* Placeholder for Add Vet Manually */}
              <PlusCircle className="mr-2 h-4 w-4" /> Add Vet Manually
            </Button>
          </div>
        }
      />

      {savedVets.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>No Veterinarians Saved</CardTitle>
            <CardDescription>Find and save your trusted veterinarians. You can save them from their profile pages.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/veterinarians/find">
              <Button size="lg">
                <MapPin className="mr-2 h-5 w-5" /> Find a Veterinarian
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
          {savedVets.map((vet) => (
            <Card key={vet.id} className="flex flex-col md:flex-row items-start gap-4 p-6 shadow-lg hover:shadow-xl transition-shadow">
              <Image 
                src={vet.imageUrl || 'https://placehold.co/100x100.png'} 
                alt={vet.name} 
                width={100} 
                height={100} 
                className="rounded-full border-2 border-primary/30 object-cover" 
                data-ai-hint={vet.dataAiHint || 'veterinarian portrait'}
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100.png'; }}
              />
              <div className="flex-1">
                <CardHeader className="p-0 mb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">{vet.name}</CardTitle>
                    {/* Edit button for saved vet could lead to their main profile, or a way to remove from saved list */}
                     <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" disabled> {/* Placeholder for remove or edit saved vet */}
                        <Edit3 className="h-5 w-5" />
                      </Button>
                  </div>
                  <CardDescription>{vet.clinicName} - <Badge variant="secondary">{vet.specialty}</Badge></CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-1 text-sm">
                  {vet.address && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {vet.address}</p>}
                  {vet.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {vet.phone}</p>}
                  {vet.email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {vet.email}</p>}
                </CardContent>
                <CardFooter className="p-0 mt-4">
                   {/* Link to the vet's main profile page (assuming IDs match) */}
                  <Link href={`/veterinarians/${vet.id}`} className="w-full">
                    <Button variant="outline" className="w-full">View Details & Schedule</Button>
                  </Link>
                </CardFooter>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
