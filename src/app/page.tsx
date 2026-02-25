
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
    if (!loading) {
      if (authUser) {
        if (currentUser) {
          router.replace('/dashboard');
        } else {
          router.replace('/signup');
        }
      } else {
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
