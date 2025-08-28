// Generate static params for build time
export async function generateStaticParams() {
  // Return empty array for now - pages will be generated on-demand
  return [];
}

import PetDetailsClient from './client';

export default function PetDetailsPage() {
  return <PetDetailsClient />;
}
