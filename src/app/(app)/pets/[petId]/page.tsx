
"use client";

import Image from 'next/image';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PawPrint, Edit3, ShieldCheck, Pill, LineChart, Share2, PlusCircle, CalendarIcon, FileText, Download, Users, Loader2, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Checkbox } from '@/components/ui/checkbox'; // Not used
// import { Label } from '@/components/ui/label'; // Not used
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Bar, LineChart as RechartsLineChart, Line } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot, DocumentData } from 'firebase/firestore';

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
}

// Mock data for sub-tabs, replace with Firestore fetching later
const vaccinations = [
  { id: 'v1', name: 'Rabies', date: '2023-06-15', nextDueDate: '2024-06-15', veterinarian: 'Dr. Smith' },
  { id: 'v2', name: 'Distemper', date: '2023-06-15', nextDueDate: '2024-06-15', veterinarian: 'Dr. Smith' },
];

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
  const [pet, setPet] = useState<PetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.petId) {
      setError("Pet ID is missing.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const petDocRef = doc(db, "pets", params.petId);

    const unsubscribe = onSnapshot(petDocRef, (docSnap) => {
      if (docSnap.exists()) {
        setPet({ id: docSnap.id, ...docSnap.data() } as PetData);
      } else {
        setError("Pet not found.");
        setPet(null);
      }
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching pet profile: ", err);
      setError("Failed to load pet profile.");
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [params.petId]);

  if (isLoading) {
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
     return ( // Should be caught by error state, but as a fallback
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <PawPrint className="w-16 h-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Pet Not Found</h2>
        <p className="text-muted-foreground mb-4">The pet profile could not be loaded.</p>
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
          <Link href={`/pets/${pet.id}/edit`}> {/* Placeholder for edit page */}
            <Button variant="outline" disabled> {/* TODO: Enable edit functionality */}
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
                <CardDescription>Track {pet.name}&apos;s vaccination history and upcoming due dates. (Mock Data)</CardDescription>
              </div>
              <Button size="sm" variant="outline" disabled><PlusCircle className="mr-2 h-4 w-4" /> Add Record</Button>
            </CardHeader>
            <CardContent>
              {vaccinations.length > 0 ? (
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
                    {vaccinations.map((vax) => (
                      <TableRow key={vax.id}>
                        <TableCell className="font-medium">{vax.name}</TableCell>
                        <TableCell>{vax.date}</TableCell>
                        <TableCell>
                          <Badge variant={new Date(vax.nextDueDate) < new Date() ? "destructive" : "default"}>
                            {vax.nextDueDate}
                          </Badge>
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
                <p className="text-muted-foreground text-center py-4">No vaccination records found for {pet.name}.</p>
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
                {true ? ( // Replace with actual subscription check
                  <div className="space-y-3">
                    {/* <Label htmlFor="vetEmail">Veterinarian&apos;s Email</Label> */} {/* Label not used with current setup */}
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
