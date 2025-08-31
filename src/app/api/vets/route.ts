
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const location = searchParams.get('location'); // e.g. zip code or city
  const radius = searchParams.get('radius') || '10000'; // in meters
  const nelat = searchParams.get('nelat');
  const nelng = searchParams.get('nelng');
  const swlat = searchParams.get('swlat');
  const swlng = searchParams.get('swlng');

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing Google Maps API key' }), { status: 500 });
  }

  let lat: number | null = null;
  let lng: number | null = null;
  let searchRadius = radius;

  // If bounds are provided, use the center of the bounds and calculate radius
  if (nelat && nelng && swlat && swlng) {
    const nelatNum = parseFloat(nelat);
    const nelngNum = parseFloat(nelng);
    const swlatNum = parseFloat(swlat);
    const swlngNum = parseFloat(swlng);
    lat = (nelatNum + swlatNum) / 2;
    lng = (nelngNum + swlngNum) / 2;
    // Approximate radius in meters (Haversine formula simplified for small distances)
    const R = 6371000; // Earth radius in meters
    const dLat = (nelatNum - swlatNum) * Math.PI / 180;
    const dLng = (nelngNum - swlngNum) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(swlatNum * Math.PI / 180) * Math.cos(nelatNum * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    // Use half the diagonal as radius
  searchRadius = ((R * c) / 2).toString();
  } else if (location) {
    // Geocode the location to lat/lng
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(location)}&key=${apiKey}`;
    const geoRes = await fetch(geocodeUrl);
    const geoData = await geoRes.json();
    if (!geoData.results || !geoData.results[0]) {
      return new Response(JSON.stringify({ error: 'Could not geocode location' }), { status: 404 });
    }
    lat = geoData.results[0].geometry.location.lat;
    lng = geoData.results[0].geometry.location.lng;
  } else {
    return new Response(JSON.stringify({ error: 'Missing location or bounds parameters' }), { status: 400 });
  }

  // Search for veterinarians using Places API
  const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${searchRadius}&type=veterinary_care&key=${apiKey}`;
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
