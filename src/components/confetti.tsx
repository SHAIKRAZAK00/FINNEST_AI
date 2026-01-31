"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const ConfettiPiece = ({ id, style }: { id: number, style: React.CSSProperties }) => {
  return (
    <div
      key={id}
      className="absolute h-2.5 w-1.5 animate-fall rounded-full"
      style={style}
    />
  );
};

export const Confetti = ({ active, duration = 5000 }: { active: boolean, duration?: number }) => {
  const [pieces, setPieces] = useState<React.ReactNode[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (active) {
      setIsVisible(true);
      const newPieces = Array.from({ length: 150 }).map((_, i) => {
        const style: React.CSSProperties = {
          left: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * duration * 0.7}ms`,
          animationDuration: `${duration * 0.3 + Math.random() * duration * 0.7}ms`,
          backgroundColor: `hsl(${Math.random() * 360}, 90%, 65%)`,
          transform: `rotate(${Math.random() * 360}deg)`,
        };
        return <ConfettiPiece key={i} id={i} style={style} />;
      });
      setPieces(newPieces);

      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [active, duration]);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-50 overflow-hidden">
        <style>{`
        @keyframes fall {
          0% { top: -10%; opacity: 1; }
          100% { top: 110%; opacity: 0; }
        }
        .animate-fall {
            animation-name: fall;
            animation-timing-function: linear;
        }
      `}</style>
      {pieces}
    </div>
  );
};
