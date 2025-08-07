import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart, Search, Filter, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

// Mock product data
const products = [
  { id: '1', name: 'Organic Salmon Kibble', brand: 'PetFresh', price: '$25.99', category: 'Food', imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'dog food bag' },
  { id: '2', name: 'Interactive Feather Wand', brand: 'PlayfulPaws', price: '$12.50', category: 'Toys', imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'cat toy' },
  { id: '3', name: 'Cozy Orthopedic Bed', brand: 'ComfyCritters', price: '$49.99', category: 'Beds', imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'dog bed' },
  { id: '4', name: 'Natural Flea & Tick Spray', brand: 'EcoGuard', price: '$18.75', category: 'Grooming', imageUrl: 'https://placehold.co/300x200.png', dataAiHint: 'pet spray bottle' },
];

const categories = ["All", "Food", "Toys", "Beds", "Grooming", "Health", "Accessories"];

export default function MarketplacePage() {
  return (
    <>
      <PageHeader
        title="Pet Care Marketplace"
        description="Discover curated products for your furry friends. (Feature Coming Soon)"
        icon={ShoppingCart}
      />
      <div className="mb-6 p-6 border-2 border-dashed border-primary/50 rounded-lg bg-primary/10 text-center">
        <ShoppingCart className="mx-auto h-12 w-12 text-primary mb-3" />
        <h2 className="text-2xl font-semibold text-primary">Marketplace Coming Soon!</h2>
        <p className="text-muted-foreground">
          We&apos;re working hard to bring you a selection of high-quality pet care products. Stay tuned!
        </p>
      </div>

      {/* Placeholder UI for the marketplace layout */}
      <Card className="shadow-lg opacity-50 pointer-events-none">
        <CardHeader>
          <CardTitle>Browse Products</CardTitle>
          <div className="flex flex-col md:flex-row gap-2 mt-2">
            <Input placeholder="Search products..." className="flex-grow" />
            <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filters</Button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {categories.map(category => (
                <Button key={category} variant="ghost" size="sm" className="border">{category}</Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <Card key={product.id} className="overflow-hidden flex flex-col">
                 <div className="relative h-48 w-full bg-muted">
                    <Image src={product.imageUrl} alt={product.name} layout="fill" objectFit="contain" data-ai-hint={product.dataAiHint} className="p-2"/>
                 </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg truncate" title={product.name}>{product.name}</CardTitle>
                  <CardDescription>{product.brand}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow pb-2">
                  <Badge variant="secondary" className="mb-2">{product.category}</Badge>
                  <p className="text-xl font-semibold text-primary">{product.price}</p>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" disabled><Tag className="mr-2 h-4 w-4" /> View Product</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
