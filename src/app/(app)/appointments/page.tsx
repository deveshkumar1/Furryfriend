import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, PlusCircle, Edit3, MapPin, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// Mock data
const appointments = [
  { id: '1', petName: 'Buddy', petSpecies: 'Dog', vetName: 'Dr. Smith', clinicName: 'Happy Paws Clinic', date: '2024-08-15', time: '10:00 AM', type: 'Check-up', status: 'Upcoming' },
  { id: '2', petName: 'Lucy', petSpecies: 'Cat', vetName: 'Dr. Pawson', clinicName: 'Animal Care Center', date: '2024-08-20', time: '02:30 PM', type: 'Vaccination', status: 'Upcoming' },
  { id: '3', petName: 'Charlie', petSpecies: 'Dog', vetName: 'Dr. Vetson', clinicName: 'Suburb Veterinary', date: '2024-07-25', time: '11:00 AM', type: 'Follow-up', status: 'Completed' },
];

export default function AppointmentsPage() {
  const upcomingAppointments = appointments.filter(a => a.status === 'Upcoming').sort((a,b) => new Date(`${a.date} ${a.time}`).getTime() - new Date(`${b.date} ${b.time}`).getTime());
  const pastAppointments = appointments.filter(a => a.status !== 'Upcoming').sort((a,b) => new Date(`${b.date} ${b.time}`).getTime() - new Date(`${a.date} ${a.time}`).getTime());

  return (
    <>
      <PageHeader
        title="My Appointments"
        description="View and manage all your pet appointments."
        icon={CalendarDays}
        action={
          <Link href="/veterinarians"> {/* Link to vet list to schedule from there */}
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Schedule New Appointment
            </Button>
          </Link>
        }
      />

      {appointments.length === 0 ? (
         <Card className="text-center py-12 shadow-lg">
          <CardHeader>
            <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle>No Appointments Yet</CardTitle>
            <CardDescription>Schedule an appointment with your veterinarian.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/veterinarians">
              <Button size="lg">
                <MapPin className="mr-2 h-5 w-5" /> Find a Vet to Schedule
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
              {upcomingAppointments.length === 0 && <CardDescription>No upcoming appointments.</CardDescription>}
            </CardHeader>
            <CardContent>
              {upcomingAppointments.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pet</TableHead>
                      <TableHead>Veterinarian</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {upcomingAppointments.map((appt) => (
                      <TableRow key={appt.id}>
                        <TableCell>
                          <div className="font-medium">{appt.petName}</div>
                          <div className="text-xs text-muted-foreground">{appt.petSpecies}</div>
                        </TableCell>
                        <TableCell>
                           <div>{appt.vetName}</div>
                           <div className="text-xs text-muted-foreground">{appt.clinicName}</div>
                        </TableCell>
                        <TableCell>{appt.date} at {appt.time}</TableCell>
                        <TableCell>{appt.type}</TableCell>
                        <TableCell><Badge variant="default">{appt.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" title="Edit/Reschedule (Placeholder)">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                 <p className="text-muted-foreground text-center py-4">No upcoming appointments found.</p>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Past Appointments</CardTitle>
               {pastAppointments.length === 0 && <CardDescription>No past appointments.</CardDescription>}
            </CardHeader>
            <CardContent>
              {pastAppointments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pet</TableHead>
                    <TableHead>Veterinarian</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastAppointments.map((appt) => (
                    <TableRow key={appt.id}>
                      <TableCell>
                        <div className="font-medium">{appt.petName}</div>
                        <div className="text-xs text-muted-foreground">{appt.petSpecies}</div>
                      </TableCell>
                      <TableCell>
                         <div>{appt.vetName}</div>
                         <div className="text-xs text-muted-foreground">{appt.clinicName}</div>
                      </TableCell>
                      <TableCell>{appt.date} at {appt.time}</TableCell>
                      <TableCell>{appt.type}</TableCell>
                      <TableCell><Badge variant="secondary">{appt.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              ) : (
                 <p className="text-muted-foreground text-center py-4">No past appointment records found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
