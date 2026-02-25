import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center gap-4 text-center", className)}>
      <div className="relative flex size-24 items-center justify-center rounded-[2rem] bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#a855f7] shadow-[0_10px_40px_rgba(99,102,241,0.4)] transition-transform hover:scale-105">
        <div className="absolute inset-0 bg-white/10 rounded-[2rem] blur-[1px]" />
        <Leaf className="size-12 text-white drop-shadow-lg" fill="currentColor" />
      </div>
      <div className="flex flex-col">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-white">
          FinNest
        </h1>
        <h2 className="font-headline text-4xl font-bold tracking-tight text-white -mt-1">
          AI
        </h2>
      </div>
    </div>
  );
}