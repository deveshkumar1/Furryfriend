
"use client"; // Required because UserNav and MainNav will use useAuth hook

import { MainNav } from '@/components/shared/main-nav';
import { UserNav } from '@/components/shared/user-nav';
import { Logo } from '@/components/shared/logo';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/'); // Redirect to login if not authenticated
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // This state should ideally be handled by the redirect,
    // but as a fallback, or if redirect is too slow.
    return null; 
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar collapsible="icon" className="border-r border-sidebar-border">
        <SidebarHeader className="p-4 flex items-center justify-between">
          <Logo className="group-data-[collapsible=icon]:hidden" />
          <Logo href="/dashboard" className="hidden group-data-[collapsible=icon]:flex" iconSize={28} />
        </SidebarHeader>
        <ScrollArea className="flex-1">
          <SidebarContent>
            <MainNav />
          </SidebarContent>
        </ScrollArea>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-md px-4 md:px-6">
          <div className="flex items-center gap-2">
             <SidebarTrigger className="md:hidden" /> {/* Mobile toggle */}
             <span className="text-lg font-semibold text-foreground">FurryFriend Care Hub</span>
          </div>
          <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          {children}
        </main>
        <footer className="border-t p-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} FurryFriend Care Hub. All rights reserved.
        </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
