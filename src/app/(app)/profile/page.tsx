
"use client"; // Needs to be a client component to use hooks

import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, Edit3, Mail, Phone, MapPin, Loader2, AlertTriangle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';


interface UserProfileData extends DocumentData {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  bio?: string;
  avatarUrl?: string;
  dataAiHint?: string;
}

const profileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().optional(),
  address: z.string().optional(),
  bio: z.string().max(500, "Bio can be at most 500 characters.").optional(),
  // avatarUrl could be handled separately if file upload is implemented
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;


export default function ProfilePage() {
  const { user, userProfile: authUserProfile, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      address: '',
      bio: '',
    },
  });


  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }
    if (!user) {
      router.push('/'); // Redirect if not logged in
      return;
    }
    if (authUserProfile) {
        setProfileData(authUserProfile as UserProfileData);
        form.reset({
            name: authUserProfile.name || '',
            phone: authUserProfile.phone || '',
            address: authUserProfile.address || '',
            bio: authUserProfile.bio || '',
        });
    }
    setIsLoading(false);
  }, [user, authUserProfile, authLoading, router, form]);

  async function onSubmit(values: ProfileFormValues) {
    if (!user) {
        toast({ title: "Error", description: "You are not logged in.", variant: "destructive"});
        return;
    }
    setIsSubmitting(true);
    try {
        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
            name: values.name,
            phone: values.phone || "",
            address: values.address || "",
            bio: values.bio || "",
            // avatarUrl would be updated here if implementing file upload
        });
        toast({ title: "Profile Updated", description: "Your profile has been successfully updated." });
        setIsEditing(false);
        // Optionally re-fetch profile or rely on AuthContext to update if it re-fetches on change
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
        <p className="text-muted-foreground mb-4">Could not load your profile data.</p>
      </div>
    );
  }
  
  const getInitials = (name?: string) => {
    if (!name) return profileData.email?.[0]?.toUpperCase() || 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0][0]?.toUpperCase();
    return (names[0][0] + (names[names.length - 1][0] || '')).toUpperCase();
  };


  return (
    <>
      <PageHeader
        title="My Profile"
        description="View and update your personal information."
        icon={UserCircle}
        action={
          !isEditing ? (
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
              <AvatarImage src={profileData.avatarUrl || `https://placehold.co/150x150.png?text=${getInitials(profileData.name)}`} alt={profileData.name} data-ai-hint={profileData.dataAiHint || 'user portrait'} />
              <AvatarFallback>{getInitials(profileData.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">{profileData.name}</CardTitle>
              <CardDescription className="text-md flex items-center gap-2 mt-1">
                <Mail size={16} className="text-muted-foreground" /> {profileData.email}
              </CardDescription>
               {isEditing && <Button size="sm" variant="outline" className="mt-3" disabled>Change Avatar (WIP)</Button>}
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
                  <Button type="button" variant="outline" onClick={() => { setIsEditing(false); form.reset({name: profileData.name, phone: profileData.phone || '', address: profileData.address || '', bio: profileData.bio || ''})}} disabled={isSubmitting}>
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
