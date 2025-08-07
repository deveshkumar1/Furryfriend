
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
import { format } from 'date-fns';

interface VaccinationRecord extends DocumentData {
  id: string;
  petId: string;
  petName: string; // Denormalized for easier display
  userId: string;
  vaccineName: string;
  dateAdministered: string; // Store as ISO string or convert from Timestamp
  nextDueDate?: string;     // Store as ISO string or convert from Timestamp
  veterinarian: string;
  createdAt?: any; 
}

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
        const data = doc.data();
        recordsData.push({ 
          id: doc.id, 
          ...data,
          // Ensure dates are consistently handled, Firestore Timestamps might need .toDate().toISOString()
          dateAdministered: data.dateAdministered?.toDate ? data.dateAdministered.toDate().toISOString().split('T')[0] : data.dateAdministered,
          nextDueDate: data.nextDueDate?.toDate ? data.nextDueDate.toDate().toISOString().split('T')[0] : data.nextDueDate,
        } as VaccinationRecord);
      });
      setVaccinations(recordsData);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching ALL vaccination records (AllVaccinationsPage): ", err);
      setError("Failed to load vaccination records. Check browser console for specific Firestore error (likely a missing index or permission issue). Firestore often provides a link to create missing indexes in the console error message.");
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
        <p className="text-muted-foreground mb-4 px-4 whitespace-pre-wrap">{error}</p>
         {error.includes("subscription") && (
             <Link href="/subscriptions">
                <Button>Upgrade Subscription</Button>
            </Link>
        )}
      </div>
      </>
    );
  }
  
  const upcomingVaccinations = vaccinations.filter(vax => vax.nextDueDate && new Date(vax.nextDueDate) >= new Date());
  const overdueVaccinations = vaccinations.filter(vax => vax.nextDueDate && new Date(vax.nextDueDate) < new Date());
  const otherVaccinations = vaccinations.filter(vax => !vax.nextDueDate);


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
                {[...overdueVaccinations, ...upcomingVaccinations, ...otherVaccinations].map((vax) => (
                  <TableRow key={vax.id} className={vax.nextDueDate && new Date(vax.nextDueDate) < new Date() ? "bg-destructive/10" : ""}>
                    <TableCell className="font-medium">
                      <Link href={`/pets/${vax.petId}`} className="hover:underline text-primary">
                        {vax.petName}
                      </Link>
                    </TableCell>
                    <TableCell>{vax.vaccineName}</TableCell>
                    <TableCell>{vax.dateAdministered ? format(new Date(vax.dateAdministered), "MMM dd, yyyy") : 'N/A'}</TableCell>
                    <TableCell>
                      {vax.nextDueDate ? (
                        <Badge variant={new Date(vax.nextDueDate) < new Date() ? "destructive" : "default"}>
                          {format(new Date(vax.nextDueDate), "MMM dd, yyyy")}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
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
                <p className="text-lg font-semibold text-muted-foreground">No vaccination records found for your pets.</p>
                <p className="text-sm text-muted-foreground">Add vaccination records from your pet's profile page.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}

