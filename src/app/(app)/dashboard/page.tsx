
"use client";

import { useFamily } from "@/context/family-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { IndianRupee, PiggyBank, Users, Wallet, Zap, ShieldCheck, Star, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function DashboardPage() {
  const { expenses, goals, users, family, currentUser, trustMetric, setMonthlyBudget } = useFamily();
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  const budgetUsage = useMemo(() => {
    if (!family?.monthlyBudget) return 0;
    return (family.currentMonthSpent || 0) / family.monthlyBudget * 100;
  }, [family]);

  const handleUpdateBudget = () => {
    const amount = parseFloat(budgetInput);
    if (!isNaN(amount) && amount > 0) {
      setMonthlyBudget(amount);
      setBudgetInput("");
      setIsBudgetDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Trust Transparency Meter */}
        <TooltipProvider>
          <Card className="bg-gradient-to-br from-primary/20 to-transparent border-primary/30 relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-wider flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Family Trust Meter
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-muted-foreground hover:text-primary transition-colors">
                      <Info className="h-3 w-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p className="font-bold mb-1">How it works:</p>
                    <p className="text-[10px] leading-relaxed">
                      60% based on <span className="text-primary font-bold">Discipline</span> (staying under budget) and 40% on <span className="text-primary font-bold">Participation</span> (contributing to goals).
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl font-bold">{trustMetric?.overallTrustScore || 0}%</div>
                  <Badge variant="secondary" className="bg-primary/20 text-primary text-[10px]">REAL-TIME</Badge>
              </div>
              <Progress value={trustMetric?.overallTrustScore || 0} className="h-2" />
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="flex flex-col">
                  <span className="text-[8px] text-muted-foreground uppercase font-bold">Discipline</span>
                  <span className="text-xs font-bold text-primary">{trustMetric?.disciplineScore || 0}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[8px] text-muted-foreground uppercase font-bold">Goal Collab</span>
                  <span className="text-xs font-bold text-primary">{trustMetric?.contributionScore || 0}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipProvider>

        {/* Monthly Budget Card */}
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Budget Protocol</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {family?.monthlyBudget ? (
              <div className="space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold">₹{(family.monthlyBudget - (family.currentMonthSpent || 0)).toLocaleString()}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Remaining</span>
                </div>
                <Progress value={budgetUsage} className="h-1.5" />
                <div className="flex justify-between items-center text-[10px] uppercase">
                  <span className={budgetUsage > 85 ? "text-destructive font-bold" : "text-muted-foreground"}>
                    {budgetUsage.toFixed(0)}% Used
                  </span>
                  {currentUser?.role === 'Parent' && (
                    <Button variant="ghost" className="h-4 p-0 text-[8px] hover:text-primary" onClick={() => setIsBudgetDialogOpen(true)}>ADD TO BUDGET</Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground italic">No budget set.</p>
                {currentUser?.role === 'Parent' && (
                  <Button variant="outline" size="sm" className="h-7 text-[10px] uppercase" onClick={() => setIsBudgetDialogOpen(true)}>Initialize Budget</Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Goals</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{goals.length}</div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Shared milestones</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Intelligence XP</CardTitle>
            <Star className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentUser?.points || 0}</div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Behavioral rank</p>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add to Family Budget</DialogTitle>
            <DialogDescription>Increase the global spending limit for the family ecosystem.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="budget">Amount to Add (₹)</Label>
              <Input id="budget" type="number" value={budgetInput} onChange={(e) => setBudgetInput(e.target.value)} placeholder="e.g. 5000" />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateBudget} className="w-full">Confirm Top-Up</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="bg-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-primary"/> Financial Personality
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-center">
                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Your Classification</p>
                    <h3 className="text-xl font-bold text-primary">{currentUser?.financialPersonality || "Analyzing..."}</h3>
                    <p className="text-sm text-muted-foreground mt-2 italic">
                        {currentUser?.financialPersonality ? "Based on your spending behavior this month." : "Add more expenses to reveal your persona."}
                    </p>
                </div>
            </CardContent>
        </Card>

        <Card className="bg-card">
            <CardHeader>
                <CardTitle className="text-lg">Network Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {users.map((user) => (
                        <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                                    {user.name[0]}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold">{user.name}</span>
                                    <span className="text-[10px] text-muted-foreground uppercase">{user.role}</span>
                                </div>
                            </div>
                            <Badge variant="secondary" className="text-[10px]">{user.points} XP</Badge>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
