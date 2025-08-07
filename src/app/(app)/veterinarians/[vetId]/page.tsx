
"use client";

import Image from 'next/image';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar as CalendarIconLucide, Stethoscope, MapPin, Phone, Mail, Clock, Users, Edit3, Save, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useParams } from 'next/navigation';


// Mock data for a specific vet - this will be replaced by Firestore fetching eventually
const vetMockData = {
  id: 'vet_1_emily_smith', // A unique ID for this mock vet
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


export default function VeterinarianProfilePage() {
  // const params = useParams(); // vetId can be accessed via params.vetId
  // For now, we use the static vetMockData. In future, fetch from 'allVeterinarians' collection using params.vetId
  const vetToDisplay = vetMockData; 

  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingSaveStatus, setIsLoadingSaveStatus] = useState(true);

  useEffect(() => {
    if (!user || !vetToDisplay?.id) {
      setIsLoadingSaveStatus(false);
      return;
    }
    setIsLoadingSaveStatus(true);
    const savedVetRef = doc(db, `users/${user.uid}/savedVets`, vetToDisplay.id);
    getDoc(savedVetRef).then(docSnap => {
      setIsSaved(docSnap.exists());
      setIsLoadingSaveStatus(false);
    }).catch(err => {
      console.error("Error checking saved status:", err);
      setIsLoadingSaveStatus(false);
      // Potentially show a toast error if checking status fails
    });
  }, [user, vetToDisplay?.id]);


  const handleSaveVet = async () => {
    if (!user || !vetToDisplay) {
      toast({ title: "Error", description: "You must be logged in to save a veterinarian.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    try {
      const vetDataToSave = {
        id: vetToDisplay.id,
        name: vetToDisplay.name,
        clinicName: vetToDisplay.clinicName,
        specialty: vetToDisplay.specialty,
        phone: vetToDisplay.phone || '',
        email: vetToDisplay.email || '',
        address: vetToDisplay.address || '',
        imageUrl: vetToDisplay.imageUrl || '',
        dataAiHint: vetToDisplay.dataAiHint || '',
        // Add any other fields you want to copy to the savedVets subcollection
      };
      await setDoc(doc(db, `users/${user.uid}/savedVets`, vetToDisplay.id), vetDataToSave);
      toast({ title: "Veterinarian Saved!", description: `${vetToDisplay.name} has been added to your list.` });
      setIsSaved(true);
    } catch (error) {
      console.error("Error saving veterinarian: ", error);
      toast({ title: "Error", description: "Could not save veterinarian. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleUnsaveVet = async () => {
    if (!user || !vetToDisplay) return;
    setIsSaving(true);
    try {
      await deleteDoc(doc(db, `users/${user.uid}/savedVets`, vetToDisplay.id));
      toast({ title: "Veterinarian Removed", description: `${vetToDisplay.name} has been removed from your list.` });
      setIsSaved(false);
    } catch (error) {
      console.error("Error unsaving veterinarian: ", error);
      toast({ title: "Error", description: "Could not remove veterinarian. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };


  if (!vetToDisplay) {
    // This would be relevant if fetching vet data failed
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Veterinarian Not Found</h2>
        <p className="text-muted-foreground mb-4">The requested veterinarian profile could not be loaded.</p>
        <Link href="/veterinarians/find"><Button variant="outline">Find Veterinarians</Button></Link>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title={vetToDisplay.name}
        description={`${vetToDisplay.clinicName} - ${vetToDisplay.specialty}`}
        icon={Stethoscope}
        action={
           <div className="flex items-center gap-2">
            {isLoadingSaveStatus ? (
                <Button variant="outline" disabled size="lg"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking Status...</Button>
            ) : isSaved ? (
                <Button variant="outline" size="lg" onClick={handleUnsaveVet} disabled={isSaving || authLoading}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5 text-green-500" />}
                    Saved to My Vets
                </Button>
            ) : (
                <Button variant="default" size="lg" onClick={handleSaveVet} disabled={isSaving || authLoading || !user}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save to My Vets
                </Button>
            )}
             {/* Placeholder for edit - would need separate logic for editing public vet data */}
            <Button variant="outline" disabled>
              <Edit3 className="mr-2 h-4 w-4" /> Edit Veterinarian
            </Button>
          </div>
        }
      />

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-col sm:flex-row items-start gap-4">
              <Image 
                src={vetToDisplay.imageUrl} 
                alt={vetToDisplay.name} 
                width={120} height={120} 
                className="rounded-lg border object-cover" 
                data-ai-hint={vetToDisplay.dataAiHint}
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/120x120.png'; }}
              />
              <div className="flex-1">
                <CardTitle className="text-2xl">{vetToDisplay.name}</CardTitle>
                <CardDescription className="text-md">{vetToDisplay.clinicName} - <Badge variant="outline">{vetToDisplay.specialty}</Badge></CardDescription>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    <p className="flex items-center gap-2"><MapPin size={16} /> {vetToDisplay.address}</p>
                    <p className="flex items-center gap-2"><Phone size={16} /> {vetToDisplay.phone}</p>
                    <p className="flex items-center gap-2"><Mail size={16} /> {vetToDisplay.email}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold text-lg mb-2">About Dr. {vetToDisplay.name.split(' ').pop()}</h3>
              <p className="text-muted-foreground text-sm mb-4">{vetToDisplay.bio}</p>
              <h3 className="font-semibold text-lg mb-2">Services Offered</h3>
              <div className="flex flex-wrap gap-2">
                {vetToDisplay.services.map(service => <Badge key={service} variant="secondary">{service}</Badge>)}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock size={22}/> Clinic Hours</CardTitle>
            </CardHeader>
            <CardContent>
                <ul className="space-y-1 text-sm text-muted-foreground">
                    {Object.entries(vetToDisplay.hours).map(([day, hours]) => (
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
              <CardTitle className="flex items-center gap-2"><CalendarIconLucide size={22} /> Schedule Appointment</CardTitle>
              <CardDescription>Select a date and time for your visit. (Functionality to be implemented)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="petSelect">Select Pet</Label>
                <Select name="petSelect" disabled>
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
                <Calendar mode="single" selected={new Date()} onSelect={() => {}} className="rounded-md border p-0" disabled/>
              </div>
              <div>
                <Label htmlFor="timeSlotSelect">Available Time Slots</Label>
                 <Select name="timeSlotSelect" disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a time" />
                  </SelectTrigger>
                  <SelectContent>
                    {vetToDisplay.availableSlots.filter(slot => slot.date === '2024-08-15').map(slot => ( // Example filter by selected date
                        <SelectItem key={`${slot.date}-${slot.time}`} value={slot.time}>{slot.time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
               <div>
                <Label htmlFor="reason">Reason for Visit (Optional)</Label>
                <Textarea id="reason" placeholder="e.g., Annual check-up, not feeling well..." disabled/>
              </div>
              <Button className="w-full" disabled>Request Appointment</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

