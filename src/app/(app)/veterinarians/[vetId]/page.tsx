import Image from 'next/image';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIcon, Stethoscope, MapPin, Phone, Mail, Clock, Users, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Mock data for a specific vet
const vet = {
  id: '1',
  name: 'Dr. Emily Smith',
  clinicName: 'Happy Paws Clinic',
  specialty: 'General Practice',
  bio: 'Dr. Emily Smith has over 10 years of experience in small animal medicine. She is passionate about preventative care and building long-lasting relationships with her patients and their families.',
  services: ['Wellness Exams', 'Vaccinations', 'Dental Care', 'Minor Surgeries', 'Diagnostics'],
  imageUrl: 'https://placehold.co/150x150.png',
  dataAiHint: 'veterinarian smiling',
  address: '123 Main St, Anytown, USA',
  phone: '555-123-4567',
  email: 'esmith@happypaws.com',
  hours: {
    monday: '9 AM - 5 PM',
    tuesday: '9 AM - 5 PM',
    wednesday: '9 AM - 1 PM',
    thursday: '9 AM - 5 PM',
    friday: '9 AM - 5 PM',
    saturday: '10 AM - 2 PM',
    sunday: 'Closed',
  },
  availableSlots: [
    { date: '2024-08-15', time: '10:00 AM' }, { date: '2024-08-15', time: '10:30 AM' },
    { date: '2024-08-15', time: '02:00 PM' }, { date: '2024-08-16', time: '09:00 AM' },
  ]
};

// Mock pets for select
const userPets = [
  { id: 'p1', name: 'Buddy' },
  { id: 'p2', name: 'Lucy' },
];


export default function VeterinarianProfilePage({ params }: { params: { vetId: string } }) {
  // In a real app, fetch vet data using params.vetId

  return (
    <>
      <PageHeader
        title={vet.name}
        description={`${vet.clinicName} - ${vet.specialty}`}
        icon={Stethoscope}
        action={
           <Link href={`/veterinarians/${vet.id}/edit`}> {/* Placeholder for edit */}
            <Button variant="outline">
              <Edit3 className="mr-2 h-4 w-4" /> Edit Veterinarian
            </Button>
          </Link>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row items-start gap-4">
              <Image src={vet.imageUrl} alt={vet.name} width={120} height={120} className="rounded-lg border object-cover" data-ai-hint={vet.dataAiHint} />
              <div className="flex-1">
                <CardTitle className="text-2xl">{vet.name}</CardTitle>
                <CardDescription className="text-md">{vet.clinicName} - <Badge variant="outline">{vet.specialty}</Badge></CardDescription>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2"><MapPin size={16} /> {vet.address}</p>
                    <p className="flex items-center gap-2"><Phone size={16} /> {vet.phone}</p>
                    <p className="flex items-center gap-2"><Mail size={16} /> {vet.email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-2">About Dr. {vet.name.split(' ').pop()}</h3>
              <p className="text-muted-foreground text-sm mb-4">{vet.bio}</p>
              <h3 className="font-semibold text-lg mb-2">Services Offered</h3>
              <div className="flex flex-wrap gap-2">
                {vet.services.map(service => <Badge key={service} variant="secondary">{service}</Badge>)}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock size={22}/> Clinic Hours</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                    {Object.entries(vet.hours).map(([day, hours]) => (
                        <li key={day} className="flex justify-between">
                            <span className="capitalize">{day}:</span>
                            <span>{hours}</span>
                        </li>
                    ))}
                </ul>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CalendarIcon size={22} /> Schedule Appointment</CardTitle>
              <CardDescription>Select a date and time for your visit.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="petSelect">Select Pet</Label>
                <Select name="petSelect">
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your pet" />
                  </SelectTrigger>
                  <SelectContent>
                    {userPets.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Select Date</Label>
                <Calendar mode="single" selected={new Date()} onSelect={() => {}} className="rounded-md border p-0" />
              </div>
              <div>
                <Label htmlFor="timeSlotSelect">Available Time Slots</Label>
                 <Select name="timeSlotSelect">
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {vet.availableSlots.filter(slot => slot.date === '2024-08-15').map(slot => ( // Example filter by selected date
                        <SelectItem key={`${slot.date}-${slot.time}`} value={slot.time}>{slot.time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <div>
                <Label htmlFor="reason">Reason for Visit (Optional)</Label>
                <Textarea id="reason" placeholder="e.g., Annual check-up, not feeling well..." />
              </div>
              <Button className="w-full">Request Appointment</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
