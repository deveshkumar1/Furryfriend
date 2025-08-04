
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, PlusCircle, Edit3, AlertTriangle, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, DocumentData } from 'firebase/firestore';
import { format } from 'date-fns';

interface MedicationRecord extends DocumentData {
  id: string;
  petId: string;
  petName: string;
  userId: string;
  medicationName: string;
  dosage: string;
  startDate: string; // Stored as 'yyyy-MM-dd'
  endDate?: string;  // Stored as 'yyyy-MM-dd'
  veterinarian: string;
  notes?: string;
  createdAt?: any;
}

export default function AllMedicationsPage() {
  const { user, loading: authLoading } = useAuth();
  const [medications, setMedications] = useState<MedicationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For demo, we are not gating this page.
  // const currentUserSubscription = "premium"; 
  // const requiredSubscription = "premium";

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      setIsLoading(false);
      setError("Please log in to view medication records.");
      setMedications([]);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    const q = query(
      collection(db, "medications"),
      where("userId", "==", user.uid),
      orderBy("startDate", "desc")
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const recordsData: MedicationRecord[] = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as MedicationRecord));
      setMedications(recordsData);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching ALL medication records: ", err);
      setError("Failed to load medication records. Check browser console for specific Firestore error (likely a missing index).");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, authLoading]);

  // This check could be re-enabled for subscription gating
  // if (currentUserSubscription !== requiredSubscription && requiredSubscription !== "free") { ... }

  if (authLoading || isLoading) {
    return (
      <>
        <PageHeader
          title="All Pets Medication Tracker"
          description="Consolidated view of medication schedules and statuses for all your pets."
          icon={HeartPulse}
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
        <PageHeader title="Medication Tracker" icon={HeartPulse} />
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
          <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
          <h2 className="text-2xl font-semibold mb-2 text-destructive">Error</h2>
          <p className="text-muted-foreground mb-4 px-4 whitespace-pre-wrap">{error}</p>
        </div>
      </>
    );
  }

  const getStatus = (med: MedicationRecord): { text: string; variant: "default" | "secondary" | "destructive" } => {
    if (med.endDate) {
      const endDate = new Date(med.endDate);
      if (endDate < new Date()) {
        return { text: "Completed", variant: "secondary" };
      }
    }
    return { text: "Active", variant: "default" };
  };

  return (
    <>
      <PageHeader
        title="All Pets Medication Tracker"
        description="Consolidated view of medication schedules and statuses for all your pets."
        icon={HeartPulse}
        action={
          <Button variant="outline" disabled>
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Medication
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Medication Overview</CardTitle>
          <CardDescription>
            Displaying {medications.length} medication record(s) across all pets.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {medications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pet Name</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Date Range</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prescribed By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medications.map((med) => {
                  const status = getStatus(med);
                  return (
                  <TableRow key={med.id}>
                    <TableCell className="font-medium">
                      <Link href={`/pets/${med.petId}`} className="hover:underline text-primary">
                        {med.petName}
                      </Link>
                    </TableCell>
                    <TableCell>{med.medicationName}</TableCell>
                    <TableCell>{med.dosage}</TableCell>
                    <TableCell>
                      {format(new Date(med.startDate), "MMM dd, yyyy")} - {med.endDate ? format(new Date(med.endDate), "MMM dd, yyyy") : 'Ongoing'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>
                        {status.text}
                      </Badge>
                    </TableCell>
                    <TableCell>{med.veterinarian}</TableCell>
                    <TableCell className="text-right">
                       <Link href={`/pets/${med.petId}?tab=medications`}>
                        <Button variant="ghost" size="icon" title="View/Edit on Pet Profile"><Edit3 className="h-4 w-4" /></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )})}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-10">
              <HeartPulse className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              No medication records found for any pets. Add them from a pet's profile.
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
