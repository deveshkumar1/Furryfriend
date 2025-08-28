

"use client"; // Needs to be a client component to use hooks

import { Suspense, useRef } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, Edit3, Mail, Phone, MapPin, Loader2, AlertTriangle, UploadCloud } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, DocumentData } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { useToast } from '@/hooks/use-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';


interface UserProfileData extends DocumentData {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatarUrl?: string;
  storagePath?: string; // To keep track of the file in Storage
  dataAiHint?: string;
}

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/
);

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().regex(phoneRegex, 'Invalid phone number format.').optional().or(z.literal('')),
  address: z.string().optional(),
  bio: z.string().max(500, "Bio can be at most 500 characters.").optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;


function ProfilePageContent() {
  const { user, userProfile: authUserProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [newAvatarFile, setNewAvatarFile] = useState<File | null>(null);
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: { name: '', phone: '', address: '', bio: '' },
  });

  const profileUserId = searchParams.get('userId') || user?.uid;

  useEffect(() => {
    if (authLoading) return;

    if (!profileUserId) {
        setIsLoading(false);
        return;
    }

    const canViewProfile = authUserProfile?.isAdmin || profileUserId === user?.uid;
    if (!canViewProfile) {
      toast({ variant: 'destructive', title: 'Access Denied', description: "You don't have permission to view this profile." });
      router.push('/dashboard');
      return;
    }
    
    setIsLoading(true);
    const userDocRef = doc(db, "users", profileUserId);
    getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
            const data = { uid: docSnap.id, ...docSnap.data() } as UserProfileData;
            setProfileData(data);
            form.reset({
                name: data.name || '',
                phone: data.phone || '',
                address: data.address || '',
                bio: data.bio || '',
            });
        } else {
             toast({ variant: 'destructive', title: 'Not Found', description: 'User profile could not be found.' });
             router.push(authUserProfile?.isAdmin ? '/admin/users' : '/dashboard');
        }
    }).catch(error => {
        console.error("Error fetching profile:", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load profile data.' });
    }).finally(() => {
        setIsLoading(false);
    });

  }, [profileUserId, user?.uid, authUserProfile, authLoading, router, toast, form]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  async function onSubmit(values: ProfileFormValues) {
    if (!profileUserId || !profileData || !user) {
        toast({ title: "Error", description: "User data is missing or you are not logged in.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    
    let avatarUrl = profileData.avatarUrl || '';
    let storagePath = profileData.storagePath || '';

    try {
        if (newAvatarFile) {
            // **FIX:** The storage path MUST be constructed with the currently authenticated user's UID (`user.uid`),
            // which in the admin's case is the admin's own ID. This guarantees write permissions.
            // The file is still associated with the correct profile via its `avatarUrl` field in Firestore.
            const newStoragePath = `users/${user.uid}/avatar/avatar-${uuidv4()}`;
            const newFileRef = ref(storage, newStoragePath);
            await uploadBytes(newFileRef, newAvatarFile);
            avatarUrl = await getDownloadURL(newFileRef);
            storagePath = newStoragePath;
            
            if (profileData.storagePath) {
                const oldFileRef = ref(storage, profileData.storagePath);
                await deleteObject(oldFileRef).catch(err => {
                    console.warn("Could not delete old avatar, it might not exist:", err);
                });
            }
        }
    } catch(error) {
        console.error("Error uploading avatar: ", error);
        toast({ title: "Avatar Upload Failed", description: "Could not save the new avatar. Please check your Storage security rules and network connection.", variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    try {
        const userDocRef = doc(db, "users", profileUserId);
        const updatedData = {
            name: values.name,
            phone: values.phone || "",
            address: values.address || "",
            bio: values.bio || "",
            avatarUrl,
            storagePath
        };

        await updateDoc(userDocRef, updatedData);

        toast({ title: "Profile Updated", description: "The profile has been successfully updated." });
        setIsEditing(false);
        setNewAvatarFile(null);
        setPreviewAvatarUrl(null);
        setProfileData(prev => prev ? { ...prev, ...updatedData } : null);

    } catch (error) {
        console.error("Error updating profile:", error);
        toast({ title: "Update Failed", description: "Could not update profile. Please try again.", variant: "destructive"});
    } finally {
        setIsSubmitting(false);
    }
  }


  if (isLoading || authLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!profileData) {
    return (
       <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Profile Not Found</h2>
        <p className="text-muted-foreground mb-4">Could not load the requested profile data.</p>
      </div>
    );
  }
  
  const getInitials = (name?: string) => {
    if (!name) return profileData.email?.[0]?.toUpperCase() || 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase();
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
  };

  const currentAvatarSrc = previewAvatarUrl || profileData.avatarUrl;


  return (
    <>
      <PageHeader
        title={profileUserId === user?.uid ? "My Profile" : `${profileData.name}'s Profile`}
        description="View and update personal information."
        icon={UserCircle}
        action={
          !isEditing && (authUserProfile?.isAdmin || authUserProfile?.uid === profileUserId) ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          ) : null
        }
      />
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary/30">
              <AvatarImage src={currentAvatarSrc} alt={profileData.name} />
              <AvatarFallback>{getInitials(profileData.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">{profileData.name}</CardTitle>
              <CardDescription className="text-md flex items-center gap-2 mt-1">
                <Mail size={16} className="text-muted-foreground" /> {profileData.email}
              </CardDescription>
               {isEditing && 
                  <Button size="sm" variant="outline" className="mt-3" asChild>
                    <label htmlFor="avatar-upload" className="cursor-pointer">
                      <UploadCloud className="mr-2 h-4 w-4"/>
                      Change Avatar
                      <input id="avatar-upload" type="file" className="sr-only" accept="image/*" onChange={handleAvatarChange} disabled={isSubmitting}/>
                    </label>
                  </Button>
               }
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input {...field} disabled={!isEditing || isSubmitting} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="e.g., (555) 123-4567" disabled={!isEditing || isSubmitting} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
              </div>
              <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="e.g., 123 Main St, Anytown, USA" disabled={!isEditing || isSubmitting} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="bio"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>About Me</FormLabel>
                        <FormControl>
                            <Textarea rows={4} className="resize-none" {...field} placeholder="Tell us a little about you and your pets..." disabled={!isEditing || isSubmitting} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              {isEditing && (
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => { setIsEditing(false); form.reset({name: profileData.name, phone: profileData.phone || '', address: profileData.address || '', bio: profileData.bio || ''}); setPreviewAvatarUrl(null); setNewAvatarFile(null); }} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={<div className="flex justify-center items-center h-64"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
            <ProfilePageContent />
        </Suspense>
    )
}

    

    