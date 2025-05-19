
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, PlusCircle, Edit3, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, DocumentData } from 'firebase/firestore';

interface VaccinationRecord extends DocumentData {
  id: string;
  petId: string;
  petName: string; // Denormalized for easier display
  userId: string;
  vaccineName: string;
  dateAdministered: string; // Store as ISO string or convert from Timestamp
  nextDueDate: string;     // Store as ISO string or convert from Timestamp
  veterinarian: string;
  createdAt?: any; 
}

// Feature Gating: This page might require a "premium" subscription.
// For demo, we'll assume the user has access or adjust this logic as needed.
const currentUserSubscription = "premium"; // "free", "pro", "premium" <- This should ideally come from userProfile
const requiredSubscription = "premium";

export default function AllVaccinationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [vaccinations, setVaccinations] = useState<VaccinationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      setIsLoading(false);
      setError("Please log in to view vaccination records.");
      setVaccinations([]);
      return;
    }
    
    // Check subscription level
    if (currentUserSubscription !== requiredSubscription && requiredSubscription !== "free") {
        setIsLoading(false);
        setError(`This feature requires a ${requiredSubscription} subscription.`);
        setVaccinations([]);
        return;
    }

    setIsLoading(true);
    setError(null);

    const q = query(
      collection(db, "vaccinations"),
      where("userId", "==", user.uid),
      orderBy("nextDueDate", "asc") // Order by upcoming due date
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const recordsData: VaccinationRecord[] = [];
      querySnapshot.forEach((doc) => {
        recordsData.push({ id: doc.id, ...doc.data() } as VaccinationRecord);
      });
      setVaccinations(recordsData);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching vaccination records: ", err);
      setError("Failed to load vaccination records. Check console for details.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  if (authLoading || isLoading) {
    return (
      <>
        <PageHeader
          title="All Pets Vaccination Records"
          description="Centralized view of vaccination history and upcoming due dates for all your pets."
          icon={ShieldCheck}
        />
        <Card className="shadow-lg text-center py-12">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
          <CardTitle>Loading Records...</CardTitle>
        </Card>
      </>
    );
  }

  if (error) {
    return (
      <>
      <PageHeader
        title="Vaccination Records"
        icon={ShieldCheck}
      />
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-destructive">Error</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        {error.includes("subscription") && (
             <Link href="/subscriptions">
                <Button>Upgrade Subscription</Button>
            </Link>
        )}
      </div>
      </>
    );
  }
  
  const upcomingVaccinations = vaccinations.filter(vax => new Date(vax.nextDueDate) >= new Date());
  const overdueVaccinations = vaccinations.filter(vax => new Date(vax.nextDueDate) < new Date());


  return (
    <>
      <PageHeader
        title="All Pets Vaccination Records"
        description="Centralized view of vaccination history and upcoming due dates for all your pets."
        icon={ShieldCheck}
        action={
          <Button variant="outline" disabled> {/* Placeholder, add to specific pet's profile */}
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Record
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Vaccination Schedule</CardTitle>
          {vaccinations.length > 0 ? (
            <CardDescription>
              {overdueVaccinations.length > 0 && <span className="text-destructive font-semibold">{overdueVaccinations.length} vaccination(s) overdue. </span>}
              {upcomingVaccinations.length > 0 && <span className="text-accent-foreground font-semibold">{upcomingVaccinations.length} upcoming.</span>}
              {vaccinations.length === 0 && "No vaccination records found."}
            </CardDescription>
          ) : null}
        </CardHeader>
        <CardContent>
          {vaccinations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pet Name</TableHead>
                  <TableHead>Vaccine</TableHead>
                  <TableHead>Date Administered</TableHead>
                  <TableHead>Next Due Date</TableHead>
                  <TableHead>Veterinarian</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...overdueVaccinations, ...upcomingVaccinations].map((vax) => (
                  <TableRow key={vax.id} className={new Date(vax.nextDueDate) < new Date() ? "bg-destructive/10" : ""}>
                    <TableCell className="font-medium">
                      <Link href={`/pets/${vax.petId}`} className="hover:underline text-primary">
                        {vax.petName}
                      </Link>
                    </TableCell>
                    <TableCell>{vax.vaccineName}</TableCell>
                    <TableCell>{new Date(vax.dateAdministered).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Badge variant={new Date(vax.nextDueDate) < new Date() ? "destructive" : "default"}>
                        {new Date(vax.nextDueDate).toLocaleDateString()}
                      </Badge>
                    </TableCell>
                    <TableCell>{vax.veterinarian}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/pets/${vax.petId}#vaccinations`}> {/* Link to specific pet's vaccination tab */}
                        <Button variant="ghost" size="icon" title="Edit/View on Pet Profile"><Edit3 className="h-4 w-4" /></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-10">
                <ShieldCheck className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold text-muted-foreground">No vaccination records found.</p>
                <p className="text-sm text-muted-foreground">Add vaccination records from your pet's profile page.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
