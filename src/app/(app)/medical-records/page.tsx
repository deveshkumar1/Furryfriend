import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Download, Upload, Filter, Search, AlertTriangle, PawPrint } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Mock data for medical records
const medicalRecords = [
  { id: 'rec1', petName: 'Buddy', date: '2024-08-15', type: 'Vet Visit Summary', vetName: 'Dr. Smith', fileUrl: '#', summary: 'Annual check-up, all clear. Rabies vaccine administered.' },
  { id: 'rec2', petName: 'Lucy', date: '2024-08-10', type: 'Lab Results', vetName: 'Dr. Pawson', fileUrl: '#', summary: 'Blood panel normal.' },
  { id: 'rec3', petName: 'Buddy', date: '2024-07-01', type: 'X-Ray Report', vetName: 'Dr. Smith', fileUrl: '#', summary: 'Right hind leg, no fracture.' },
  { id: 'rec4', petName: 'Charlie', date: '2024-06-20', type: 'Vaccination Certificate', vetName: 'Dr. Vetson', fileUrl: '#', summary: 'Parvo, Distemper certificates.' },
];

// Feature Gating: This page might require a "pro" or "premium" subscription.
// For demo, we'll assume the user has access.
const currentUserSubscription = "pro"; // "free", "pro", "premium"
const requiredSubscription = "pro";

export default function MedicalRecordsPage() {

  if (currentUserSubscription !== requiredSubscription && requiredSubscription !== "free" && currentUserSubscription !== "premium" ) {
     return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">
          This feature requires a {requiredSubscription} or higher subscription.
        </p>
        <Link href="/subscriptions">
          <Button>Upgrade Subscription</Button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Medical Records"
        description="Access and manage all your pets' consolidated medical documents."
        icon={FileText}
        action={
          <div className="flex gap-2">
            <Button variant="outline" disabled> <Upload className="mr-2 h-4 w-4" /> Upload Document</Button>
            <Button disabled><Download className="mr-2 h-4 w-4" /> Export All</Button>
          </div>
        }
      />

      <Card className="shadow-lg mb-6">
        <CardHeader>
          <CardTitle>Filter & Search Records</CardTitle>
          <div className="flex flex-col md:flex-row gap-2 mt-2">
            <Input placeholder="Search records (e.g., pet name, vet, condition)..." className="flex-grow" />
            <Select>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Pet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Pets</SelectItem>
                <SelectItem value="buddy">Buddy</SelectItem>
                <SelectItem value="lucy">Lucy</SelectItem>
                <SelectItem value="charlie">Charlie</SelectItem>
              </SelectContent>
            </Select>
             <Select>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="visit_summary">Vet Visit Summary</SelectItem>
                <SelectItem value="lab_results">Lab Results</SelectItem>
                <SelectItem value="vaccination_cert">Vaccination Certificate</SelectItem>
              </SelectContent>
            </Select>
            <Button><Search className="mr-2 h-4 w-4" /> Apply</Button>
          </div>
        </CardHeader>
      </Card>

      {medicalRecords.length === 0 ? (
        <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>No Medical Records Found</CardTitle>
            <CardDescription>Upload or sync medical documents for your pets.</CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <div className="space-y-4">
          {medicalRecords.map(record => (
            <Card key={record.id} className="shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{record.type} - {record.petName}</CardTitle>
                  <CardDescription>Date: {record.date} | Vet: {record.vetName}</CardDescription>
                </div>
                <Badge variant="outline">{record.petName}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{record.summary}</p>
                <div className="flex gap-2">
                  <Link href={record.fileUrl} target="_blank" rel="noopener noreferrer">
                     <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> View/Download</Button>
                  </Link>
                  <Button variant="ghost" size="sm" disabled>Edit Details</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
