
"use client";

import Image from 'next/image';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PawPrint, Edit3, ShieldCheck, Pill, LineChart, Share2, PlusCircle, CalendarIcon as CalendarIconLucide, FileText, Download, Users, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Bar, LineChart as RechartsLineChart, Line } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, DocumentData, collection, addDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';

interface PetData extends DocumentData {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: string;
  dateOfBirth?: string;
  gender?: string;
  color?: string;
  weight?: string;
  notes?: string;
  imageUrl?: string;
  dataAiHint?: string;
  userId?: string;
}

interface VaccinationRecord extends DocumentData {
  id: string;
  vaccineName: string;
  dateAdministered: string; // Stored as ISO string or Firestore Timestamp string
  nextDueDate?: string;    // Stored as ISO string or Firestore Timestamp string
  veterinarian: string;
}

const vaccinationFormSchema = z.object({
  vaccineName: z.string().min(1, "Vaccine name is required"),
  dateAdministered: z.date({ required_error: "Date administered is required" }),
  nextDueDate: z.date().optional(),
  veterinarian: z.string().min(1, "Veterinarian name is required"),
});

type VaccinationFormValues = z.infer<typeof vaccinationFormSchema>;

// Mock data for sub-tabs, replace with Firestore fetching later
const medications = [
  { id: 'm1', name: 'Heartworm Prevention', dosage: '1 tablet monthly', startDate: '2023-01-01', endDate: 'Ongoing', veterinarian: 'Dr. Smith', notes: 'Given with food.'},
  { id: 'm2', name: 'Flea & Tick', dosage: '1 topical monthly', startDate: '2023-01-01', endDate: 'Ongoing', veterinarian: 'Dr. Smith' },
];

const healthDataWeight = [
  { date: 'Jan 2024', weight: 68 }, { date: 'Feb 2024', weight: 69 }, { date: 'Mar 2024', weight: 70 },
  { date: 'Apr 2024', weight: 70.5 }, { date: 'May 2024', weight: 70 }, { date: 'Jun 2024', weight: 71 },
];

const healthDataActivity = [
  { date: 'Jan 2024', level: 5 }, { date: 'Feb 2024', level: 6 }, { date: 'Mar 2024', level: 5.5 },
  { date: 'Apr 2024', level: 7 }, { date: 'May 2024', level: 6 }, { date: 'Jun 2024', level: 6.5 },
];


export default function PetProfilePage({ params }: { params: { petId: string } }) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [pet, setPet] = useState<PetData | null>(null);
  const [petVaccinations, setPetVaccinations] = useState<VaccinationRecord[]>([]);
  const [isLoadingPet, setIsLoadingPet] = useState(true);
  const [isLoadingVaccinations, setIsLoadingVaccinations] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVaccinationDialogOpen, setIsVaccinationDialogOpen] = useState(false);

  const vaccinationForm = useForm<VaccinationFormValues>({
    resolver: zodResolver(vaccinationFormSchema),
  });

  useEffect(() => {
    if (authLoading) {
      setIsLoadingPet(true);
      return;
    }

    if (!user) {
      setIsLoadingPet(false);
      setError("You must be logged in to view this page.");
      return;
    }
    
    if (!params.petId) {
      setError("Pet ID is missing.");
      setIsLoadingPet(false);
      return;
    }

    setIsLoadingPet(true);
    setError(null);
    const petDocRef = doc(db, "pets", params.petId);

    const unsubscribePet = onSnapshot(petDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const petData = { id: docSnap.id, ...docSnap.data() } as PetData;
        if (petData.userId !== user.uid) {
          setError("Access denied. This pet does not belong to you.");
          setPet(null);
        } else {
          setPet(petData);
        }
      } else {
        setError("Pet not found.");
        setPet(null);
      }
      setIsLoadingPet(false);
    }, (err) => {
      console.error("Error fetching pet profile: ", err);
      setError("Failed to load pet profile.");
      setIsLoadingPet(false);
    });

    return () => unsubscribePet();
  }, [params.petId, user, authLoading, router]);

  useEffect(() => {
    if (!user || !params.petId) {
      setPetVaccinations([]);
      setIsLoadingVaccinations(false);
      return;
    }
    setIsLoadingVaccinations(true);
    const q = query(
      collection(db, "vaccinations"),
      where("userId", "==", user.uid),
      where("petId", "==", params.petId),
      orderBy("dateAdministered", "desc")
    );

    const unsubscribeVaccinations = onSnapshot(q, (querySnapshot) => {
      const recordsData: VaccinationRecord[] = [];
      querySnapshot.forEach((doc) => {
        recordsData.push({ id: doc.id, ...doc.data() } as VaccinationRecord);
      });
      setPetVaccinations(recordsData);
      setIsLoadingVaccinations(false);
    }, (err) => {
      console.error(`Error fetching vaccinations for pet ${params.petId}: `, err);
      // Don't set a page-level error, just log it or show a small indicator in the tab
      toast({ title: "Error", description: "Could not load vaccination records for this pet.", variant: "destructive"});
      setIsLoadingVaccinations(false);
    });
     return () => unsubscribeVaccinations();
  }, [user, params.petId, toast]);


  async function onAddVaccination(values: VaccinationFormValues) {
    if (!user || !pet) {
      toast({ title: "Error", description: "User or pet data missing.", variant: "destructive" });
      return;
    }
    try {
      await addDoc(collection(db, "vaccinations"), {
        userId: user.uid,
        petId: pet.id,
        petName: pet.name, // Denormalize for easier querying on overview pages
        vaccineName: values.vaccineName,
        dateAdministered: format(values.dateAdministered, "yyyy-MM-dd"),
        nextDueDate: values.nextDueDate ? format(values.nextDueDate, "yyyy-MM-dd") : null,
        veterinarian: values.veterinarian,
        createdAt: serverTimestamp(),
      });
      toast({ title: "Success", description: "Vaccination record added." });
      vaccinationForm.reset();
      setIsVaccinationDialogOpen(false);
    } catch (e) {
      console.error("Error adding vaccination record: ", e);
      toast({ title: "Error", description: "Could not add vaccination record.", variant: "destructive" });
    }
  }


  if (authLoading || isLoadingPet) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading pet profile...</p>
      </div>
    );
  }

  if (error) {
    return (
       <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2 text-destructive">Error</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Link href="/pets">
          <Button variant="outline">Back to My Pets</Button>
        </Link>
      </div>
    );
  }
  
  if (!pet) {
     return ( 
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <PawPrint className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Pet Not Found</h2>
        <p className="text-muted-foreground mb-4">The pet profile could not be loaded or you don't have access.</p>
        <Link href="/pets">
          <Button variant="outline">Back to My Pets</Button>
        </Link>
      </div>
    );
  }


  return (
    <>
      <PageHeader
        title={pet.name}
        description={`${pet.species} ${pet.breed ? `- ${pet.breed}` : ''}`}
        icon={PawPrint}
        action={
          <Link href={`/pets/${pet.id}/edit`}> 
            <Button variant="outline" disabled> 
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          </Link>
        }
      />

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
          <TabsTrigger value="medications">Medications</TabsTrigger>
          <TabsTrigger value="health_charts">Health Charts</TabsTrigger>
          <TabsTrigger value="sharing">Records & Sharing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Pet Details</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
              <div className="relative w-full h-64 md:min-h-[300px] rounded-lg overflow-hidden shadow-md bg-muted">
                <Image 
                  src={pet.imageUrl || 'https://placehold.co/400x300.png'} 
                  alt={pet.name} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: 'cover' }}
                  data-ai-hint={pet.dataAiHint || pet.species?.toLowerCase() || 'animal'}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/400x300.png';
                     (e.target as HTMLImageElement).dataset.aiHint = 'placeholder animal';
                  }}
                />
              </div>
              <div className="space-y-4">
                <div><strong className="text-foreground">Name:</strong> {pet.name}</div>
                <div><strong className="text-foreground">Species:</strong> {pet.species}</div>
                {pet.breed && <div><strong className="text-foreground">Breed:</strong> {pet.breed}</div>}
                {pet.age && <div><strong className="text-foreground">Age:</strong> {pet.age}</div>}
                {pet.dateOfBirth && <div><strong className="text-foreground">Date of Birth:</strong> {pet.dateOfBirth}</div>}
                {pet.gender && pet.gender !== "unknown" && <div><strong className="text-foreground">Gender:</strong> {pet.gender}</div>}
                {pet.color && <div><strong className="text-foreground">Color:</strong> {pet.color}</div>}
                {pet.weight && <div><strong className="text-foreground">Weight:</strong> {pet.weight}</div>}
                {pet.notes && (
                  <div className="pt-2 border-t">
                    <strong className="text-foreground">Notes:</strong>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{pet.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vaccinations">
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Vaccination Records</CardTitle>
                <CardDescription>Track {pet.name}&apos;s vaccination history and upcoming due dates.</CardDescription>
              </div>
               <Dialog open={isVaccinationDialogOpen} onOpenChange={setIsVaccinationDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Record</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add Vaccination Record</DialogTitle>
                    <DialogDescription>Enter the details for {pet.name}&apos;s new vaccination.</DialogDescription>
                  </DialogHeader>
                  <form onSubmit={vaccinationForm.handleSubmit(onAddVaccination)} className="space-y-4 py-4">
                    <div>
                      <Label htmlFor="vaccineName">Vaccine Name</Label>
                      <Input id="vaccineName" {...vaccinationForm.register("vaccineName")} />
                      {vaccinationForm.formState.errors.vaccineName && <p className="text-xs text-destructive mt-1">{vaccinationForm.formState.errors.vaccineName.message}</p>}
                    </div>
                    <Controller
                        name="dateAdministered"
                        control={vaccinationForm.control}
                        render={({ field }) => (
                          <div className="space-y-1">
                            <Label>Date Administered</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <CalendarIconLucide className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                             {vaccinationForm.formState.errors.dateAdministered && <p className="text-xs text-destructive mt-1">{vaccinationForm.formState.errors.dateAdministered.message}</p>}
                          </div>
                        )}
                      />
                    <Controller
                        name="nextDueDate"
                        control={vaccinationForm.control}
                        render={({ field }) => (
                           <div className="space-y-1">
                            <Label>Next Due Date (Optional)</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant={"outline"}
                                  className="w-full justify-start text-left font-normal"
                                >
                                  <CalendarIconLucide className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0">
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        )}
                      />
                    <div>
                      <Label htmlFor="veterinarian">Veterinarian</Label>
                      <Input id="veterinarian" {...vaccinationForm.register("veterinarian")} />
                       {vaccinationForm.formState.errors.veterinarian && <p className="text-xs text-destructive mt-1">{vaccinationForm.formState.errors.veterinarian.message}</p>}
                    </div>
                     <DialogFooter>
                      <Button type="button" variant="ghost" onClick={() => setIsVaccinationDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={vaccinationForm.formState.isSubmitting}>
                        {vaccinationForm.formState.isSubmitting ? "Saving..." : "Save Record"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {isLoadingVaccinations ? (
                 <div className="flex justify-center items-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="ml-2 text-muted-foreground">Loading vaccinations...</p>
                 </div>
              ) : petVaccinations.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vaccine Name</TableHead>
                      <TableHead>Date Administered</TableHead>
                      <TableHead>Next Due Date</TableHead>
                      <TableHead>Veterinarian</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {petVaccinations.map((vax) => (
                      <TableRow key={vax.id}>
                        <TableCell className="font-medium">{vax.vaccineName}</TableCell>
                        <TableCell>{format(new Date(vax.dateAdministered), "MMM dd, yyyy")}</TableCell>
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
                          <Button variant="ghost" size="icon" disabled><Edit3 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-muted-foreground text-center py-4">No vaccination records found for {pet.name}. Add one to get started!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="medications">
          <Card className="shadow-lg">
             <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Medication Log</CardTitle>
                <CardDescription>Manage {pet.name}&apos;s current and past medications. (Mock Data)</CardDescription>
              </div>
              <Button size="sm" variant="outline" disabled><PlusCircle className="mr-2 h-4 w-4" /> Add Medication</Button>
            </CardHeader>
            <CardContent>
              {medications.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medication Name</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Prescribed By</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medications.map((med) => (
                      <TableRow key={med.id}>
                        <TableCell className="font-medium">{med.name}</TableCell>
                        <TableCell>{med.dosage}</TableCell>
                        <TableCell>{med.startDate}</TableCell>
                        <TableCell>{med.endDate}</TableCell>
                        <TableCell>{med.veterinarian}</TableCell>
                        <TableCell className="text-right">
                           <Button variant="ghost" size="icon" disabled><Edit3 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                 <p className="text-muted-foreground text-center py-4">No medication records found for {pet.name}.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health_charts">
           <CardDescription className="mb-4 text-center">Health chart data below is mock data and not connected to this pet.</CardDescription>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Weight Tracking</CardTitle>
                <CardDescription>Monthly weight changes for {pet.name}.</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={healthDataWeight} margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" />
                    <RechartsTooltip content={<ChartTooltipContent nameKey="date" labelKey="weight" />} cursor={false}/>
                    <Line type="monotone" dataKey="weight" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 4, fill: "hsl(var(--primary))" }} activeDot={{ r: 6 }} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Activity Level</CardTitle>
                <CardDescription>Estimated daily activity for {pet.name}. (Scale 1-10)</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={healthDataActivity} margin={{ top: 5, right: 20, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
                    <YAxis stroke="hsl(var(--foreground))" domain={[0,10]}/>
                    <RechartsTooltip content={<ChartTooltipContent nameKey="date" labelKey="level" />} cursor={false}/>
                    <Bar dataKey="level" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sharing">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Medical Records & Sharing</CardTitle>
              <CardDescription>Export {pet.name}&apos;s records or share them with veterinarians. (Functionality Coming Soon)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg bg-secondary/30">
                <h3 className="font-semibold text-lg mb-2 flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" /> Export Records</h3>
                <p className="text-sm text-muted-foreground mb-3">Download a comprehensive PDF of {pet.name}&apos;s medical history, including vaccinations and medications.</p>
                <Button disabled><Download className="mr-2 h-4 w-4" /> Export as PDF</Button>
              </div>
              <div className="p-4 border rounded-lg bg-secondary/30">
                <h3 className="font-semibold text-lg mb-2 flex items-center"><Share2 className="mr-2 h-5 w-5 text-accent" /> Share with Veterinarian</h3>
                <p className="text-sm text-muted-foreground mb-3">Grant temporary access to {pet.name}&apos;s records to a veterinarian. Requires Pro plan.</p>
                {true ? ( 
                  <div className="space-y-3">
                    
                    <div className="flex gap-2">
                       <Input id="vetEmail" type="email" placeholder="vet@example.com" className="w-full p-2 border rounded-md" disabled />
                       <Button variant="outline" disabled>Send Invite</Button>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium text-md mb-1 flex items-center"><Users className="mr-2 h-4 w-4"/>Current Sharing Permissions:</h4>
                      <ul className="text-sm list-disc list-inside pl-2 text-muted-foreground">
                        <li>Dr. Smith (Primary Vet) - Full Access (Mock)</li>
                        <li>Animal Hospital XYZ (Emergency Contact) - Read-only until 2024-09-01 (Mock)</li>
                      </ul>
                    </div>
                  </div>
                ) : (
                  <Button disabled>Upgrade to Pro to Share Records</Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}


    