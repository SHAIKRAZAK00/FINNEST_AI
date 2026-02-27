"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFamily } from '@/context/family-context';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const { authUser, currentUser, loading, hasAttemptedLookup, family } = useFamily();
  const router = useRouter();

  useEffect(() => {
    // If we have cached auth and family, go immediately to dashboard
    if (authUser && family) {
      router.replace('/dashboard');
      return;
    }

    // Otherwise wait for the definitively resolved state
    if (!loading && hasAttemptedLookup) {
      if (authUser) {
        if (currentUser && family) {
          router.replace('/dashboard');
        } else {
          router.replace('/signup');
        }
      } else {
        // New device or logged out -> go to signup as requested
        router.replace('/signup');
      }
    }
  }, [loading, hasAttemptedLookup, authUser, currentUser, family, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-primary/40 animate-pulse">
            Initializing Ecosystem...
        </p>
      </div>
    </div>
  );
}
