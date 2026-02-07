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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart as BarChartIcon,
  DollarSign,
  PiggyBank,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const chartConfig = {
  amount: {
    label: "Amount",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

export default function DashboardPage() {
  const { expenses, goals, users } = useFamily();

  const totalSpending = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalGoals = goals.length;
  const members = users.length;
  const recentExpenses = expenses.slice(0, 5);
  
  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("");
  const getUserById = (id: string) => users.find(u => u.id === id);

  const spendingByCategory = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(spendingByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spending</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalSpending.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGoals}</div>
            <p className="text-xs text-muted-foreground">Towards a brighter future</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Family Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members}</div>
            <p className="text-xs text-muted-foreground">Working together</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Spender</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Maya</div>
            <p className="text-xs text-muted-foreground">+20% from last month</p>
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
              Your family's spending by category this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64 w-full">
              <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="category" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => `$${value}`} />
                  <Tooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>
              The latest 5 transactions from your family.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableBody>
                {recentExpenses.map((expense) => {
                    const contributor = getUserById(expense.contributorId);
                    return (
                        <TableRow key={expense.id}>
                            <TableCell>
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src={contributor?.avatarUrl} alt={contributor?.name} />
                                    <AvatarFallback>{contributor ? getInitials(contributor.name): 'N/A'}</AvatarFallback>
                                </Avatar>
                            </TableCell>
                            <TableCell>
                                <div className="font-medium">{expense.category}</div>
                                <div className="text-sm text-muted-foreground">{expense.description}</div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                                -${expense.amount.toFixed(2)}
                            </TableCell>
                        </TableRow>
                    );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Goals</CardTitle>
          <CardDescription>
            Track your progress on shared family goals.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {goals.filter(g => g.currentAmount < g.targetAmount).slice(0, 3).map((goal) => (
            <div key={goal.id}>
                <div className="mb-2 flex items-center justify-between">
                    <Link href="/goals" className="font-semibold hover:underline">{goal.name}</Link>
                    <span className="text-sm font-medium text-muted-foreground">
                        ${goal.currentAmount.toLocaleString()} / ${goal.targetAmount.toLocaleString()}
                    </span>
                </div>
                <Progress value={(goal.currentAmount / goal.targetAmount) * 100} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
