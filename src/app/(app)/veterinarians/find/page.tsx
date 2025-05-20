
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { MapPin, Search, ListFilter } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

interface Vet {
  id: string;
  name: string;
  address: string;
  distance: string;
  rating: number;
  services: string[];
  imageUrl?: string; // Optional image for display
  dataAiHint?: string;
}

const allMockVets: Vet[] = [
    { id: "1", name: "City Animal Hospital", address: "789 Pine St, Anytown", distance: "1.2 miles", rating: 4.5, services: ["General Care", "Surgery", "Dental"], imageUrl: 'https://placehold.co/200x150.png?text=City+Animal+Hospital', dataAiHint: 'animal hospital building' },
    { id: "2", name: "Suburb Veterinary Clinic", address: "101 Maple Dr, Suburbia", distance: "3.5 miles", rating: 4.8, services: ["Wellness Exams", "Vaccinations"], imageUrl: 'https://placehold.co/200x150.png?text=Suburb+Vet+Clinic', dataAiHint: 'veterinary clinic exterior' },
    { id: "3", name: "Green Valley Vets", address: "45 Green Valley Rd, Countryside", distance: "5.0 miles", rating: 4.2, services: ["Holistic Care", "Acupuncture", "General Care"], imageUrl: 'https://placehold.co/200x150.png?text=Green+Valley+Vets', dataAiHint: 'rural vet clinic' },
    { id: "4", name: "Pet Emergency Center", address: "123 Emergency Ln, Anytown", distance: "0.5 miles", rating: 4.9, services: ["Emergency Care", "Critical Care", "Surgery"], imageUrl: 'https://placehold.co/200x150.png?text=Pet+Emergency', dataAiHint: 'emergency vet sign' },
];


export default function FindVeterinarianPage() {
  const [locationSearch, setLocationSearch] = useState('');
  const [servicesSearch, setServicesSearch] = useState('');
  const [displayedVets, setDisplayedVets] = useState<Vet[]>(allMockVets);

  const handleSearch = () => {
    let filteredVets = allMockVets;

    if (locationSearch.trim()) {
      filteredVets = filteredVets.filter(vet =>
        vet.address.toLowerCase().includes(locationSearch.toLowerCase())
      );
    }

    if (servicesSearch.trim()) {
      filteredVets = filteredVets.filter(vet =>
        vet.services.some(service =>
          service.toLowerCase().includes(servicesSearch.toLowerCase())
        )
      );
    }
    setDisplayedVets(filteredVets);
  };

  // Reset to all vets if search terms are cleared (optional behavior)
  useEffect(() => {
    if (!locationSearch.trim() && !servicesSearch.trim()) {
      setDisplayedVets(allMockVets);
    }
  }, [locationSearch, servicesSearch]);


  return (
    <>
      <PageHeader
        title="Find a Veterinarian"
        description="Search for veterinarians in your area. Map integration is a placeholder."
        icon={MapPin}
      />
      <Card className="shadow-lg mb-6">
        <CardHeader>
          <CardTitle>Search Veterinarians</CardTitle>
          <CardDescription>Enter your location or desired services.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <Input
              type="text"
              placeholder="Enter address, city, or zip code..."
              className="flex-grow"
              value={locationSearch}
              onChange={(e) => setLocationSearch(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Filter by services (e.g., dental, emergency)"
              className="flex-grow"
              value={servicesSearch}
              onChange={(e) => setServicesSearch(e.target.value)}
            />
            <Button className="w-full md:w-auto" onClick={handleSearch}>
              <Search className="mr-2 h-4 w-4" /> Search
            </Button>
             <Button variant="outline" className="w-full md:w-auto" disabled>
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
          <CardDescription>
            {displayedVets.length > 0 ? `Showing ${displayedVets.length} veterinarian(s).` : "No veterinarians found matching your criteria."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayedVets.length > 0 ? (
            <div className="space-y-4">
              {displayedVets.map(vet => (
                <Card key={vet.id} className="p-4 flex flex-col sm:flex-row gap-4 hover:bg-secondary/30 transition-colors">
                  <div className="w-full sm:w-1/3 h-40 sm:h-auto bg-muted rounded-md flex items-center justify-center overflow-hidden">
                     <Image src={vet.imageUrl || `https://placehold.co/200x150.png?text=${encodeURIComponent(vet.name)}`} alt={vet.name} width={200} height={150} className="object-cover" data-ai-hint={vet.dataAiHint || "veterinary clinic"} />
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
                    <Link href={`/veterinarians/${vet.id}`}>
                        <Button size="sm" className="mt-3">View Details</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-6">No veterinarians found matching your search criteria. Try a broader search or clear your filters.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
