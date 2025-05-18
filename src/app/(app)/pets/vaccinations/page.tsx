import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, PlusCircle, Edit3, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// Mock data for multiple pets' vaccinations
const allVaccinations = [
  { id: 'v1', petName: 'Buddy', vaccineName: 'Rabies', date: '2023-06-15', nextDueDate: '2024-06-15', veterinarian: 'Dr. Smith' },
  { id: 'v2', petName: 'Buddy', vaccineName: 'Distemper', date: '2023-06-15', nextDueDate: '2024-06-15', veterinarian: 'Dr. Smith' },
  { id: 'v3', petName: 'Lucy', vaccineName: 'FVRCP', date: '2023-08-01', nextDueDate: '2024-08-01', veterinarian: 'Dr. Pawson' },
  { id: 'v4', petName: 'Lucy', vaccineName: 'Rabies', date: '2023-08-01', nextDueDate: '2024-08-01', veterinarian: 'Dr. Pawson' },
  { id: 'v5', petName: 'Charlie', vaccineName: 'Parvovirus', date: '2024-01-10', nextDueDate: '2025-01-10', veterinarian: 'Dr. Vetson' },
];

// Feature Gating: This page might require a "premium" subscription.
// For demo, we'll assume the user has access.
const currentUserSubscription = "premium"; // "free", "pro", "premium"
const requiredSubscription = "premium";

export default function AllVaccinationsPage() {

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
  
  const upcomingVaccinations = allVaccinations.filter(vax => new Date(vax.nextDueDate) > new Date()).sort((a,b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());
  const overdueVaccinations = allVaccinations.filter(vax => new Date(vax.nextDueDate) <= new Date()).sort((a,b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime());


  return (
    <>
      <PageHeader
        title="All Pets Vaccination Records"
        description="Centralized view of vaccination history and upcoming due dates for all your pets."
        icon={ShieldCheck}
        action={
          <Button variant="outline" disabled> {/* Placeholder, add to specific pet */}
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Record
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Vaccination Schedule</CardTitle>
          <CardDescription>
            {overdueVaccinations.length > 0 && <span className="text-destructive font-semibold">{overdueVaccinations.length} vaccination(s) overdue. </span>}
            {upcomingVaccinations.length > 0 && <span className="text-accent-foreground font-semibold">{upcomingVaccinations.length} upcoming.</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {allVaccinations.length > 0 ? (
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
                      <Link href={`/pets/${vax.petName.toLowerCase()}`} className="hover:underline text-primary"> {/* Assuming petId is lowercase name */}
                        {vax.petName}
                      </Link>
                    </TableCell>
                    <TableCell>{vax.vaccineName}</TableCell>
                    <TableCell>{vax.date}</TableCell>
                    <TableCell>
                      <Badge variant={new Date(vax.nextDueDate) < new Date() ? "destructive" : "default"}>
                        {vax.nextDueDate}
                      </Badge>
                    </TableCell>
                    <TableCell>{vax.veterinarian}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/pets/${vax.petName.toLowerCase()}#vaccinations`}> {/* Link to pet's vaccination tab */}
                        <Button variant="ghost" size="icon"><Edit3 className="h-4 w-4" /></Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-muted-foreground text-center py-4">No vaccination records found for any pets.</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
