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
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";

const chartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { expenses, goals, users } = useFamily();

  const totalSpending = useMemo(() => expenses.reduce((sum, exp) => sum + exp.amount, 0), [expenses]);
  const totalGoals = goals.length;
  const membersCount = users.length;
  const recentExpenses = useMemo(() => [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5), [expenses]);
  
  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("");
  const getUserById = (id: string) => users.find(u => u.id === id);

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

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-primary/20 to-transparent border-primary/20 neon-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-primary/80">Total Spending</CardTitle>
            <IndianRupee className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold gradient-text">
              ₹{totalSpending.toLocaleString("en-IN")}
            </div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Global aggregation</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-white/50">Active Goals</CardTitle>
            <PiggyBank className="h-4 w-4 text-white/50" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalGoals}</div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Shared milestones</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-white/50">Members</CardTitle>
            <Users className="h-4 w-4 text-white/50" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{membersCount}</div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Connected nodes</p>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-white/50">Top Spender</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">{topSpenderData.name}</div>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">₹{topSpenderData.amount.toLocaleString("en-IN")} spent</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-white/5 border-white/5 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChartIcon className="h-5 w-5 text-primary" /> Analytics Engine
            </CardTitle>
            <CardDescription className="text-white/40">
              Categorized spending distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid vertical={false} stroke="#ffffff10" />
                  <XAxis dataKey="category" tickLine={false} axisLine={false} tickMargin={8} fontSize={10} stroke="#ffffff40" />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={10} stroke="#ffffff40" tickFormatter={(value) => `₹${value}`} />
                  <Tooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-white/5 border-white/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="h-5 w-5 text-primary" /> Network Status
            </CardTitle>
            <CardDescription className="text-white/40">Family member activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 transition-colors hover:bg-white/10">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold">{user.name}</span>
                      <span className="text-[10px] text-white/40 uppercase tracking-wider">{user.role}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-none font-mono text-xs">
                    {user.points} XP
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         <Card className="bg-white/5 border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Real-time Ledger</CardTitle>
            <CardDescription className="text-white/40">
              Synchronized family transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {recentExpenses.length > 0 ? recentExpenses.map((expense) => {
                    const contributor = getUserById(expense.contributorId);
                    return (
                        <TableRow key={expense.id} className="hover:bg-white/5 border-white/5">
                            <TableCell className="w-10">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={contributor?.avatarUrl} alt={contributor?.name} />
                                    <AvatarFallback>{contributor ? getInitials(contributor.name): 'N/A'}</AvatarFallback>
                                </Avatar>
                            </TableCell>
                            <TableCell>
                                <div className="font-bold text-sm">{expense.category}</div>
                                <div className="text-[10px] text-white/40 uppercase tracking-widest">{expense.description}</div>
                            </TableCell>
                            <TableCell className="text-right font-mono text-sm text-primary">
                                -₹{expense.amount.toFixed(0)}
                            </TableCell>
                        </TableRow>
                    );
                }) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-white/30 py-10">
                      Empty ledger.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/5">
          <CardHeader>
            <CardTitle className="text-lg">Sync Status: Goals</CardTitle>
            <CardDescription className="text-white/40">
              Shared financial milestones
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-8 pt-4">
            {goals.filter(g => g.currentAmount < g.targetAmount).length > 0 ? (
              goals.filter(g => g.currentAmount < g.targetAmount).slice(0, 3).map((goal) => (
                <div key={goal.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Link href="/goals" className="text-sm font-bold hover:text-primary transition-colors">{goal.name}</Link>
                        <span className="font-mono text-[10px] text-primary">
                            {((goal.currentAmount / goal.targetAmount) * 100).toFixed(0)}%
                        </span>
                    </div>
                    <div className="relative">
                      <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-1.5 bg-white/10" />
                      <div className="mt-2 flex justify-between font-mono text-[10px] text-white/30">
                        <span>₹{goal.currentAmount.toLocaleString()}</span>
                        <span>₹{goal.targetAmount.toLocaleString()}</span>
                      </div>
                    </div>
                </div>
              ))
            ) : (
              <p className="text-center text-white/30 py-4 text-sm uppercase tracking-widest">No active goals</p>
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
            <CardDescription className="text-white/40">Earn XP by maintaining financial discipline</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                    <p className="font-bold text-sm">Ledger Update</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Add 5 expenses this cycle.</p>
                </div>
                <Badge className="bg-primary/20 text-primary border-none">+50 XP</Badge>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                    <p className="font-bold text-sm">Milestone Boost</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest">Contribute to a shared goal.</p>
                </div>
                <Badge className="bg-primary/20 text-primary border-none">+25 XP</Badge>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}