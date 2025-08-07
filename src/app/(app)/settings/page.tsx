import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Settings, UserCircle, Bell, Database, Download, Upload, Trash2, Palette, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export default function SettingsPage() {
  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your account, notification preferences, and application settings."
        icon={Settings}
      />
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data Management</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><UserCircle size={24} /> Account Profile</CardTitle>
              <CardDescription>Update your personal information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue="John Doe" />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="john.doe@example.com" disabled />
                </div>
              </div>
              <Button>Save Profile Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell size={24} /> Notification Preferences</CardTitle>
              <CardDescription>Choose how you receive notifications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground">Receive important updates via email.</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">In-App Notifications</h4>
                  <p className="text-sm text-muted-foreground">Show notifications within the app.</p>
                </div>
                <Switch defaultChecked />
              </div>
               <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">SMS Reminders (Premium)</h4>
                  <p className="text-sm text-muted-foreground">Get appointment reminders via SMS.</p>
                </div>
                <Switch disabled />
              </div>
              <Button>Save Notification Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Database size={24} /> Data Management</CardTitle>
              <CardDescription>Export or import your pet records. Manage your account data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border rounded-lg bg-secondary/30">
                <h4 className="font-semibold text-lg mb-2 flex items-center"><Download className="mr-2 h-5 w-5 text-primary"/> Export All Records</h4>
                <p className="text-sm text-muted-foreground mb-3">Download a complete archive of all your pet data, including profiles, medical history, and appointments.</p>
                <Button>Export Data (JSON)</Button>
              </div>
              <div className="p-4 border rounded-lg bg-secondary/30">
                <h4 className="font-semibold text-lg mb-2 flex items-center"><Upload className="mr-2 h-5 w-5 text-accent"/> Import Records</h4>
                <p className="text-sm text-muted-foreground mb-3">Import pet data from another service or a previous backup (supports JSON format).</p>
                <Input type="file" accept=".json" className="mb-2"/>
                <Button variant="outline">Import Data</Button>
              </div>
              <div className="p-4 border border-destructive/50 rounded-lg bg-destructive/10">
                <h4 className="font-semibold text-lg mb-2 flex items-center text-destructive"><Trash2 className="mr-2 h-5 w-5"/> Delete Account</h4>
                <p className="text-sm text-destructive/80 mb-3">Permanently delete your account and all associated data. This action cannot be undone.</p>
                <Button variant="destructive">Delete My Account</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="appearance">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Palette size={24} /> Appearance</CardTitle>
              <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Select defaultValue="system">
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Select theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System Default</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">Choose your preferred color scheme.</p>
                </div>
                 <Button>Save Appearance Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="security">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Lock size={24} /> Security</CardTitle>
              <CardDescription>Manage your account security settings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                 <Button>Change Password</Button>
                 <div className="pt-4 border-t">
                    <h4 className="font-medium">Two-Factor Authentication (2FA)</h4>
                    <p className="text-sm text-muted-foreground mb-2">Add an extra layer of security to your account.</p>
                    <Button variant="outline" disabled>Enable 2FA (Coming Soon)</Button>
                 </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
