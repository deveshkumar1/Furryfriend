
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint, PlusCircle, Edit3 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useState, useEffect } from 'react';

// Initial mock data if localStorage is empty
const initialMockPets = [
  { id: '1', name: 'Buddy', species: 'Dog', breed: 'Golden Retriever', age: '3 years', imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'golden retriever' },
  { id: '2', name: 'Lucy', species: 'Cat', breed: 'Siamese', age: '5 years', imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'siamese cat' },
  { id: '3', name: 'Charlie', species: 'Dog', breed: 'Poodle', age: '1 year', imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'poodle dog' },
];

interface Pet {
  id: string;
  name: string;
  species: string;
  breed: string;
  age: string;
  imageUrl: string;
  dataAiHint: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "unknown";
  color?: string;
  weight?: string;
  notes?: string;
}

export default function PetsPage() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    try {
      const storedPetsString = localStorage.getItem('pets');
      if (storedPetsString) {
        const storedPets = JSON.parse(storedPetsString);
        // If storedPets is an array and has items, use it, otherwise use initialMockPets
        setPets(Array.isArray(storedPets) && storedPets.length > 0 ? storedPets : initialMockPets);
      } else {
        // If nothing in localStorage, use initialMockPets
        setPets(initialMockPets);
        // Optionally, initialize localStorage with mock data if it's the very first load and you want them persisted
        // localStorage.setItem('pets', JSON.stringify(initialMockPets)); 
      }
    } catch (error) {
      console.error("Failed to load pets from localStorage", error);
      setPets(initialMockPets); // Fallback to mock data on error
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
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
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <PawPrint className="mx-auto h-12 w-12 text-muted-foreground mb-4 animate-pulse" />
            <CardTitle>Loading Pets...</CardTitle>
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
                  layout="fill" 
                  objectFit="cover"
                  data-ai-hint={pet.dataAiHint || pet.species?.toLowerCase() || 'animal'}
                  onError={(e) => {
                    // Fallback if image fails to load
                    (e.target as HTMLImageElement).src = 'https://placehold.co/300x200.png';
                    (e.target as HTMLImageElement).dataset.aiHint = 'placeholder animal';
                  }}
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{pet.name}</CardTitle>
                    <CardDescription>{pet.species} - {pet.breed}</CardDescription>
                  </div>
                  {pet.age && <Badge variant="secondary">{pet.age}</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  View {pet.name}'s detailed profile, health records, and more.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between gap-2">
                <Link href={`/pets/${pet.id}`} className="w-full">
                  <Button variant="outline" className="w-full">
                    View Profile
                  </Button>
                </Link>
                <Link href={`/pets/${pet.id}/edit`} className="w-full"> {/* This page doesn't exist yet */}
                   <Button className="w-full">
                    <Edit3 className="mr-2 h-4 w-4" /> Edit
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

    