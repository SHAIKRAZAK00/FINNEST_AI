import { Feather } from 'lucide-react';
import { cn } from '@/lib/utils';

export function AppLogo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-lg font-medium text-foreground", className)}>
      <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Feather className="size-5" />
      </div>
      <h1 className="font-headline text-xl font-semibold tracking-tight">
        FinNest AI
      </h1>
    </div>
  );
}
