"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
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

const mapContainerStyle = {
	width: '100%',
	height: '100%',
	minHeight: '300px',
};

const defaultCenter = { lat: 34.0701, lng: -118.4441 };

function getBoundsForVets(vets: Vet[]) {
	const bounds = new window.google.maps.LatLngBounds();
	let hasValid = false;
	vets.forEach((vet) => {
		if (vet.lat && vet.lng) {
			bounds.extend({ lat: vet.lat, lng: vet.lng });
			hasValid = true;
		}
	});
	return hasValid ? bounds : null;
}

export default function FindVeterinarianPage() {
	const { isLoaded } = useJsApiLoader({
		googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
	});
	const mapRef = useRef<google.maps.Map | null>(null);
	const [mapCenter, setMapCenter] = useState(defaultCenter);
	const [selectedVet, setSelectedVet] = useState<Vet | null>(null);
	const { user } = useAuth ? useAuth() : { user: null };
	const { toast } = useToast();
	const [locationSearch, setLocationSearch] = useState('');
	const [servicesSearch, setServicesSearch] = useState('');
	const [displayedVets, setDisplayedVets] = useState<Vet[]>([]);
	const [loadingVets, setLoadingVets] = useState(false);
	const [addingVetId, setAddingVetId] = useState<string | null>(null);
	const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

	// Get user location on mount
	useEffect(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(pos) => {
					setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
				}
			);
		}
	}, []);

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
						services: Array.isArray(vet.services) ? vet.services : [],
						imageUrl: vet.imageUrl || '',
						addedAt: new Date().toISOString(),
					});
			toast({ title: 'Vet Added', description: `${vet.name} has been added to your vets.` });
			} catch (err) {
				let errorMsg = 'Could not add vet. Please try again.';
				if (err instanceof Error) {
					errorMsg += `\n${err.message}`;
				} else if (typeof err === 'string') {
					errorMsg += `\n${err}`;
				} else if (err && typeof err === 'object') {
					errorMsg += `\n${JSON.stringify(err)}`;
				}
				toast({ title: 'Error', description: errorMsg, variant: 'destructive' });
				// Also log to console for developer
				// eslint-disable-next-line no-console
				console.error('Add vet error:', err);
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
			// Center map on results
			if (isLoaded && data.vets && data.vets.length > 0 && mapRef.current && window.google) {
				const bounds = getBoundsForVets(data.vets);
				if (bounds) {
					mapRef.current.fitBounds(bounds);
				} else if (data.vets[0].lat && data.vets[0].lng) {
					setMapCenter({ lat: data.vets[0].lat, lng: data.vets[0].lng });
				}
			}
		} catch (err) {
			toast({ title: 'Error', description: 'Could not fetch veterinarians. Try a different location.', variant: 'destructive' });
		} finally {
			setLoadingVets(false);
		}
	};

		const handleFindNearMe = () => {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(
					(pos) => {
						const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
						setMapCenter(coords);
						setUserLocation(coords);
					},
					() => {
						toast({ title: 'Location Error', description: 'Could not get your location.', variant: 'destructive' });
					}
				);
			} else {
				toast({ title: 'Not Supported', description: 'Geolocation is not supported by your browser.', variant: 'destructive' });
			}
		};

	const fetchVetsByBounds = useCallback(async (bounds: google.maps.LatLngBounds) => {
		setLoadingVets(true);
		setDisplayedVets([]);
		try {
			const ne = bounds.getNorthEast();
			const sw = bounds.getSouthWest();
			const res = await fetch(`/api/vets?nelat=${ne.lat()}&nelng=${ne.lng()}&swlat=${sw.lat()}&swlng=${sw.lng()}`);
			if (!res.ok) throw new Error('Failed to fetch vets');
			const data = await res.json();
			setDisplayedVets(data.vets || []);
		} catch (err) {
			toast({ title: 'Error', description: 'Could not fetch veterinarians for this area.', variant: 'destructive' });
		} finally {
			setLoadingVets(false);
		}
	}, [toast]);

	useEffect(() => {
		if (!locationSearch.trim()) {
			setDisplayedVets([]);
		}
	}, [locationSearch]);

	return (
		<>
			<PageHeader
				title="Find a Veterinarian"
				description="Search for veterinarians by name, location (address, city, zip), or services."
				icon={MapPin}
			/>
			<Card className="shadow-lg mb-4">
				<CardHeader>
					<CardTitle>Search Veterinarians</CardTitle>
					<CardDescription>Enter your location, vet name, or desired services.</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex flex-col md:flex-row gap-2 mb-2">
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
						<Button variant="secondary" className="w-full md:w-auto" onClick={handleFindNearMe}>
							<MapPin className="mr-2 h-4 w-4" /> Find Near Me
						</Button>
					</div>
				</CardContent>
			</Card>

			{/* Lower section: List and Map side by side, fill lower part of screen */}
			<div className="flex flex-col md:flex-row gap-4 h-[60vh] min-h-[320px] max-h-[65vh]">
				{/* Left: List */}
				<div className="md:w-1/2 w-full h-1/2 md:h-full overflow-y-auto">
					<Card className="shadow-lg h-full flex flex-col">
						<CardHeader>
							<CardTitle>Search Results</CardTitle>
							<CardDescription>
								{displayedVets.length > 0 ? `Showing ${displayedVets.length} veterinarian(s).` : "No veterinarians found matching your criteria."}
							</CardDescription>
						</CardHeader>
						<CardContent className="flex-1 overflow-y-auto">
							{loadingVets ? (
								<p className="text-center text-muted-foreground py-6">Loading veterinarians...</p>
							) : displayedVets.length > 0 ? (
								<div className="space-y-4">
									{displayedVets.map(vet => (
										<Card key={vet.id} className="p-4 flex flex-col sm:flex-row gap-4 hover:bg-secondary/30 transition-colors">
											<div className="w-full sm:w-1/3 h-40 sm:h-auto bg-muted rounded-md flex items-center justify-center overflow-hidden">
												<Image src={vet.imageUrl || `https://placehold.co/200x150.png?text=${encodeURIComponent(vet.name)}`} alt={vet.name} width={200} height={150} className="object-cover" />
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
				</div>
				{/* Right: Map */}
				<div className="md:w-1/2 w-full h-1/2 md:h-full">
					<Card className="shadow-lg h-full flex flex-col">
						<CardHeader>
							<CardTitle>Map</CardTitle>
						</CardHeader>
						<CardContent className="flex-1 min-h-[300px] p-0">
							<div className="w-full h-full min-h-[300px] rounded-lg overflow-hidden">
								{isLoaded ? (
									<GoogleMap
										mapContainerStyle={mapContainerStyle}
										center={mapCenter}
										zoom={13}
										onLoad={map => { mapRef.current = map; }}
										onIdle={() => {
											if (mapRef.current && window.google) {
												const bounds = mapRef.current.getBounds();
												if (bounds) {
													fetchVetsByBounds(bounds);
												}
											}
										}}
									>
															{displayedVets.filter(v => v.lat && v.lng).map(vet => (
																<Marker
																	key={vet.id}
																	position={{ lat: vet.lat!, lng: vet.lng! }}
																	onClick={() => setSelectedVet(vet)}
																/>
															))}
															{/* User location marker */}
															{userLocation && (
																<Marker
																	position={userLocation}
																	icon={{
																		url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
																		scaledSize: { width: 40, height: 40 } as google.maps.Size,
																	}}
																	title="Your Location"
																/>
															)}
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
									<span className="flex items-center justify-center h-full">Loading map...</span>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</>
	);
}
