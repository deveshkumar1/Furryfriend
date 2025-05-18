import Link from 'next/link';
import Image from 'next/image';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Stethoscope, PlusCircle, Edit3, MapPin, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Mock data
const veterinarians = [
  { id: '1', name: 'Dr. Emily Smith', clinicName: 'Happy Paws Clinic', specialty: 'General Practice', phone: '555-1234', email: 'esmith@happypaws.com', address: '123 Main St, Anytown', imageUrl: 'https://placehold.co/100x100.png', dataAiHint: 'veterinarian portrait' },
  { id: '2', name: 'Dr. John Pawson', clinicName: 'Animal Care Center', specialty: 'Surgery', phone: '555-5678', email: 'jpawson@animalcare.com', address: '456 Oak Ave, Anytown', imageUrl: 'https://placehold.co/100x100.png', dataAiHint: 'vet doctor' },
];

export default function VeterinariansPage() {
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

      {veterinarians.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <Stethoscope className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>No Veterinarians Saved</CardTitle>
            <CardDescription>Find and save your trusted veterinarians here.</CardDescription>
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
          {veterinarians.map((vet) => (
            <Card key={vet.id} className="flex flex-col md:flex-row items-start gap-4 p-6 shadow-lg hover:shadow-xl transition-shadow">
              <Image src={vet.imageUrl} alt={vet.name} width={100} height={100} className="rounded-full border-2 border-primary/30 object-cover" data-ai-hint={vet.dataAiHint} />
              <div className="flex-1">
                <CardHeader className="p-0 mb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">{vet.name}</CardTitle>
                    <Link href={`/veterinarians/${vet.id}/edit`}> {/* Placeholder for edit */}
                       <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                        <Edit3 className="h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                  <CardDescription>{vet.clinicName} - <Badge variant="secondary">{vet.specialty}</Badge></CardDescription>
                </CardHeader>
                <CardContent className="p-0 space-y-1 text-sm">
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {vet.address}</p>
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {vet.phone}</p>
                  <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {vet.email}</p>
                </CardContent>
                <CardFooter className="p-0 mt-4">
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
