
"use client";

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, PawPrint, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface Stats {
  totalUsers: number | null;
  totalPets: number | null;
  activeSubscriptions: number | null; // Changed to allow null
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats>({
    totalUsers: null,
    totalPets: null,
    activeSubscriptions: null, // Initialized to null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const usersCollectionRef = collection(db, 'users');
        const petsCollectionRef = collection(db, 'pets');
        
        const [usersSnapshot, petsSnapshot] = await Promise.all([
          getDocs(usersCollectionRef),
          getDocs(petsCollectionRef)
        ]);

        setStats({ // Set all stats in one go
          totalUsers: usersSnapshot.size,
          totalPets: petsSnapshot.size,
          activeSubscriptions: 80, // Keep static value but set after loading
        });

      } catch (error) {
        console.error("Error fetching admin stats:", error);
        // Handle error, maybe show a toast
        setStats({ // Set to null on error
            totalUsers: null,
            totalPets: null,
            activeSubscriptions: null
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);
  
  const StatCard = ({ title, value, icon: Icon, description }: { title: string; value: number | null; icon: React.ElementType; description: string }) => (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <div className="text-2xl font-bold">{value ?? 'N/A'}</div>
        )}
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Global overview of the FurryFriend Care Hub platform."
        icon={Shield}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
         <StatCard 
            title="Total Users" 
            value={stats.totalUsers} 
            icon={Users}
            description="Registered users on the platform"
          />

         <StatCard 
            title="Total Pets" 
            value={stats.totalPets} 
            icon={PawPrint}
            description="Pet profiles created by users"
          />
        
         <StatCard 
            title="Active Subscriptions" 
            value={stats.activeSubscriptions} 
            icon={Shield}
            description="Users with Pro or Premium plans"
          />
      </div>

       <Card className="mt-6 shadow-lg">
        <CardHeader>
          <CardTitle>Platform Management</CardTitle>
          <CardDescription>
            Manage all platform data including users, pets, and system logs.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-4">
            <Link href="/admin/users">
              <Card className="p-4 hover:bg-secondary/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Users className="h-6 w-6 text-primary"/>
                      <h3 className="text-lg font-semibold">Manage Users</h3>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground"/>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">View, edit, and manage all user accounts.</p>
              </Card>
            </Link>
            <Link href="/admin/pets">
                <Card className="p-4 hover:bg-secondary/50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <PawPrint className="h-6 w-6 text-accent"/>
                      <h3 className="text-lg font-semibold">Manage Pets</h3>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground"/>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Browse and manage all pet profiles on the platform.</p>
              </Card>
            </Link>
        </CardContent>
      </Card>
    </>
  );
}
