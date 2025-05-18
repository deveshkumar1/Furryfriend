"use client";

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, HeartPulse, LineChart, PlusCircle, ShieldCheck, Users, CalendarDays, PawPrint } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';


const mockPetHealthData = [
  { name: 'Buddy', healthScore: 85, species: 'Dog' },
  { name: 'Lucy', healthScore: 92, species: 'Cat' },
  { name: 'Charlie', healthScore: 78, species: 'Dog' },
];

const mockAppointmentsData = [
  { id: '1', petName: 'Buddy', vetName: 'Dr. Smith', date: '2024-08-15', time: '10:00 AM', type: 'Check-up' },
  { id: '2', petName: 'Lucy', vetName: 'Dr. Pawson', date: '2024-08-20', time: '02:30 PM', type: 'Vaccination' },
];

const activityData = [
  { month: "January", activity: 186 },
  { month: "February", activity: 305 },
  { month: "March", activity: 237 },
  { month: "April", activity: 273 },
  { month: "May", activity: 209 },
  { month: "June", activity: 214 },
];
const chartConfig = {
  activity: { label: "Activity Level", color: "hsl(var(--primary))" },
}

const speciesData = [
  { name: 'Dogs', value: 2, fill: 'hsl(var(--chart-1))' },
  { name: 'Cats', value: 1, fill: 'hsl(var(--chart-2))' },
];


export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your pet care activities."
        icon={LineChart}
        action={
          <Link href="/pets/new">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Pet
            </Button>
          </Link>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pets</CardTitle>
            <PawPrint className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPetHealthData.length}</div>
            <p className="text-xs text-muted-foreground">Manage all your furry friends</p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Appointments</CardTitle>
            <CalendarDays className="h-5 w-5 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAppointmentsData.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockAppointmentsData.length > 0 ? `Next: ${mockAppointmentsData[0].petName} on ${mockAppointmentsData[0].date}` : "No upcoming appointments"}
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Subscription Status</CardTitle>
            <DollarSign className="h-5 w-5 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Premium Plan</div>
            <p className="text-xs text-muted-foreground">
              <Link href="/subscriptions" className="hover:underline text-primary">Manage Subscription</Link>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 mt-6 md:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Pet Health Overview</CardTitle>
            <CardDescription>Average health scores of your pets.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockPetHealthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" domain={[0, 100]} />
                <ChartTooltip
                  content={<ChartTooltipContent labelKey="healthScore" nameKey="name" cursor={false} />}
                  
                />
                <Bar dataKey="healthScore" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>Pet Species Distribution</CardTitle>
            <CardDescription>Breakdown of your pets by species.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
             <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Pie data={speciesData} dataKey="value" nameKey="name" labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>
                   {speciesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6 shadow-lg">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Placeholder for recent activities or alerts.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50">
              <ShieldCheck className="h-5 w-5 text-green-500" />
              <span>Buddy's annual vaccination is due next week.</span>
            </li>
            <li className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50">
              <HeartPulse className="h-5 w-5 text-red-500" />
              <span>Lucy's medication dosage updated by Dr. Pawson.</span>
            </li>
             <li className="flex items-center gap-3 p-2 rounded-md hover:bg-secondary/50">
              <Image src="https://placehold.co/40x40.png" alt="Product" width={40} height={40} className="rounded" data-ai-hint="pet food" />
              <span>New organic pet food available in the marketplace.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </>
  );
}
