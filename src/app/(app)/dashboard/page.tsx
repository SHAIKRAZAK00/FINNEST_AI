"use client";

import { useFamily } from "@/context/family-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart as BarChartIcon,
  IndianRupee,
  PiggyBank,
  TrendingUp,
  Users,
  Zap,
  Wallet,
  CalendarDays,
  Settings2,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const chartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { expenses, goals, users, family, currentUser, setMonthlyBudget } = useFamily();
  const [isBudgetDialogOpen, setIsBudgetDialogOpen] = useState(false);
  const [budgetInput, setBudgetInput] = useState(family?.monthlyBudget?.toString() || "");

  const totalSpending = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
  const totalGoals = goals.length;
  const membersCount = users.length;
  const recentExpenses = useMemo(() => [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5), [expenses]);
  
  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("");
  const getUserById = (id: string) => users.find(u => u.id === id);

  const budgetUsage = useMemo(() => {
    if (!family?.monthlyBudget) return 0;
    return (family.currentMonthSpent || 0) / family.monthlyBudget * 100;
  }, [family]);

  const budgetColorClass = useMemo(() => {
    if (budgetUsage > 85) return "text-destructive";
    if (budgetUsage > 60) return "text-orange-500";
    return "text-green-500";
  }, [budgetUsage]);

  const topSpenderData = useMemo(() => {
    const spendingByUser: Record<string, number> = {};
    expenses.forEach(exp => {
      spendingByUser[exp.contributorId] = (spendingByUser[exp.contributorId] || 0) + exp.amount;
    });

    let topUserId = "";
    let maxAmount = 0;

    Object.entries(spendingByUser).forEach(([uid, amt]) => {
      if (amt > maxAmount) {
        maxAmount = amt;
        topUserId = uid;
      }
    });

    const user = users.find(u => u.id === topUserId);
    return {
      name: user?.name || "N/A",
      amount: maxAmount
    };
  }, [expenses, users]);

  const spendingByCategory = useMemo(() => {
    return expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
  }, [expenses]);

  const chartData = useMemo(() => {
    return Object.entries(spendingByCategory)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [spendingByCategory]);

  const handleUpdateBudget = () => {
    const amount = parseFloat(budgetInput);
    if (!isNaN(amount) && amount >= 0) {
      setMonthlyBudget(amount);
      setIsBudgetDialogOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-full overflow-hidden">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 dark:bg-primary/20 border-primary/20 neon-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary">Total Spending</CardTitle>
            <IndianRupee className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold gradient-text">
              ₹{totalSpending.toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Global aggregation</p>
          </CardContent>
        </Card>
        
        {/* Monthly Budget Card */}
        <Card className="bg-card relative overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Monthly Budget</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {family?.monthlyBudget ? (
              <div className="space-y-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">₹{(family.monthlyBudget - (family.currentMonthSpent || 0)).toLocaleString()}</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Left</span>
                </div>
                <Progress value={budgetUsage} className="h-1" />
                <div className="flex justify-between items-center text-[10px] uppercase tracking-tighter">
                  <span className={budgetUsage > 85 ? "text-destructive font-bold" : "text-muted-foreground"}>
                    {budgetUsage.toFixed(0)}% Used
                  </span>
                  <span>Limit: ₹{family.monthlyBudget.toLocaleString()}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground italic">No budget set for this month.</p>
                {currentUser?.role === 'Parent' && (
                  <Button variant="outline" size="sm" className="h-7 text-[10px] uppercase" onClick={() => setIsBudgetDialogOpen(true)}>
                    Initialize Budget
                  </Button>
                )}
              </div>
            )}
            
            {currentUser?.role === 'Parent' && family?.monthlyBudget && (
              <button 
                onClick={() => setIsBudgetDialogOpen(true)}
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
              >
                <Settings2 className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Goals</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{totalGoals}</div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Shared milestones</p>
          </CardContent>
        </Card>

        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{membersCount}</div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Connected nodes</p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Setup Dialog */}
      <Dialog open={isBudgetDialogOpen} onOpenChange={setIsBudgetDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Monthly Family Budget</DialogTitle>
            <DialogDescription>
              Establish a spending limit for the entire family. Only Parents can modify this value.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="budget">Monthly Limit (₹)</Label>
              <Input 
                id="budget" 
                type="number" 
                value={budgetInput} 
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder="e.g. 50000"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdateBudget}>Update Protocol</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChartIcon className="h-5 w-5 text-primary" /> Analytics Engine
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Categorized spending distribution
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 sm:h-80 w-full p-2 sm:p-6">
            <ChartContainer config={chartConfig} className="h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.1} />
                  <XAxis dataKey="category" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} stroke="currentColor" strokeOpacity={0.5} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} stroke="currentColor" strokeOpacity={0.5} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" /> Network Status
            </CardTitle>
            <CardDescription className="text-muted-foreground">Family member activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border transition-colors hover:bg-muted">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8 sm:h-10 sm:w-10 border-2 border-primary/20">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs sm:text-sm font-bold truncate max-w-[100px] sm:max-w-none">{user.name}</span>
                      <span className="text-[8px] sm:text-[10px] text-muted-foreground uppercase tracking-wider">{user.role}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-none font-mono text-[10px] sm:text-xs">
                    {user.points} XP
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
         <Card className="bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Real-time Ledger</CardTitle>
            <CardDescription className="text-muted-foreground">
              Synchronized family transactions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 sm:p-6 overflow-x-auto">
            <Table>
              <TableBody>
                {recentExpenses.length > 0 ? recentExpenses.map((expense) => {
                    const contributor = getUserById(expense.contributorId);
                    return (
                        <TableRow key={expense.id} className="hover:bg-muted/50 border-border">
                            <TableCell className="w-10 pl-4 sm:pl-0">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={contributor?.avatarUrl} alt={contributor?.name} />
                                    <AvatarFallback>{contributor ? getInitials(contributor.name): 'N/A'}</AvatarFallback>
                                </Avatar>
                            </TableCell>
                            <TableCell>
                                <div className="font-bold text-xs sm:text-sm">{expense.category}</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest truncate max-w-[120px] sm:max-w-none">{expense.description}</div>
                            </TableCell>
                            <TableCell className="text-right pr-4 sm:pr-0 font-mono text-xs sm:text-sm text-primary">
                                -₹{expense.amount.toFixed(0)}
                            </TableCell>
                        </TableRow>
                    );
                }) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                      Empty ledger.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-card shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Sync Status: Goals</CardTitle>
            <CardDescription className="text-muted-foreground">
              Shared financial milestones
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8 pt-4">
            {goals.filter(g => g.currentAmount < g.targetAmount).length > 0 ? (
              goals.filter(g => g.currentAmount < g.targetAmount).slice(0, 3).map((goal) => (
                <div key={goal.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Link href="/goals" className="text-xs sm:text-sm font-bold hover:text-primary transition-colors truncate max-w-[200px]">{goal.name}</Link>
                        <span className="font-mono text-[10px] text-primary">
                            {((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div className="relative">
                      <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-1.5" />
                      <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
                        <span>₹{goal.currentAmount.toLocaleString()}</span>
                        <span>₹{goal.targetAmount.toLocaleString()}</span>
                      </div>
                    </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4 text-sm uppercase tracking-widest">No active goals</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="h-5 w-5 text-primary animate-pulse"/>
                Weekly Protocol
            </CardTitle>
            <CardDescription className="text-muted-foreground">Earn XP by maintaining financial discipline</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                <div className="mr-2">
                    <p className="font-bold text-xs sm:text-sm">Ledger Update</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Add 5 expenses this cycle.</p>
                </div>
                <Badge className="bg-primary/20 text-primary border-none whitespace-nowrap">+50 XP</Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border border-border">
                <div className="mr-2">
                    <p className="font-bold text-xs sm:text-sm">Budget Discipline</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Stay under budget all month.</p>
                </div>
                <Badge className="bg-primary/20 text-primary border-none whitespace-nowrap">+100 XP</Badge>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
