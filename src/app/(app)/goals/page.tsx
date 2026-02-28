
"use client";

import { useState, useEffect } from "react";
import { useFamily } from "@/context/family-context";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, Target } from "lucide-react";
import { differenceInDays } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Confetti } from "@/components/confetti";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";


export default function GoalsPage() {
  const { goals, users, currentUser, contributeToGoal, addGoal, activeConfettiGoal, clearConfetti, t } = useFamily();
  const [isNewGoalOpen, setIsNewGoalOpen] = useState(false);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [contributionAmount, setContributionAmount] = useState('');
  const [newGoal, setNewGoal] = useState({ name: '', description: '', targetAmount: '', deadline: '' });
  const { toast } = useToast();

  useEffect(() => {
    if (activeConfettiGoal) {
      const timer = setTimeout(() => {
        clearConfetti();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [activeConfettiGoal, clearConfetti]);
  
  const isActionAllowed = currentUser?.role === 'Parent' || currentUser?.role === 'Child';

  const getUserById = (id: string) => users.find((u) => u.id === id);
  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("");

  const handleContribute = () => {
    if (selectedGoalId && contributionAmount) {
        contributeToGoal(selectedGoalId, parseFloat(contributionAmount));
        setContributionAmount('');
        setIsContributeOpen(false);
        setSelectedGoalId(null);
    }
  };

  const handleAddGoal = () => {
    if (newGoal.name && newGoal.targetAmount && newGoal.deadline) {
        addGoal({
            name: newGoal.name,
            description: newGoal.description,
            targetAmount: parseFloat(newGoal.targetAmount),
            deadline: new Date(newGoal.deadline).toISOString(),
        });
        setNewGoal({ name: '', description: '', targetAmount: '', deadline: '' });
        setIsNewGoalOpen(false);
        toast({ title: "Goal Created!", description: "Your new family goal has been set." });
    }
  };

  const openContributeDialog = (goalId: string) => {
    setSelectedGoalId(goalId);
    setIsContributeOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline">{t.goals.title}</h1>
        <Dialog open={isNewGoalOpen} onOpenChange={setIsNewGoalOpen}>
            <DialogTrigger asChild>
                <Button size="sm" className="gap-1" disabled={!isActionAllowed}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                        {t.goals.newGoal}
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t.goals.createTitle}</DialogTitle>
                    <DialogDescription>{t.goals.createDesc}</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="goal-name">{t.goals.goalName}</Label>
                        <Input id="goal-name" value={newGoal.name} onChange={(e) => setNewGoal({...newGoal, name: e.target.value})} placeholder={t.goals.goalNamePlaceholder} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="goal-desc">{t.goals.description}</Label>
                        <Textarea id="goal-desc" value={newGoal.description} onChange={(e) => setNewGoal({...newGoal, description: e.target.value})} placeholder={t.goals.descPlaceholder}/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="goal-amount">{t.goals.targetAmount}</Label>
                            <Input id="goal-amount" type="number" value={newGoal.targetAmount} onChange={(e) => setNewGoal({...newGoal, targetAmount: e.target.value})} placeholder="₹150000" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="goal-deadline">{t.goals.deadline}</Label>
                            <Input id="goal-deadline" type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({...newGoal, deadline: e.target.value})} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleAddGoal}>{t.goals.createButton}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const progress = (goal.targetAmount > 0) ? (goal.currentAmount / goal.targetAmount) * 100 : 100;
          const isCompleted = progress >= 100;
          const daysLeft = differenceInDays(new Date(goal.deadline), new Date());
          
          return (
            <Card key={goal.id} className="relative overflow-hidden flex flex-col">
              <Confetti active={activeConfettiGoal === goal.id} />
              <CardHeader>
                <CardTitle className="flex items-start justify-between">
                  <span className="flex items-center gap-2"><Target className="h-5 w-5"/>{goal.name}</span>
                  {isCompleted && <span className="text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 px-2 py-1 rounded-full">{t.goals.completed}</span>}
                </CardTitle>
                <CardDescription>{goal.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-2 flex justify-between text-sm text-muted-foreground">
                  <span>{t.goals.progress}</span>
                  <span>{daysLeft >= 0 ? `${daysLeft} ${t.goals.daysLeft}` : t.goals.pastDeadline}</span>
                </div>
                <Progress value={progress} aria-label={`${goal.name} progress`} />
                <div className="mt-2 flex justify-between text-sm font-semibold">
                  <span>₹{goal.currentAmount.toLocaleString('en-IN')}</span>
                  <span className="text-muted-foreground">₹{goal.targetAmount.toLocaleString('en-IN')}</span>
                </div>
              </CardContent>
              <CardFooter className="flex-col items-start gap-4">
                 <div className="flex items-center -space-x-2">
                    {goal.contributors && goal.contributors.map(userId => {
                        const user = getUserById(userId);
                        return user ? (
                            <Avatar key={userId} className="h-8 w-8 border-2 border-card">
                                <AvatarImage src={user.avatarUrl} alt={user.name} />
                                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                        ) : null;
                    })}
                    {goal.contributors && goal.contributors.length > 0 && <span className="pl-4 text-xs text-muted-foreground">
                        {goal.contributors.length} {goal.contributors.length > 1 ? t.goals.contributors : t.goals.contributor}
                    </span>}
                 </div>
                <Button className="w-full" disabled={isCompleted || !currentUser || (currentUser.role !== 'Parent' && currentUser.role !== 'Child') } onClick={() => openContributeDialog(goal.id)}>
                    {t.goals.addButton}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

       <Dialog open={isContributeOpen} onOpenChange={(open) => {
            if (!open) {
                setIsContributeOpen(false);
                setSelectedGoalId(null);
                setContributionAmount('');
            }
       }}>
            <DialogContent>
            <DialogHeader>
                <DialogTitle>{t.goals.contributeTitle} {goals.find(g => g.id === selectedGoalId)?.name}</DialogTitle>
                <DialogDescription>{t.goals.contributeDesc}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
                <Label htmlFor="contribution-amount">{t.goals.amount}</Label>
                <Input id="contribution-amount" type="number" placeholder="₹5000" value={contributionAmount} onChange={(e) => setContributionAmount(e.target.value)} />
            </div>
            <DialogFooter>
                <Button onClick={handleContribute}>{t.goals.addButton}</Button>
            </DialogFooter>
            </DialogContent>
       </Dialog>
    </div>
  );
}
