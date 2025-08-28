
"use client"; 

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and the user is not an admin, redirect them away.
    if (!loading && !userProfile?.isAdmin) {
      router.push('/dashboard'); 
    }
  }, [userProfile, loading, router]);

  // While checking auth, show a loader
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If the user is definitely not an admin, show an access denied message
  if (!userProfile?.isAdmin) {
    return (
        <Card className="m-auto mt-10 max-w-lg text-center shadow-lg">
            <CardHeader>
                <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4"/>
                <CardTitle className="text-destructive">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground mb-4">You do not have permission to view this page.</p>
                <Button onClick={() => router.push('/dashboard')}>Return to Dashboard</Button>
            </CardContent>
        </Card>
    );
  }

  // If the user is an admin, render the admin content
  return <>{children}</>;
}
