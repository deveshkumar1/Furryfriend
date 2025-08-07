import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, CheckCircle, ShieldCheck, Pill, CalendarDays, AlertTriangle, Settings } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

// Mock data
const notifications = [
  { id: '1', title: "Buddy's Rabies Vaccine Due Soon", message: "Buddy's annual Rabies vaccine is due on 2024-09-01. Schedule an appointment soon.", type: 'reminder', icon: ShieldCheck, date: '2024-08-10', read: false, category: 'Vaccination' },
  { id: '2', title: "Medication Refill: Lucy's Thyroid Support", message: "Lucy's Thyroid Support medication is running low. Please request a refill from Dr. Pawson.", type: 'alert', icon: Pill, date: '2024-08-08', read: false, category: 'Medication' },
  { id: '3', title: "Appointment Confirmed: Charlie's Check-up", message: "Charlie's check-up with Dr. Vetson is confirmed for 2024-08-25 at 03:00 PM.", type: 'info', icon: CalendarDays, date: '2024-08-05', read: true, category: 'Appointment' },
  { id: '4', title: "New Feature: Enhanced Health Charts", message: "Explore the new interactive health charts for your pets in their profiles!", type: 'info', icon: Settings, date: '2024-08-01', read: true, category: 'System' },
];

const getIcon = (icon: any, type: string) => {
  if (icon) return <icon className={`h-6 w-6 ${type === 'alert' ? 'text-destructive' : (type === 'reminder' ? 'text-yellow-500' : 'text-primary')}`} />;
  return <Bell className="h-6 w-6 text-primary" />;
};

export default function NotificationsPage() {
  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <>
      <PageHeader
        title="Notifications"
        description="Stay updated with reminders, alerts, and important information about your pets' care."
        icon={Bell}
        action={
          <Button variant="outline" disabled>Mark all as read</Button> 
        }
      />
      <div className="space-y-6">
        {unreadNotifications.length > 0 && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Unread Notifications ({unreadNotifications.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {unreadNotifications.map(notification => (
                <div key={notification.id} className="flex items-start gap-4 p-4 border rounded-lg bg-primary/5 hover:shadow-md transition-shadow">
                  {getIcon(notification.icon, notification.type)}
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-foreground">{notification.title}</h3>
                       <Badge variant="outline" className="text-xs">{notification.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.date}</p>
                  </div>
                  <Button variant="ghost" size="sm" title="Mark as read"><CheckCircle className="h-4 w-4" /></Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {readNotifications.length > 0 && (
           <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Read Notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {readNotifications.map(notification => (
                <div key={notification.id} className="flex items-start gap-4 p-4 border rounded-lg bg-secondary/20 opacity-70">
                  {getIcon(notification.icon, notification.type)}
                   <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-foreground">{notification.title}</h3>
                       <Badge variant="outline" className="text-xs">{notification.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {notifications.length === 0 && (
           <Card className="text-center py-12 shadow-lg">
            <CardHeader>
              <Bell className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <CardTitle>All Caught Up!</CardTitle>
              <CardDescription>You have no new notifications.</CardDescription>
            </CardHeader>
          </Card>
        )}
      </div>
    </>
  );
}
