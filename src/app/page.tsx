
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFamily } from '@/context/family-context';
import { Loader2 } from 'lucide-react';

/**
 * RootPage acts as a smart redirector. 
 */
export default function RootPage() {
  const { authUser, currentUser, loading, hasAttemptedLookup } = useFamily();
  const router = useRouter();

  useEffect(() => {
    if (!loading && hasAttemptedLookup) {
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
  }, [loading, hasAttemptedLookup, authUser, currentUser, router]);

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
