import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { PawPrint, PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data, replace with actual data fetching
const pets = [
  { id: '1', name: 'Buddy', species: 'Dog', breed: 'Golden Retriever', age: '3 years', imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'golden retriever' },
  { id: '2', name: 'Lucy', species: 'Cat', breed: 'Siamese', age: '5 years', imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'siamese cat' },
  { id: '3', name: 'Charlie', species: 'Dog', breed: 'Poodle', age: '1 year', imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'poodle dog' },
];

export default function PetsPage() {
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
                  src={pet.imageUrl} 
                  alt={pet.name} 
                  layout="fill" 
                  objectFit="cover"
                  data-ai-hint={pet.dataAiHint}
                />
              </div>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-2xl">{pet.name}</CardTitle>
                    <CardDescription>{pet.species} - {pet.breed}</CardDescription>
                  </div>
                  <Badge variant="secondary">{pet.age}</Badge>
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
                <Link href={`/pets/${pet.id}/edit`} className="w-full">
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
