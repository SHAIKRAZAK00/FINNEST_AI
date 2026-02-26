
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFamily } from '@/context/family-context';
import { Loader2 } from 'lucide-react';

/**
 * RootPage acts as a smart redirector. 
 * It checks the user's session and sends them to the appropriate destination.
 */
export default function RootPage() {
  const { authUser, currentUser, loading } = useFamily();
  const router = useRouter();

  useEffect(() => {
    // Only act when we are definitively not loading.
    if (!loading) {
      if (authUser) {
        // We have an authenticated user.
        if (currentUser) {
          // Profile exists, go to dashboard.
          router.replace('/dashboard');
        } else {
          // No profile found yet, go to setup.
          // Note: If currentUser is just taking a moment to load even after 'loading' is false,
          // the layout guard in (app)/layout.tsx will handle secondary checks.
          router.replace('/signup');
        }
      } else {
        // Not logged in.
        router.replace('/login');
      }
    }
  }, [authUser, currentUser, loading, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
          Initializing Ecosystem...
        </p>
      </div>
    </div>
  );
}
