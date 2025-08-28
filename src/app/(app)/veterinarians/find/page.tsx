
"use client";

import { useState, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, useJsApiLoader, InfoWindow } from '@react-google-maps/api';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
  imageUrl?: string;
  dataAiHint?: string;
  lat?: number;
  lng?: number;
}

const allMockVets: Vet[] = [];


const mapContainerStyle = {
  width: '100%',
  height: '400px',
};

const defaultCenter = { lat: 34.0701, lng: -118.4441 };

export default function FindVeterinarianPage() {
  // Google Maps API loader
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  });

  const [selectedVet, setSelectedVet] = useState<Vet | null>(null);
  const { user } = useAuth ? useAuth() : { user: null };
  const { toast } = useToast();
  const [locationSearch, setLocationSearch] = useState('');
  const [servicesSearch, setServicesSearch] = useState('');
  const [displayedVets, setDisplayedVets] = useState<Vet[]>([]);
  const [loadingVets, setLoadingVets] = useState(false);
  const [addingVetId, setAddingVetId] = useState<string | null>(null);
  // Add vet to user's saved vets in Firestore
  const handleAddMyVet = async (vet: Vet) => {
    if (!user) {
      toast({ title: 'Not logged in', description: 'Please log in to add a vet.', variant: 'destructive' });
      return;
    }
    setAddingVetId(vet.id);
    try {
      const vetRef = doc(db, 'users', user.uid, 'savedVets', vet.id);
      await setDoc(vetRef, {
        vetId: vet.id,
        name: vet.name,
        address: vet.address,
        rating: vet.rating,
        services: vet.services,
        imageUrl: vet.imageUrl || '',
        addedAt: new Date().toISOString(),
      });
      toast({ title: 'Vet Added', description: `${vet.name} has been added to your vets.` });
    } catch (err) {
      toast({ title: 'Error', description: 'Could not add vet. Please try again.', variant: 'destructive' });
    } finally {
      setAddingVetId(null);
    }
  };

  const handleSearch = async () => {
    setLoadingVets(true);
    setDisplayedVets([]);
    try {
      const res = await fetch(`/api/vets?location=${encodeURIComponent(locationSearch)}`);
      if (!res.ok) throw new Error('Failed to fetch vets');
      const data = await res.json();
      setDisplayedVets(data.vets || []);
    } catch (err) {
      toast({ title: 'Error', description: 'Could not fetch veterinarians. Try a different location.', variant: 'destructive' });
    } finally {
      setLoadingVets(false);
    }
  };
  
  // Optionally, clear results if search is cleared
  useEffect(() => {
    if (!locationSearch.trim()) {
      setDisplayedVets([]);
    }
  }, [locationSearch]);


  return (
    <>
      <PageHeader
        title="Find a Veterinarian"
        description="Search for veterinarians by name, location (address, city, zip), or services. Map integration is a placeholder."
        icon={MapPin}
      />
      <Card className="shadow-lg mb-6">
        <CardHeader>
          <CardTitle>Search Veterinarians</CardTitle>
          <CardDescription>Enter your location, vet name, or desired services.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2 mb-4">
            <Input
              type="text"
              placeholder="Enter address, city, zip, or vet name..."
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
          <div className="h-[250px] md:h-[400px] bg-muted rounded-lg flex items-center justify-center text-muted-foreground overflow-hidden shadow-inner">
            {isLoaded ? (
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={defaultCenter}
                zoom={13}
              >
                {displayedVets.filter(v => v.lat && v.lng).map(vet => (
                  <Marker
                    key={vet.id}
                    position={{ lat: vet.lat!, lng: vet.lng! }}
                    onClick={() => setSelectedVet(vet)}
                  />
                ))}
                {selectedVet && selectedVet.lat && selectedVet.lng && (
                  <InfoWindow
                    position={{ lat: selectedVet.lat, lng: selectedVet.lng }}
                    onCloseClick={() => setSelectedVet(null)}
                  >
                    <div className="min-w-[180px]">
                      <h3 className="font-semibold text-primary mb-1">{selectedVet.name}</h3>
                      <p className="text-xs text-muted-foreground mb-1">{selectedVet.address}</p>
                      <Button size="sm" onClick={() => { handleAddMyVet(selectedVet); setSelectedVet(null); }}>
                        Add as My Vet
                      </Button>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            ) : (
              <span>Loading map...</span>
            )}
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
            {loadingVets ? (
              <p className="text-center text-muted-foreground py-6">Loading veterinarians...</p>
            ) : displayedVets.length > 0 ? (
              <div className="space-y-4">
                {displayedVets.map(vet => (
                  <Card key={vet.id} className="p-4 flex flex-col sm:flex-row gap-4 hover:bg-secondary/30 transition-colors">
                    <div className="w-full sm:w-1/3 h-40 sm:h-auto bg-muted rounded-md flex items-center justify-center overflow-hidden">
                      <Image src={vet.icon || `https://placehold.co/200x150.png?text=${encodeURIComponent(vet.name)}`} alt={vet.name} width={200} height={150} className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-primary">{vet.name}</h3>
                      <p className="text-sm text-muted-foreground">{vet.address}</p>
                      <p className="text-sm mt-1"><span className="font-medium">Rating:</span> {vet.rating || 'N/A'}/5</p>
                      <div className="flex gap-2 mt-3">
                        <Link href={`/veterinarians/${vet.id}`}>
                          <Button size="sm">View Details</Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddMyVet(vet)}
                          disabled={addingVetId === vet.id}
                        >
                          {addingVetId === vet.id ? 'Adding...' : 'Add as My Vet'}
                        </Button>
                      </div>
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
