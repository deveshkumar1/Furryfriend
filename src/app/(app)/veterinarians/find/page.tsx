
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin, Search, ListFilter } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge'; // Added import

// Mock search results
const mockVets = [
    { id: "1", name: "City Animal Hospital", address: "789 Pine St, Anytown", distance: "1.2 miles", rating: 4.5, services: ["General Care", "Surgery", "Dental"] },
    { id: "2", name: "Suburb Veterinary Clinic", address: "101 Maple Dr, Suburbia", distance: "3.5 miles", rating: 4.8, services: ["Wellness Exams", "Vaccinations"] },
];


export default function FindVeterinarianPage() {
  return (
    <>
      <PageHeader
        title="Find a Veterinarian"
        description="Search for veterinarians in your area using our interactive map and directory."
        icon={MapPin}
      />
      <Card className="shadow-lg mb-6">
        <CardHeader>
          <CardTitle>Search Veterinarians</CardTitle>
          <CardDescription>Enter your location or a vet&apos;s name.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <Input
              type="text"
              placeholder="Enter address, city, or zip code..."
              className="flex-grow"
            />
            <Input
              type="text"
              placeholder="Filter by services (e.g., dental, emergency)"
              className="flex-grow"
            />
            <Button className="w-full md:w-auto">
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
             <Button variant="outline" className="w-full md:w-auto">
                <ListFilter className="mr-2 h-4 w-4" /> Filters
            </Button>
          </div>
          <div className="h-[400px] bg-muted rounded-lg flex items-center justify-center text-muted-foreground overflow-hidden shadow-inner">
            {/* Placeholder for Google Maps integration */}
            <Image src="https://placehold.co/800x400.png?text=Veterinarian+Map+Placeholder" alt="Map Placeholder" width={800} height={400} className="object-cover" data-ai-hint="map placeholder"/>
          </div>
        </CardContent>
      </Card>

       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
          <CardDescription>Veterinarians matching your criteria.</CardDescription>
        </CardHeader>
        <CardContent>
          {mockVets.length > 0 ? (
            <div className="space-y-4">
              {mockVets.map(vet => (
                <Card key={vet.id} className="p-4 flex flex-col sm:flex-row gap-4 hover:bg-secondary/30 transition-colors">
                  <div className="w-full sm:w-1/3 h-40 sm:h-auto bg-muted rounded-md flex items-center justify-center overflow-hidden">
                     <Image src={`https://placehold.co/200x150.png?text=${encodeURIComponent(vet.name)}`} alt={vet.name} width={200} height={150} className="object-cover" data-ai-hint="veterinary clinic" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-primary">{vet.name}</h3>
                    <p className="text-sm text-muted-foreground">{vet.address}</p>
                    <p className="text-sm mt-1"><span className="font-medium">Distance:</span> {vet.distance}</p>
                    <p className="text-sm"><span className="font-medium">Rating:</span> {vet.rating}/5</p>
                    <div className="mt-2">
                      {vet.services.map(service => (
                        <Badge key={service} variant="outline" className="mr-1 mb-1">{service}</Badge>
                      ))}
                    </div>
                     <Button size="sm" className="mt-3">View Details</Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">No veterinarians found matching your search criteria. Try a broader search.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
