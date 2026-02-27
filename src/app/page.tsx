
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFamily } from '@/context/family-context';
import { Loader2 } from 'lucide-react';

export default function RootPage() {
  const { authUser, currentUser, loading, hasAttemptedLookup, family } = useFamily();
  const router = useRouter();

  useEffect(() => {
    // Snappy check: if we have a family cached, just go to dashboard
    if (authUser && family) {
      router.replace('/dashboard');
      return;
    }

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
  }, [loading, hasAttemptedLookup, authUser, currentUser, family, router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
}
