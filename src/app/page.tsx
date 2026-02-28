"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFamily } from '@/context/family-context';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const { authUser, currentUser, loading, hasAttemptedLookup, family } = useFamily();
  const router = useRouter();

  useEffect(() => {
    // Aggressive redirect for instant open feel
    if (!loading && hasAttemptedLookup) {
      if (authUser) {
        if (currentUser && family) {
          router.replace('/dashboard');
        } else {
          router.replace('/signup');
        }
      } else {
        // On new devices with no session, go straight to signup
        router.replace('/signup');
      }
    }
  }, [loading, hasAttemptedLookup, authUser, currentUser, family, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest text-primary/40 animate-pulse">
            Connecting...
        </p>
      </div>
    </div>
  );
}