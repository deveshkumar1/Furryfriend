
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  PawPrint,
  Stethoscope,
  CalendarDays,
  Bell,
  ShoppingCart,
  Settings,
  FileText,
  MapPin,
  CreditCard,
  Circle,
  Loader2
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, DocumentData, orderBy } from 'firebase/firestore';
import { useState, useEffect, useMemo } from 'react';

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  label?: string;
  badge?: string | number;
  variant?: 'default' | 'ghost';
  children?: NavItem[];
  disabled?: boolean;
}

interface Pet extends DocumentData {
  id: string;
  name: string;
}

// Base navigation structure
const getBaseNavItems = (): NavItem[] => [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    title: 'My Pets',
    href: '/pets',
    icon: PawPrint,
    children: [
      // Dynamic pets will be injected here
    ],
  },
  {
    title: 'Veterinarians',
    href: '/veterinarians',
    icon: Stethoscope,
    children: [
      { title: 'My Veterinarians', href: '/veterinarians', icon: Stethoscope },
      { title: 'Find a Vet', href: '/veterinarians/find', icon: MapPin },
    ],
  },
  { title: 'Appointments', href: '/appointments', icon: CalendarDays, badge: 3 },
  { title: 'Notifications', href: '/notifications', icon: Bell, badge: 'New' },
  { title: 'Medical Records', href: '/medical-records', icon: FileText },
  { title: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  { title: 'Marketplace', href: '/marketplace', icon: ShoppingCart },
  { title: 'Settings', href: '/settings', icon: Settings },
];


export function MainNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [isLoadingPets, setIsLoadingPets] = useState(true);

  useEffect(() => {
    if (!user) {
      setPets([]);
      setIsLoadingPets(false);
      return;
    }
    
    setIsLoadingPets(true);
    const q = query(collection(db, "pets"), where("userId", "==", user.uid), orderBy("name"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userPets = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Pet));
      setPets(userPets);
      setIsLoadingPets(false);
    }, (error) => {
        console.error("Failed to fetch pets for sidebar:", error);
        setPets([]);
        setIsLoadingPets(false);
    });

    return () => unsubscribe();
  }, [user]);

  const navItems = useMemo(() => {
    // Create a fresh copy of the base items each time
    const newNavItems = getBaseNavItems(); 
    
    const myPetsItem = newNavItems.find(item => item.title === 'My Pets');

    if (myPetsItem) {
        const petNavItems: NavItem[] = pets.map(pet => ({
            title: pet.name,
            href: `/pets/${pet.id}`,
            icon: Circle,
        }));
        
        let petChildren: NavItem[] = [];

        if (isLoadingPets) {
            petChildren.push({ title: "Loading pets...", href: "#", icon: Loader2, disabled: true });
        } else if (pets.length > 0) {
            petChildren.push(...petNavItems);
        }
        
        myPetsItem.children = petChildren;
    }
    
    // Filter out the items we don't want
    return newNavItems;
  }, [pets, isLoadingPets]);

  const renderNavItem = (item: NavItem, isSubItem: boolean = false) => {
    const isParentOfActive = item.children && item.children.some(child => pathname.startsWith(child.href));
    const isActive = (item.href === pathname || (item.href !== '/dashboard' && pathname.startsWith(item.href))) || isParentOfActive;
    
    const isDisabled = item.disabled;
    const tooltipContent = item.title;
    
    const iconToRender = item.icon === Loader2 
        ? <Loader2 className="h-5 w-5 animate-spin" /> 
        : <item.icon className="h-5 w-5" />;


    if (item.children && item.children.length > 0) {
      return (
        <Accordion type="single" collapsible className="w-full" key={item.title} defaultValue={isParentOfActive ? item.title : undefined}>
          <AccordionItem value={item.title} className="border-none">
            <div className="flex items-center rounded-md pr-2 bg-transparent">
              <Link
                href={item.href}
                className={cn(
                  "flex items-center w-full justify-start gap-2 rounded-md p-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground flex-grow",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground",
                  isDisabled && "opacity-50 cursor-not-allowed",
                  "group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2"
                )}
                title={tooltipContent}
                onClick={(e) => { if (isDisabled) e.preventDefault(); }}
              >
                  {iconToRender}
                  <span className="truncate">{item.title}</span>
                  {item.badge && (<Badge variant="secondary" className="ml-auto">{item.badge}</Badge>)}
              </Link>
              <AccordionTrigger
                className={cn(
                  "p-2 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md [&>svg:last-child]:ml-auto",
                  isActive && "text-sidebar-primary-foreground hover:text-sidebar-primary-foreground"
                )}
              />
            </div>
            <AccordionContent className="pb-0">
              <SidebarMenuSub className="mx-0 pl-4 pr-0 py-1 border-l-2 border-sidebar-border/50">
                {item.children.map((child) => (
                  <SidebarMenuSubItem key={child.href}>
                    {renderNavItem(child, true)}
                  </SidebarMenuSubItem>
                ))}
              </SidebarMenuSub>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      );
    }

    const navLinkContent = (
         <>
            {iconToRender}
            <span className="truncate">{item.title}</span>
            {item.badge && (<Badge variant="secondary" className="ml-auto">{item.badge}</Badge>)}
        </>
    );

    if (isSubItem) {
      const isSubActive = pathname === item.href;
      return (
        <SidebarMenuSubButton
          asChild={!isDisabled}
          isActive={isSubActive}
          className={cn(isDisabled && "opacity-50 cursor-not-allowed")}
          aria-disabled={isDisabled}
          title={tooltipContent}
          href={isDisabled ? undefined : item.href}
          onClick={(e) => { if (isDisabled) e.preventDefault(); }}
        >
          {isDisabled ? (
            <div className="flex items-center gap-2 w-full">{navLinkContent}</div>
          ) : (
            <Link href={item.href} className="flex items-center gap-2 w-full">{navLinkContent}</Link>
          )}
        </SidebarMenuSubButton>
      );
    }

    return (
      <SidebarMenuButton
        asChild={!isDisabled}
        isActive={isActive}
        variant="default"
        className={cn("w-full justify-start", isDisabled && "opacity-50 cursor-not-allowed")}
        tooltip={tooltipContent}
        aria-disabled={isDisabled}
        href={isDisabled ? undefined : item.href}
        onClick={(e) => { if (isDisabled) e.preventDefault(); }}
      >
        {isDisabled ? (
          <div className="flex items-center gap-2 w-full">{navLinkContent}</div>
        ) : (
          <Link href={item.href} className="flex items-center gap-2 w-full">{navLinkContent}</Link>
        )}
      </SidebarMenuButton>
    );
  };


  return (
    <nav className="flex flex-col gap-1 px-2 py-4">
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.title}>
            {renderNavItem(item)}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
