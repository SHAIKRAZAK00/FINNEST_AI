
"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { AppLogo } from "@/components/app-logo";
import {
  Bot,
  LayoutDashboard,
  Loader2,
  LogOut,
  ReceiptText,
  Settings,
  Target,
  Trophy,
  BrainCircuit,
  BookOpen,
  Trophy as RewardIcon,
  ShieldCheck,
  FileText
} from "lucide-react";
import { useFamily } from "@/context/family-context";

function AppSidebar() {
  const { family, currentUser, logout } = useFamily();
  const pathname = usePathname();

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("");

  if (!currentUser || !family) {
    return (
       <Sidebar>
        <SidebarHeader className="items-center py-6">
          <AppLogo size="sm" />
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4 flex justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </SidebarContent>
      </Sidebar>
    )
  }

  return (
    <Sidebar>
      <SidebarHeader className="items-center py-6">
        <AppLogo size="sm" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mt-4">
            {family.familyName}
        </p>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu className="px-2">
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip="Dashboard">
              <Link href="/dashboard"><LayoutDashboard /><span>Dashboard</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/expenses'} tooltip="Expenses">
              <Link href="/expenses"><ReceiptText /><span>Expenses</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/goals'} tooltip="Goals">
              <Link href="/goals"><Target /><span>Goals</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <div className="h-px bg-white/5 my-2 mx-2" />
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/personality'} tooltip="Personality">
              <Link href="/personality"><BrainCircuit /><span>Personality</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/learning'} tooltip="Learning Mode">
              <Link href="/learning"><BookOpen /><span>Learning Mode</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/rewards'} tooltip="Rewards">
              <Link href="/rewards"><RewardIcon /><span>Rewards</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/assistant'} tooltip="AI CFO">
              <Link href="/assistant"><Bot /><span>AI CFO</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {currentUser.role === 'Parent' && (
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/reports'} tooltip="Monthly Reports">
                <Link href="/reports"><FileText /><span>Reports</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-xl p-2 text-left text-sm outline-none ring-sidebar-ring transition-all hover:bg-white/5">
              <Avatar className="h-10 w-10 border-2 border-primary/20">
                <AvatarImage src={currentUser.avatarUrl} alt={currentUser.name} />
                <AvatarFallback>{getInitials(currentUser.name)}</AvatarFallback>
              </Avatar>
              <div className="flex flex-col overflow-hidden">
                <span className="font-bold truncate text-white">{currentUser.name}</span>
                <span className="text-[10px] uppercase tracking-widest text-white/40">{currentUser.role}</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-56 bg-card border-white/5 backdrop-blur-xl">
            <DropdownMenuLabel className="text-xs font-bold uppercase tracking-widest text-white/40">Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem asChild><Link href="/settings"><Settings className="mr-2 h-4 w-4" /><span>Settings</span></Link></DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem onClick={logout} className="text-destructive"><LogOut className="mr-2 h-4 w-4" /><span>Log out</span></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { loading, currentUser, authUser } = useFamily();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!authUser) {
        if (pathname !== '/login' && pathname !== '/signup') router.push('/login');
      } else if (!currentUser) {
        if (pathname !== '/signup' && pathname !== '/login') router.push('/signup');
      } else {
        if (pathname === '/login' || pathname === '/signup' || pathname === '/') router.push('/dashboard');
      }
    }
  }, [loading, authUser, currentUser, router, pathname]);

  if (loading) return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-white/40 animate-pulse">Syncing Protocol...</p>
      </div>
    </div>
  );

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-transparent">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-white/5 bg-background/50 px-4 backdrop-blur-md">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1" />
          <AppLogo size="sm" className="md:hidden" />
        </header>
        <main className="flex-1 p-4 sm:p-8">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutContent>{children}</AppLayoutContent>;
}
