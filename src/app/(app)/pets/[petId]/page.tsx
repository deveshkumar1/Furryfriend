import Image from 'next/image';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PawPrint, Edit3, ShieldCheck, Pill, LineChart, Share2, PlusCircle, CalendarIcon, FileText, Download, Users } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Bar, LineChart as RechartsLineChart, Line } from 'recharts';
import { ChartTooltipContent } from '@/components/ui/chart';

// Mock data, replace with actual data fetching based on params.petId
const pet = {
  id: '1',
  name: 'Buddy',
  species: 'Dog',
  breed: 'Golden Retriever',
  age: '3 years',
  dateOfBirth: '2021-05-10',
  gender: 'Male',
  color: 'Golden',
  weight: '70 lbs',
  notes: 'Loves playing fetch and is allergic to chicken.',
  imageUrl: 'https://placehold.co/400x300.png',
  dataAiHint: 'golden retriever happy',
};

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
  // In a real app, fetch pet data using params.petId
  if (!pet) return <div>Pet not found.</div>;

  return (
    <>
      <PageHeader
        title={pet.name}
        description={`${pet.species} - ${pet.breed}`}
        icon={PawPrint}
        action={
          <Link href={`/pets/${pet.id}/edit`}> {/* Placeholder for edit page */}
            <Button variant="outline">
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
              <div className="relative w-full h-64 md:h-auto rounded-lg overflow-hidden shadow-md">
                <Image src={pet.imageUrl} alt={pet.name} layout="fill" objectFit="cover" data-ai-hint={pet.dataAiHint} />
              </div>
              <div className="space-y-4">
                <div><strong className="text-foreground">Name:</strong> {pet.name}</div>
                <div><strong className="text-foreground">Species:</strong> {pet.species}</div>
                <div><strong className="text-foreground">Breed:</strong> {pet.breed}</div>
                <div><strong className="text-foreground">Age:</strong> {pet.age}</div>
                <div><strong className="text-foreground">Date of Birth:</strong> {pet.dateOfBirth}</div>
                <div><strong className="text-foreground">Gender:</strong> {pet.gender}</div>
                <div><strong className="text-foreground">Color:</strong> {pet.color}</div>
                <div><strong className="text-foreground">Weight:</strong> {pet.weight}</div>
                {pet.notes && (
                  <div className="pt-2 border-t">
                    <strong className="text-foreground">Notes:</strong>
                    <p className="text-sm text-muted-foreground mt-1">{pet.notes}</p>
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
              <Button size="sm" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Record</Button> {/* Placeholder */}
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
                          <Button variant="ghost" size="icon"><Edit3 className="h-4 w-4" /></Button>
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
                <CardDescription>Manage {pet.name}&apos;s current and past medications.</CardDescription>
              </div>
              <Button size="sm" variant="outline"><PlusCircle className="mr-2 h-4 w-4" /> Add Medication</Button> {/* Placeholder */}
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
                           <Button variant="ghost" size="icon"><Edit3 className="h-4 w-4" /></Button>
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
                    <RechartsTooltip content={<ChartTooltipContent nameKey="date" labelKey="weight" unit=" lbs" />} cursor={false}/>
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
              <CardDescription>Export {pet.name}&apos;s records or share them with veterinarians.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg bg-secondary/30">
                <h3 className="font-semibold text-lg mb-2 flex items-center"><FileText className="mr-2 h-5 w-5 text-primary" /> Export Records</h3>
                <p className="text-sm text-muted-foreground mb-3">Download a comprehensive PDF of {pet.name}&apos;s medical history, including vaccinations and medications.</p>
                <Button><Download className="mr-2 h-4 w-4" /> Export as PDF</Button>
              </div>
              <div className="p-4 border rounded-lg bg-secondary/30">
                <h3 className="font-semibold text-lg mb-2 flex items-center"><Share2 className="mr-2 h-5 w-5 text-accent" /> Share with Veterinarian</h3>
                <p className="text-sm text-muted-foreground mb-3">Grant temporary access to {pet.name}&apos;s records to a veterinarian. Requires Pro plan.</p>
                {/* Feature Gating Example */}
                {true ? ( // Replace with actual subscription check
                  <div className="space-y-3">
                    <Label htmlFor="vetEmail">Veterinarian&apos;s Email</Label>
                    <div className="flex gap-2">
                       <input id="vetEmail" type="email" placeholder="vet@example.com" className="w-full p-2 border rounded-md" />
                       <Button variant="outline">Send Invite</Button>
                    </div>
                    <div className="mt-4">
                      <h4 className="font-medium text-md mb-1 flex items-center"><Users className="mr-2 h-4 w-4"/>Current Sharing Permissions:</h4>
                      <ul className="text-sm list-disc list-inside pl-2 text-muted-foreground">
                        <li>Dr. Smith (Primary Vet) - Full Access</li>
                        <li>Animal Hospital XYZ (Emergency Contact) - Read-only until 2024-09-01</li>
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
