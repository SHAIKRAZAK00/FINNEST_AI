"use client";

import { useState } from "react";
import { useFamily } from "@/context/family-context";
import { getMonthlyReport } from "@/app/actions";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Printer, Download, Sparkles, TrendingUp } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ReportsPage() {
  const { family, users, expenses, currentUser, t } = useFamily();
  const [isLoading, setIsLoading] = useState(false);
  const [report, setReport] = useState<any>(null);

  const handleGenerate = async () => {
    if (!family || !users) return;
    setIsLoading(true);
    
    const input = {
        familyName: family.familyName,
        month: "October 2024",
        totalExpenses: family.currentMonthSpent || 0,
        budget: family.monthlyBudget || 0,
        topCategory: "Entertainment",
        memberActivity: users.map(u => ({
            name: u.name,
            spent: expenses.filter(e => e.contributorId === u.id).reduce((s, e) => s + e.amount, 0),
            role: u.role
        }))
    };

    const res = await getMonthlyReport(input);
    if (res.success) setReport(res.report);
    setIsLoading(false);
  };

  if (currentUser?.role !== 'Parent') {
    return (
        <div className="flex items-center justify-center h-[60vh]">
            <p className="text-muted-foreground">Only Parents can access the Financial Audit logs.</p>
        </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" /> {t.reports.title}
        </h1>
        <Button onClick={handleGenerate} disabled={isLoading} size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            {isLoading ? t.reports.auditing : t.reports.button}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
      ) : report ? (
        <div className="space-y-6">
            <Card className="print:border-none print:shadow-none">
                <CardHeader className="border-b">
                    <div className="flex justify-between items-start">
                        <div>
                            <CardTitle className="text-2xl">{family?.familyName} {t.reports.reportCard}</CardTitle>
                            <CardDescription>{t.reports.period}: October 2024</CardDescription>
                        </div>
                        <div className="text-center">
                            <div className="text-4xl font-bold text-primary">{report.grade}</div>
                            <div className="text-[10px] font-bold uppercase text-muted-foreground">{t.reports.grade}</div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 rounded-xl bg-muted/50 border">
                            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2 flex items-center gap-2">
                                <TrendingUp className="h-3 w-3" /> {t.reports.summary}
                            </h4>
                            <p className="text-sm italic">"{report.summary}"</p>
                        </div>
                        <div className="p-4 rounded-xl bg-muted/50 border">
                            <h4 className="text-xs font-bold uppercase text-muted-foreground mb-2">{t.reports.mvp}</h4>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                    {report.topContributor[0]}
                                </div>
                                <p className="font-bold">{report.topContributor}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold uppercase text-muted-foreground mb-3">{t.reports.recommendations}</h4>
                        <div className="grid gap-2">
                            {report.recommendations.map((rec: string, i: number) => (
                                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                                    <Badge className="bg-primary text-[10px] h-5 w-5 rounded-full flex items-center justify-center p-0">
                                        {i + 1}
                                    </Badge>
                                    <p className="text-sm">{rec}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-center gap-4 print:hidden">
                <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
                    <Printer className="h-4 w-4" /> {t.reports.print}
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                    <Download className="h-4 w-4" /> {t.reports.export}
                </Button>
            </div>
        </div>
      ) : (
        <Card className="text-center p-20 border-dashed">
            <CardContent>
                <p className="text-muted-foreground">{t.reports.placeholder}</p>
            </CardContent>
        </Card>
      )}
    </div>
  );
}
