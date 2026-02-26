
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFamily } from '@/context/family-context';
import { Loader2 } from 'lucide-react';

/**
 * RootPage acts as a smart redirector. 
 */
export default function RootPage() {
  const { authUser, currentUser, loading } = useFamily();
  const router = useRouter();
  const [isStable, setIsStable] = useState(false);

  useEffect(() => {
    if (!loading) {
      // Small buffer to ensure context states have settled
      const timer = setTimeout(() => setIsStable(true), 500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  useEffect(() => {
    if (isStable) {
      if (authUser) {
        if (currentUser) {
          router.replace('/dashboard');
        } else {
          // Double check if we're actually logged in with no profile
          router.replace('/signup');
        }
      } else {
        router.replace('/login');
      }
    }
  }, [isStable, authUser, currentUser, router]);

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
