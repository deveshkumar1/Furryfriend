import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location'); // e.g. zip code or city
  const radius = searchParams.get('radius') || '10000'; // in meters

  if (!location) {
    return new Response(JSON.stringify({ error: 'Missing location parameter' }), { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing Google Maps API key' }), { status: 500 });
  }

  // Geocode the location to lat/lng
  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;
  const geoRes = await fetch(geocodeUrl);
  const geoData = await geoRes.json();
  if (!geoData.results || !geoData.results[0]) {
    return new Response(JSON.stringify({ error: 'Could not geocode location' }), { status: 404 });
  }
  const { lat, lng } = geoData.results[0].geometry.location;

  // Search for veterinarians using Places API
  const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=veterinary_care&key=${apiKey}`;
  const placesRes = await fetch(placesUrl);
  const placesData = await placesRes.json();

  if (!placesData.results) {
    return new Response(JSON.stringify({ error: 'No results from Places API' }), { status: 404 });
  }

  // Map results to a simplified vet object
  const vets = placesData.results.map((place: any) => ({
    id: place.place_id,
    name: place.name,
    address: place.vicinity,
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
    rating: place.rating,
    userRatingsTotal: place.user_ratings_total,
    icon: place.icon,
    types: place.types,
    photoRef: place.photos && place.photos[0] ? place.photos[0].photo_reference : null,
  }));

  return new Response(JSON.stringify({ vets }), { status: 200 });
}
