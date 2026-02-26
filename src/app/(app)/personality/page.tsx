"use client";

import { useState } from "react";
import { useFamily } from "@/context/family-context";
import { runPersonalityAnalysis } from "@/app/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, BrainCircuit, ShieldCheck, Compass } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function PersonalityPage() {
  const { expenses, currentUser, updatePersonality, t } = useFamily();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleAnalyze = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    
    // Simple mock breakdown for demonstration
    const total = expenses.filter(e => e.contributorId === currentUser.id).reduce((s, e) => s + e.amount, 0);
    const summary = {
        totalSpent: total,
        goalContributions: currentUser.points / 2, // approximation
        budgetUsagePercentage: 75,
        categoryDistribution: { "Entertainment": 40, "Groceries": 30 }
    };

    const res = await runPersonalityAnalysis({ name: currentUser.name, summary });
    if (res.success) {
      setResult(res.analysis);
      updatePersonality(res.analysis.personality);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 items-center text-center">
      <div className="flex flex-col gap-2 items-center">
        <div className="p-4 bg-primary/10 rounded-full border-4 border-primary/20">
            <BrainCircuit className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-headline">{t.personality.title}</h1>
        <p className="max-w-xl text-muted-foreground">
          {t.personality.desc}
        </p>
      </div>

      <Button onClick={handleAnalyze} disabled={isLoading} size="lg" className="gap-2">
        <Sparkles className="h-5 w-5" />
        {isLoading ? t.personality.scanning : t.personality.button}
      </Button>

      <div className="w-full max-w-2xl mt-8">
        {isLoading ? (
            <div className="space-y-4">
                <Skeleton className="h-48 w-full" />
                <Skeleton className="h-12 w-3/4 mx-auto" />
            </div>
        ) : result ? (
            <Card className="border-primary/30 shadow-2xl bg-gradient-to-b from-primary/5 to-transparent">
                <CardHeader>
                    <Badge className="w-fit mx-auto mb-2 bg-primary/20 text-primary">PERSONA UNLOCKED</Badge>
                    <CardTitle className="text-3xl font-headline text-primary">{result.personality}</CardTitle>
                    <CardDescription className="text-base mt-2">{result.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 rounded-xl bg-muted/50 border text-left flex gap-4">
                        <Compass className="h-10 w-10 text-primary shrink-0" />
                        <div>
                            <p className="font-bold text-sm uppercase text-muted-foreground">{t.personality.advice}</p>
                            <p className="text-sm italic">"{result.advice}"</p>
                        </div>
                    </div>
                    <div className="flex justify-center gap-4">
                        <div className="flex flex-col items-center p-3 rounded-lg bg-primary/10 border border-primary/20 w-32">
                            <ShieldCheck className="h-6 w-6 text-primary mb-1" />
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">{t.personality.discipline}</span>
                            <span className="font-bold">High</span>
                        </div>
                        <div className="flex flex-col items-center p-3 rounded-lg bg-primary/10 border border-primary/20 w-32">
                            <Sparkles className="h-6 w-6 text-primary mb-1" />
                            <span className="text-[10px] uppercase font-bold text-muted-foreground">{t.personality.growth}</span>
                            <span className="font-bold">+15%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ) : (
            <Card className="border-dashed">
                <CardContent className="p-12 text-muted-foreground">
                    {t.personality.placeholder}
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
