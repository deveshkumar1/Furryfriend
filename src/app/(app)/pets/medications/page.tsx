import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { HeartPulse, PlusCircle, Edit3, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// Mock data for multiple pets' medications
const allMedications = [
  { id: 'm1', petName: 'Buddy', medicationName: 'Heartworm Prevention', dosage: '1 tablet monthly', startDate: '2023-01-01', status: 'Active', veterinarian: 'Dr. Smith' },
  { id: 'm2', petName: 'Buddy', medicationName: 'Flea & Tick', dosage: '1 topical monthly', startDate: '2023-01-01', status: 'Active', veterinarian: 'Dr. Smith' },
  { id: 'm3', petName: 'Lucy', medicationName: 'Thyroid Support', dosage: '0.5ml twice daily', startDate: '2024-03-15', status: 'Active', veterinarian: 'Dr. Pawson' },
  { id: 'm4', petName: 'Charlie', medicationName: 'Joint Supplement', dosage: '1 chew daily', startDate: '2024-05-01', status: 'Needs Refill', veterinarian: 'Dr. Vetson' },
];

// Feature Gating: This page might require a "premium" subscription.
// For demo, we'll assume the user has access.
const currentUserSubscription = "premium"; // "free", "pro", "premium"
const requiredSubscription = "premium";

export default function AllMedicationsPage() {

  if (currentUserSubscription !== requiredSubscription && requiredSubscription !== "free") {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">
          This feature requires a {requiredSubscription} subscription.
        </p>
        <Link href="/subscriptions">
          <Button>Upgrade Subscription</Button>
        </Link>
      </div>
    );
  }
  
  const activeMedications = allMedications.filter(med => med.status === 'Active');
  const needsRefillMedications = allMedications.filter(med => med.status === 'Needs Refill');

  return (
    <>
      <PageHeader
        title="All Pets Medication Tracker"
        description="Consolidated view of medication schedules and statuses for all your pets."
        icon={HeartPulse}
        action={
          <Button variant="outline" disabled> {/* Placeholder, add to specific pet */}
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Medication
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Medication Overview</CardTitle>
          <CardDescription>
            {activeMedications.length} active medication(s). {needsRefillMedications.length > 0 && <span className="text-destructive font-semibold">{needsRefillMedications.length} medication(s) need refill.</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allMedications.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pet Name</TableHead>
                  <TableHead>Medication</TableHead>
                  <TableHead>Dosage</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prescribed By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...needsRefillMedications, ...activeMedications].map((med) => (
                  <TableRow key={med.id} className={med.status === 'Needs Refill' ? "bg-destructive/10" : ""}>
                    <TableCell className="font-medium">
                      <Link href={`/pets/${med.petName.toLowerCase()}`} className="hover:underline text-primary"> {/* Assuming petId is lowercase name */}
                        {med.petName}
                      </Link>
                    </TableCell>
                    <TableCell>{med.medicationName}</TableCell>
                    <TableCell>{med.dosage}</TableCell>
                    <TableCell>{med.startDate}</TableCell>
                    <TableCell>
                      <Badge variant={med.status === 'Needs Refill' ? "destructive" : (med.status === 'Active' ? "default" : "secondary")}>
                        {med.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{med.veterinarian}</TableCell>
                    <TableCell className="text-right">
                       <Link href={`/pets/${med.petName.toLowerCase()}#medications`}> {/* Link to pet's medication tab */}
                        <Button variant="ghost" size="icon"><Edit3 className="h-4 w-4" /></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No medication records found for any pets.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

