
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageHeader } from '@/components/shared/page-header';
import { PawPrint, UploadCloud, AlertTriangle, Loader2, Edit3 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { db, storage } from '@/lib/firebase'; 
import { doc, getDoc, updateDoc, DocumentData } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { useAuth } from '@/context/AuthContext';
import { v4 as uuidv4 } from 'uuid';

const petFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  species: z.string().min(1, { message: "Species is required." }),
  breed: z.string().optional(),
  age: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "unknown"]).optional(),
  color: z.string().optional(),
  weight: z.string().optional(),
  notes: z.string().optional(),
  profilePicture: z.any().optional(),
});

type PetFormValues = z.infer<typeof petFormSchema>;

interface PetData extends DocumentData {
    id: string;
    name: string;
    species: string;
    breed?: string;
    age?: string;
    imageUrl?: string;
    dataAiHint?: string;
    dateOfBirth?: string;
    gender?: 'male' | 'female' | 'unknown';
    color?: string;
    weight?: string;
    notes?: string;
    userId?: string;
    storagePath?: string;
}

export default function EditPetPage() {
  const router = useRouter();
  const params = useParams();
  const petId = params.petId as string;
  const { toast } = useToast();
  const { user, userProfile, loading: authLoading } = useAuth();
  
  const [petData, setPetData] = useState<PetData | null>(null);
  const [isLoadingPet, setIsLoadingPet] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);


  const form = useForm<PetFormValues>({
    resolver: zodResolver(petFormSchema),
    defaultValues: {},
  });

  useEffect(() => {
    if (!petId || !user) return;
    setIsLoadingPet(true);
    const petDocRef = doc(db, 'pets', petId);
    getDoc(petDocRef).then(docSnap => {
        if (docSnap.exists()) {
            const data = { id: docSnap.id, ...docSnap.data() } as PetData;
             if (!userProfile?.isAdmin && data.userId !== user.uid) {
                toast({ variant: 'destructive', title: 'Access Denied', description: "You don't have permission to edit this pet." });
                router.push('/pets');
                return;
            }
            setPetData(data);
            form.reset({
                name: data.name,
                species: data.species,
                breed: data.breed || '',
                age: data.age || '',
                dateOfBirth: data.dateOfBirth || '',
                gender: data.gender || 'unknown',
                color: data.color || '',
                weight: data.weight || '',
                notes: data.notes || '',
            });
            if(data.imageUrl) {
                setPreviewImage(data.imageUrl);
            }
        } else {
            toast({ variant: 'destructive', title: 'Not Found', description: 'Pet profile could not be found.' });
            router.push('/pets');
        }
    }).catch(error => {
        console.error("Error fetching pet for editing:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load pet data.' });
    }).finally(() => {
        setIsLoadingPet(false);
    });
  }, [petId, user, userProfile, form, router, toast]);

  async function onSubmit(values: PetFormValues) {
    if (!user || !petData) {
      toast({ title: "Authentication Error", description: "You must be logged in to update a pet.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);

    let imageUrl = petData.imageUrl || '';
    let storagePath = petData.storagePath || '';
    let dataAiHint = petData.dataAiHint || values.species?.toLowerCase() || 'animal';

    try {
        if (newImageFile) {
            // If there's an old image, delete it from storage
            if (storagePath) {
                const oldFileRef = ref(storage, storagePath);
                await deleteObject(oldFileRef).catch(err => console.warn("Old file not found, skipping deletion:", err));
            }
            // Upload the new image
            storagePath = `users/${petData.userId}/pets/${petId}/profile-${uuidv4()}`;
            const newFileRef = ref(storage, storagePath);
            await uploadBytes(newFileRef, newImageFile);
            imageUrl = await getDownloadURL(newFileRef);
        }
    } catch(error) {
        console.error("Error uploading image: ", error);
        toast({ title: "Image Upload Failed", description: "Could not save the new profile picture.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }
    
    const updatedPetData = {
      name: values.name,
      species: values.species,
      breed: values.breed || '',
      age: values.age || '',
      dateOfBirth: values.dateOfBirth || '',
      gender: values.gender || 'unknown',
      color: values.color || '',
      weight: values.weight || '',
      notes: values.notes || '',
      imageUrl,
      storagePath,
      dataAiHint,
      // We don't update userId or createdAt
    };

    try {
      const docRef = doc(db, 'pets', petId);
      await updateDoc(docRef, updatedPetData);
      toast({ title: "Pet Profile Updated!", description: `${values.name}'s profile has been saved.` });
      router.push(`/pets/${petId}`);
    } catch (error) {
      console.error("Error updating document: ", error);
      toast({ title: "Error", description: "Could not update pet profile. Please try again.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  if (authLoading || isLoadingPet) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return (
       <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-4">Please log in to edit a pet.</p>
        <Button onClick={() => router.push('/')}>Go to Login</Button>
      </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Edit Pet Profile"
        description={`Updating information for ${petData?.name || 'your pet'}.`}
        icon={Edit3}
      />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Pet Information</CardTitle>
           <CardDescription>Make changes to the profile below and click save.</CardDescription>
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
                        <Input placeholder="e.g., Buddy" {...field} disabled={isSubmitting} />
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
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select species" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Dog">Dog</SelectItem>
                          <SelectItem value="Cat">Cat</SelectItem>
                          <SelectItem value="Bird">Bird</SelectItem>
                          <SelectItem value="Reptile">Reptile</SelectItem>
                          <SelectItem value="Small Mammal">Small Mammal</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormItem>
                <FormLabel>Profile Picture (Preview)</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    {previewImage ? (
                       <Image src={previewImage} alt="Pet preview" width={100} height={100} className="rounded-md object-cover" />
                    ) : (
                      <div className="w-24 h-24 bg-muted rounded-md flex items-center justify-center">
                        <PawPrint className="w-10 h-10 text-muted-foreground" />
                      </div>
                    )}
                    <Button type="button" variant="outline" asChild disabled={isSubmitting}>
                      <label htmlFor="profilePictureFile" className="cursor-pointer flex items-center gap-2">
                        <UploadCloud className="h-4 w-4" /> Change Image
                        <input id="profilePictureFile" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} disabled={isSubmitting} />
                      </label>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage>{form.formState.errors.profilePicture?.message as React.ReactNode}</FormMessage>
              </FormItem>

              <div className="grid md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="breed"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Breed (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Golden Retriever" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Age (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 3 years, 6 months" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid md:grid-cols-3 gap-6">
                 <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSubmitting}>
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
                        <Input placeholder="e.g., Golden, Black & White" {...field} disabled={isSubmitting} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 15 lbs or 7 kg" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || authLoading}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
