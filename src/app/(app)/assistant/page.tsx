"use client";

import { useState } from "react";
import { Bot, Lightbulb, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFinancialInsights } from "@/app/actions";
import { useFamily } from "@/context/family-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

type Insight = {
    insight: string;
};

export default function AssistantPage() {
  const { expenses, family } = useFamily();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateInsights = async () => {
    if (!family) return;
    setIsLoading(true);
    setError(null);
    setInsights([]);

    const budgetInfo = family.monthlyBudget ? {
      monthlyBudget: family.monthlyBudget,
      currentMonthSpent: family.currentMonthSpent || 0
    } : undefined;

    const result = await getFinancialInsights(expenses, family.id, budgetInfo);
    
    if (result.success) {
      setInsights(result.insights);
    } else {
      setError(result.error);
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col gap-6 items-center text-center">
      <div className="flex flex-col gap-2 items-center">
        <div className="p-3 bg-primary/10 rounded-full border-8 border-background">
            <Bot className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-3xl font-bold font-headline">Your AI CFO Assistant</h1>
        <p className="max-w-xl text-muted-foreground">
          Let our AI analyze your family's spending to find savings opportunities and
          provide personalized financial guidance based on your budget.
        </p>
      </div>

      <Button onClick={handleGenerateInsights} disabled={isLoading} size="lg">
        <Sparkles className="mr-2 h-5 w-5" />
        {isLoading ? "Analyzing Protocol..." : "Generate AI Audit"}
      </Button>

      <div className="w-full max-w-2xl mt-6 text-left">
        {isLoading && (
          <div className="space-y-4">
            <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-5 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4 mt-2" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-4 w-full" />
                </CardContent>
            </Card>
          </div>
        )}
        
        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}

        {!isLoading && insights.length > 0 && (
            <div className="space-y-4">
                <h2 className="text-xl font-semibold font-headline text-center">Audit Findings</h2>
                {insights.map((item, index) => (
                <Alert key={index}>
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>Finding #{index + 1}</AlertTitle>
                    <AlertDescription>{item.insight}</AlertDescription>
                </Alert>
                ))}
          </div>
        )}

        {!isLoading && insights.length === 0 && !error && (
            <Card className="text-center">
                <CardContent className="p-10">
                    <p className="text-muted-foreground">Initiate audit to see your personalized report.</p>
                </CardContent>
            </Card>
        )}
      </div>
    </div>
  );
}
