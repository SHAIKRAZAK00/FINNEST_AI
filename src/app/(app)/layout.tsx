"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Medal,
  FileText,
  Languages,
} from "lucide-react";
import { useFamily } from "@/context/family-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Language } from "@/lib/translations";

function AppSidebar() {
  const { family, currentUser, logout, language, setLanguage, t } = useFamily();
  const pathname = usePathname();

  const getInitials = (name: string) => name?.split(" ").map((n) => n[0]).join("") || "??";

  if (!currentUser || !family) {
    return (
       <Sidebar>
        <SidebarHeader className="items-center py-6">
          <AppLogo size="sm" />
        </SidebarHeader>
        <SidebarContent>
          <div className="p-4 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </SidebarContent>
      </Sidebar>
    );
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
            <SidebarMenuButton asChild isActive={pathname === '/dashboard'} tooltip={t.nav.dashboard}>
              <Link href="/dashboard"><LayoutDashboard /><span>{t.nav.dashboard}</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/expenses'} tooltip={t.nav.expenses}>
              <Link href="/expenses"><ReceiptText /><span>{t.nav.expenses}</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/goals'} tooltip={t.nav.goals}>
              <Link href="/goals"><Target /><span>{t.nav.goals}</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/leaderboard'} tooltip={t.nav.leaderboard}>
              <Link href="/leaderboard"><Trophy /><span>{t.nav.leaderboard}</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <div className="h-px bg-white/5 my-2 mx-2" />
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/personality'} tooltip={t.nav.personality}>
              <Link href="/personality"><BrainCircuit /><span>{t.nav.personality}</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/learning'} tooltip={t.nav.learning}>
              <Link href="/learning"><BookOpen /><span>{t.nav.learning}</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/rewards'} tooltip={t.nav.rewards}>
              <Link href="/rewards"><Medal /><span>{t.nav.rewards}</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/assistant'} tooltip={t.nav.assistant}>
              <Link href="/assistant"><Bot /><span>{t.nav.assistant}</span></Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          {currentUser.role === 'Parent' && (
            <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/reports'} tooltip={t.nav.reports}>
                  <Link href="/reports"><FileText /><span>{t.nav.reports}</span></Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 gap-4">
        <div className="flex flex-col gap-2">
            <span className="text-[10px] uppercase font-bold text-white/40 px-2 flex items-center gap-2">
                <Languages className="h-3 w-3" /> {t.nav.language}
            </span>
            <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                <SelectTrigger className="bg-white/5 border-white/5 h-8 text-xs">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="hi">हिन्दी (Hindi)</SelectItem>
                    <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
                    <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
                </SelectContent>
            </Select>
        </div>

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
            <DropdownMenuItem asChild><Link href="/settings"><Settings className="mr-2 h-4 w-4" /><span>{t.nav.settings}</span></Link></DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem onClick={logout} className="text-destructive"><LogOut className="mr-2 h-4 w-4" /><span>{t.nav.logout}</span></DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function AppLayoutContent({ children }: { children: React.ReactNode }) {
  const { loading, hasAttemptedLookup, currentUser, authUser, family } = useFamily();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Handle unauthenticated state immediately
    if (!loading && !authUser) {
      if (pathname !== '/login' && pathname !== '/signup' && pathname !== '/') {
        router.replace('/signup');
      }
      return;
    }

    // 2. Handle authenticated but missing data state
    if (!loading && hasAttemptedLookup && authUser) {
      if (!currentUser || !family) {
        if (pathname !== '/signup' && pathname !== '/login') {
          router.replace('/signup');
        }
      } else {
        // Logged in and data found -> dashboard
        if (pathname === '/login' || pathname === '/signup' || pathname === '/') {
          router.replace('/dashboard');
        }
      }
    }
  }, [loading, hasAttemptedLookup, authUser, currentUser, family, router, pathname]);

  if (loading && !family) return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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