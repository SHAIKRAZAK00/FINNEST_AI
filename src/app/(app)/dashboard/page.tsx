
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{totalSpending.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Family total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGoals}</div>
            <p className="text-xs text-muted-foreground">Shared milestones</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{membersCount}</div>
            <p className="text-xs text-muted-foreground">Connected users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Spender</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topSpenderData.name}</div>
            <p className="text-xs text-muted-foreground">₹{topSpenderData.amount.toLocaleString("en-IN")} spent</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChartIcon className="h-5 w-5" /> Spending Breakdown
            </CardTitle>
            <CardDescription>
              Your family's spending by category.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="category" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => `₹${value}`} />
                  <Tooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Family Hub
            </CardTitle>
            <CardDescription>Members currently in your circle.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.role}</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {user.points} PTS
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              The latest transactions from your family.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {recentExpenses.length > 0 ? recentExpenses.map((expense) => {
                    const contributor = getUserById(expense.contributorId);
                    return (
                        <TableRow key={expense.id}>
                            <TableCell className="w-10">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={contributor?.avatarUrl} alt={contributor?.name} />
                                    <AvatarFallback>{contributor ? getInitials(contributor.name): 'N/A'}</AvatarFallback>
                                </Avatar>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium text-sm">{expense.category}</div>
                                <div className="text-xs text-muted-foreground">{expense.description}</div>
                            </TableCell>
                            <TableCell className="text-right font-medium text-sm">
                                -₹{expense.amount.toFixed(2)}
                            </TableCell>
                        </TableRow>
                    );
                }) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-10">
                      No transactions yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Goals</CardTitle>
            <CardDescription>
              Track progress on shared family milestones.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            {goals.filter(g => g.currentAmount < g.targetAmount).length > 0 ? (
              goals.filter(g => g.currentAmount < g.targetAmount).slice(0, 3).map((goal) => (
                <div key={goal.id}>
                    <div className="mb-2 flex items-center justify-between">
                        <Link href="/goals" className="text-sm font-semibold hover:underline">{goal.name}</Link>
                        <span className="text-xs font-medium text-muted-foreground">
                            ₹{goal.currentAmount.toLocaleString("en-IN")} / ₹{goal.targetAmount.toLocaleString("en-IN")}
                        </span>
                    </div>
                    <Progress value={(goal.currentAmount / goal.targetAmount) * 100} className="h-2" />
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4 text-sm">No active goals. Set one to start saving!</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary"/>
                Weekly Challenges
            </CardTitle>
            <CardDescription>Complete challenges to earn bonus points!</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                    <p className="font-semibold text-sm">Expense Tracker</p>
                    <p className="text-xs text-muted-foreground">Add 5 expenses this week.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary text-sm">+50 PTS</span>
                </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                    <p className="font-semibold text-sm">Savings Boost</p>
                    <p className="text-xs text-muted-foreground">Contribute to any goal.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary text-sm">+25 PTS</span>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
