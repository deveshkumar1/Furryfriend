"use client";

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { PawPrint, UploadCloud } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useState } from 'react';

const petFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  species: z.string().min(1, { message: "Species is required." }),
  breed: z.string().optional(),
  dateOfBirth: z.string().optional(), // Could use a date picker
  gender: z.enum(["male", "female", "unknown"]).optional(),
  color: z.string().optional(),
  weight: z.string().optional(), // Could be number, handle units
  notes: z.string().optional(),
  profilePicture: z.any().optional(), // For file upload
});

type PetFormValues = z.infer<typeof petFormSchema>;

export default function NewPetPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {
      name: '',
      species: '',
      breed: '',
      dateOfBirth: '',
      gender: 'unknown',
      color: '',
      weight: '',
      notes: '',
    },
  });

  function onSubmit(values: PetFormValues) {
    console.log('New pet data:', values);
    // In a real app, save the pet data
    toast({
      title: "Pet Profile Created!",
      description: `${values.name} has been added to your pets.`,
    });
    router.push('/pets');
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('profilePicture', file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  return (
    <>
      <PageHeader
        title="Add New Pet"
        description="Create a profile for your new furry family member."
        icon={PawPrint}
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Pet Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pet&apos;s Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Buddy" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="species"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Species</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select species" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="dog">Dog</SelectItem>
                          <SelectItem value="cat">Cat</SelectItem>
                          <SelectItem value="bird">Bird</SelectItem>
                          <SelectItem value="reptile">Reptile</SelectItem>
                          <SelectItem value="small_mammal">Small Mammal</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="profilePicture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Picture</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-4">
                        {previewImage ? (
                           <Image src={previewImage} alt="Pet preview" width={100} height={100} className="rounded-md object-cover" />
                        ) : (
                          <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center">
                            <PawPrint className="w-10 h-10 text-muted-foreground" />
                          </div>
                        )}
                        <Button type="button" variant="outline" asChild>
                          <label htmlFor="profilePictureFile" className="cursor-pointer flex items-center gap-2">
                            <UploadCloud className="h-4 w-4" /> Upload Image
                            <input id="profilePictureFile" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                          </label>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />


              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breed (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Golden Retriever" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="unknown">Unknown</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Golden, Black & White" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="weight"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Weight (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 15 lbs or 7 kg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any allergies, special needs, or fun facts about your pet."
                        className="resize-none"
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit">Save Pet Profile</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
