import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, Edit3, Mail, Phone, MapPin } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

// Mock user data
const userProfile = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '555-0101',
  address: '456 Park Ave, Anytown, USA',
  bio: "Passionate pet owner of two dogs and a cat. Always looking for the best ways to care for my furry family members.",
  avatarUrl: 'https://placehold.co/150x150.png',
  dataAiHint: 'user portrait',
};

export default function ProfilePage() {
  return (
    <>
      <PageHeader
        title="My Profile"
        description="View and update your personal information."
        icon={UserCircle}
        action={
          <Button variant="outline" disabled> {/* Placeholder for actual edit functionality */}
            <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
          </Button>
        }
      />
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-primary/30">
              <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} data-ai-hint={userProfile.dataAiHint} />
              <AvatarFallback>{userProfile.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-3xl">{userProfile.name}</CardTitle>
              <CardDescription className="text-md flex items-center gap-2 mt-1">
                <Mail size={16} className="text-muted-foreground" /> {userProfile.email}
              </CardDescription>
               <Button size="sm" variant="outline" className="mt-3" disabled>Change Avatar</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="profileName">Full Name</Label>
              <Input id="profileName" defaultValue={userProfile.name} disabled />
            </div>
            <div>
              <Label htmlFor="profilePhone">Phone Number</Label>
              <Input id="profilePhone" defaultValue={userProfile.phone} disabled />
            </div>
          </div>
          <div>
            <Label htmlFor="profileAddress">Address</Label>
            <Input id="profileAddress" defaultValue={userProfile.address} disabled />
          </div>
          <div>
            <Label htmlFor="profileBio">About Me</Label>
            <Textarea id="profileBio" defaultValue={userProfile.bio} rows={4} className="resize-none" disabled />
          </div>
          <div className="flex justify-end">
             <Button disabled>Save Changes</Button> {/* Enable when edit mode is active */}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
