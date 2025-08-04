
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, PawPrint } from 'lucide-react';

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
            This is where you will manage all platform data. Links to manage users, pets, and view system logs will be added here.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground">Admin tables and data management tools coming soon!</p>
        </CardContent>
      </Card>
    </>
  );
}
