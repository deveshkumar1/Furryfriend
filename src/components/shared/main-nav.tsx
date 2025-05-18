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
  ShieldCheck,
  HeartPulse
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

export interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  label?: string;
  badge?: string | number;
  variant?: 'default' | 'ghost';
  children?: NavItem[];
  disabled?: boolean; // For feature gating
  requiredSubscription?: string; // For feature gating
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  {
    title: 'My Pets',
    href: '/pets',
    icon: PawPrint,
    children: [
      { title: 'All Pets', href: '/pets', icon: PawPrint },
      { title: 'Add New Pet', href: '/pets/new', icon: PawPrint },
      { title: 'Vaccination Records', href: '/pets/vaccinations', icon: ShieldCheck, requiredSubscription: 'premium' },
      { title: 'Medication Tracker', href: '/pets/medications', icon: HeartPulse, requiredSubscription: 'premium' },
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
  { title: 'Medical Records', href: '/medical-records', icon: FileText, disabled: false, requiredSubscription: 'pro' },
  { title: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  { title: 'Marketplace', href: '/marketplace', icon: ShoppingCart, disabled: true },
  { title: 'Settings', href: '/settings', icon: Settings },
];

// Mock current subscription for feature gating demonstration
const currentUserSubscription = "free"; // "free", "pro", "premium"

function NavLinkContent({ item }: { item: NavItem }) {
  return (
    <>
      <item.icon className="h-5 w-5" />
      <span className="truncate">{item.title}</span>
      {item.badge && (
        <Badge variant="secondary" className="ml-auto">
          {item.badge}
        </Badge>
      )}
    </>
  );
}

export function MainNav() {
  const pathname = usePathname();

  const renderNavItem = (item: NavItem, isSubItem: boolean = false) => {
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
    
    // Feature Gating Logic (simplified)
    let isDisabled = item.disabled;
    if (item.requiredSubscription) {
      if (currentUserSubscription === 'free' && (item.requiredSubscription === 'pro' || item.requiredSubscription === 'premium')) {
        isDisabled = true;
      } else if (currentUserSubscription === 'pro' && item.requiredSubscription === 'premium') {
        isDisabled = true;
      }
    }
    
    const tooltipContent = isDisabled && item.requiredSubscription ? `Requires ${item.requiredSubscription} plan` : item.title;

    if (item.children && item.children.length > 0) {
      return (
        <Accordion type="single" collapsible className="w-full" key={item.title}>
          <AccordionItem value={item.title} className="border-none">
            <AccordionTrigger 
              className={cn(
                "flex items-center w-full justify-start gap-2 rounded-md p-2 text-left text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring active:bg-sidebar-accent active:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground",
                isDisabled && "opacity-50 cursor-not-allowed",
                "group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>svg:last-child]:ml-auto"
              )}
              disabled={isDisabled}
              aria-disabled={isDisabled}
              title={tooltipContent}
            >
              <NavLinkContent item={item} />
            </AccordionTrigger>
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

    if (isSubItem) {
      return (
        <SidebarMenuSubButton
          asChild={!isDisabled}
          isActive={isActive}
          className={cn(isDisabled && "opacity-50 cursor-not-allowed")}
          aria-disabled={isDisabled}
          title={tooltipContent}
          href={isDisabled ? undefined : item.href}
          onClick={(e) => { if (isDisabled) e.preventDefault(); }}
        >
          {isDisabled ? (
            <div className="flex items-center gap-2 w-full">
              <NavLinkContent item={item} />
            </div>
          ) : (
            <Link href={item.href} className="flex items-center gap-2 w-full">
              <NavLinkContent item={item} />
            </Link>
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
          <div className="flex items-center gap-2 w-full">
             <NavLinkContent item={item} />
          </div>
        ) : (
          <Link href={item.href} className="flex items-center gap-2 w-full">
             <NavLinkContent item={item} />
          </Link>
        )}
      </SidebarMenuButton>
    );
  };


  return (
    <nav className="flex flex-col gap-1 px-2 py-4">
      <SidebarMenu>
        {navItems.map((item) => (
          <SidebarMenuItem key={item.href}>
            {renderNavItem(item)}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </nav>
  );
}
