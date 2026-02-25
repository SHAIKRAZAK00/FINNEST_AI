
"use client";

import { useFamily } from "@/context/family-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Trophy, Lightbulb, Wallet, CheckCircle2, Star, Target, Zap } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const QUIZZES = [
  { id: 'q1', title: 'Needs vs Wants', description: 'Learn to prioritize essentials.', pts: 50, icon: Target },
  { id: 'q2', title: 'The Power of Saving', description: 'Why small amounts matter over time.', pts: 50, icon: PiggyBank },
  { id: 'q3', title: 'Budgeting 101', description: 'Mastering your allowance protocol.', pts: 50, icon: Wallet },
];

const MISSIONS = [
  { id: 'm1', title: 'Saving Streak', goal: 'Save ₹500 from your allowance', progress: 40, reward: 100, icon: Zap },
  { id: 'm2', title: 'Knowledge Seeker', goal: 'Complete 3 financial quizzes', progress: 66, reward: 50, icon: Lightbulb },
  { id: 'm3', title: 'Goal Contributor', goal: 'Contribute to a family goal 5 times', progress: 20, reward: 150, icon: Trophy },
];

export default function LearningPage() {
  const { currentUser, allowance, updateLearning } = useFamily();
  const { toast } = useToast();
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);

  if (currentUser?.role !== 'Child') {
    return (
        <div className="flex items-center justify-center h-[60vh] text-center p-4">
            <Card className="max-w-md bg-card/50 backdrop-blur-xl border-white/5">
                <CardHeader>
                    <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-4">
                        <Lock className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-headline">Parental Restriction</CardTitle>
                    <CardDescription>Learning Mode is a gamified hub specifically designed for Child accounts to build financial literacy.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Please switch to a Child profile or log in as a Child to access quizzes, missions, and virtual rewards.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  const handleCompleteQuiz = (id: string, pts: number) => {
    const completed = currentUser.learning?.completedQuizzes || [];
    if (completed.includes(id)) {
        toast({ title: "Module Mastered", description: "You've already earned the XP for this intelligence unit." });
        return;
    }
    updateLearning({ completedQuizzes: [...completed, id] });
    toast({ 
        title: "Intelligence Upgrade!", 
        description: `Protocol complete. +${pts} XP added to your rank.` 
    });
  };

  const savedPercentage = allowance?.total && allowance.total > 0 
    ? (allowance.saved / allowance.total) * 100 
    : 0;

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
                <BookOpen className="h-8 w-8 text-primary" /> Learning Mode
            </h1>
            <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1">
                <Star className="h-3 w-3 mr-1 fill-current" /> {currentUser.points} XP
            </Badge>
        </div>
        <p className="text-muted-foreground">Sharpen your financial instincts and earn rewards by completing missions.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Virtual Allowance Stats */}
        <Card className="bg-gradient-to-br from-primary/20 to-transparent border-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Wallet className="h-24 w-24" />
            </div>
            <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                    <Wallet className="h-4 w-4" /> Virtual Vault
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <div className="text-3xl font-bold">₹{allowance?.total || 0}</div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Total Monthly Allowance</p>
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] uppercase font-bold">
                            <span className="text-muted-foreground">Savings Progress</span>
                            <span className="text-primary">{savedPercentage.toFixed(0)}%</span>
                        </div>
                        <Progress value={savedPercentage} className="h-2 bg-white/5" />
                        <p className="text-[10px] text-primary mt-1 font-bold">₹{allowance?.saved || 0} stashed away</p>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Missions Tracker */}
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-white/5">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" /> Active Missions
                </CardTitle>
                <CardDescription>Field operations to increase your financial intelligence rank.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {MISSIONS.map(mission => (
                    <div key={mission.id} className="group relative flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-4">
                            <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                <mission.icon className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold">{mission.title}</span>
                                <span className="text-[10px] text-muted-foreground uppercase">{mission.goal}</span>
                                <div className="w-32 mt-2">
                                    <Progress value={mission.progress} className="h-1 bg-white/5" />
                                </div>
                            </div>
                        </div>
                        <Badge variant="outline" className="border-primary/20 text-primary">+{mission.reward} XP</Badge>
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold font-headline flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" /> Intelligence Quizzes
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {QUIZZES.map((quiz) => {
                const isCompleted = currentUser.learning?.completedQuizzes.includes(quiz.id);
                return (
                    <Card key={quiz.id} className={cn(
                        "relative overflow-hidden transition-all hover:translate-y-[-2px]",
                        isCompleted ? "bg-primary/5 border-primary/20 opacity-80" : "bg-card border-white/5"
                    )}>
                        {isCompleted && (
                            <div className="absolute top-3 right-3">
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </div>
                        )}
                        <CardHeader className="pb-2">
                            <div className={cn(
                                "p-2 rounded-lg w-fit mb-2",
                                isCompleted ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                            )}>
                                <quiz.icon className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-base">{quiz.title}</CardTitle>
                            <CardDescription className="text-xs">{quiz.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button 
                                variant={isCompleted ? "secondary" : "default"}
                                className={cn(
                                    "w-full h-9 text-xs font-bold uppercase tracking-wider",
                                    !isCompleted && "bg-gradient-to-r from-primary to-indigo-600"
                                )}
                                onClick={() => handleCompleteQuiz(quiz.id, quiz.pts)}
                                disabled={isCompleted}
                            >
                                {isCompleted ? "Module Mastered" : `Launch Protocol (+${quiz.pts} XP)`}
                            </Button>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
      </div>
    </div>
  );
}

function PiggyBank(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1 .5-1.5 1-2V5z" />
            <path d="M7 11h.01" />
            <path d="M11 11h.01" />
            <path d="M15 11h.01" />
        </svg>
    )
}

function Lock(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
    )
}
