
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, PawPrint, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardPage() {
  // In the future, we'll fetch real data here.
  const stats = {
    totalUsers: 125,
    totalPets: 210,
    activeSubscriptions: 80,
  };

  return (
    <>
      <PageHeader
        title="Admin Dashboard"
        description="Global overview of the FurryFriend Care Hub platform."
        icon={Shield}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users on the platform</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
            <PawPrint className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPets}</div>
            <p className="text-xs text-muted-foreground">Pet profiles created by users</p>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <Shield className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Users with Pro or Premium plans</p>
          </CardContent>
        </Card>
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
