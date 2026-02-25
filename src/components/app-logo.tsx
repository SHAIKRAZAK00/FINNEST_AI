import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AppLogo({ className, size = 'lg' }: AppLogoProps) {
  const containerSizes = {
    sm: "size-10 rounded-xl shadow-lg",
    md: "size-16 rounded-[1.25rem] shadow-xl",
    lg: "size-24 rounded-[2rem] shadow-[0_10px_40px_rgba(99,102,241,0.4)]",
  };

  const iconSizes = {
    sm: "size-5",
    md: "size-8",
    lg: "size-12",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const gapSizes = {
    sm: "gap-1.5",
    md: "gap-2.5",
    lg: "gap-4",
  };

  return (
    <div className={cn("flex flex-col items-center text-center", gapSizes[size], className)}>
      <div className={cn(
        "relative flex items-center justify-center bg-gradient-to-br from-[#6366f1] via-[#8b5cf6] to-[#a855f7] transition-transform hover:scale-105",
        containerSizes[size]
      )}>
        <div className={cn("absolute inset-0 bg-white/10 blur-[1px]", containerSizes[size])} />
        <Leaf className={cn("text-white drop-shadow-lg", iconSizes[size])} fill="currentColor" />
      </div>
      <div className="flex flex-col leading-none">
        <h1 className={cn("font-headline font-bold tracking-tight text-white", textSizes[size])}>
          FinNest
        </h1>
        <h2 className={cn("font-headline font-bold tracking-tight text-white -mt-0.5", textSizes[size])}>
          AI
        </h2>
      </div>
    </div>
  );
}
