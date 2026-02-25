
"use client";

import { useFamily } from "@/context/family-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Trophy, Lightbulb, Wallet, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

const QUIZZES = [
  { id: 'q1', title: 'Needs vs Wants', description: 'Learn to prioritize essentials.', pts: 50 },
  { id: 'q2', title: 'The Power of Saving', description: 'Why small amounts matter.', pts: 50 },
  { id: 'q3', title: 'Budgeting 101', description: 'Mastering your allowance.', pts: 50 },
];

export default function LearningPage() {
  const { currentUser, allowance, updateLearning } = useFamily();
  const [activeQuiz, setActiveQuiz] = useState<string | null>(null);

  if (currentUser?.role !== 'Child') {
    return (
        <div className="flex items-center justify-center h-[60vh] text-center">
            <Card className="max-w-md">
                <CardHeader>
                    <CardTitle>Restricted Access</CardTitle>
                    <CardDescription>Learning Mode is optimized for Child accounts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Switch to a Child profile to access quizzes and missions.</p>
                </CardContent>
            </Card>
        </div>
    );
  }

  const handleCompleteQuiz = (id: string, pts: number) => {
    const completed = currentUser.learning?.completedQuizzes || [];
    if (completed.includes(id)) {
        toast({ title: "Already Completed", description: "You've already earned XP for this quiz!" });
        return;
    }
    updateLearning({ completedQuizzes: [...completed, id] });
    toast({ title: "Quiz Master!", description: `You earned ${pts} XP!` });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-headline flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" /> Learning Mode
        </h1>
        <Badge className="bg-primary/20 text-primary">{currentUser.points} XP</Badge>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/30">
            <CardHeader>
                <CardTitle className="text-sm font-bold uppercase flex items-center gap-2">
                    <Wallet className="h-4 w-4" /> Virtual Allowance
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">₹{allowance?.total || 0}</div>
                <p className="text-[10px] text-muted-foreground mt-1 uppercase">Monthly Total from Parents</p>
                <Progress value={40} className="h-2 mt-4" />
                <p className="text-[10px] text-primary mt-2 uppercase font-bold text-right">40% Saved</p>
            </CardContent>
        </Card>

        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle className="text-lg">Active Missions</CardTitle>
                <CardDescription>Complete challenges to level up your financial IQ.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
                    <div className="flex items-center gap-3">
                        <Trophy className="h-5 w-5 text-yellow-500" />
                        <div>
                            <p className="font-bold text-sm">Saving Streak</p>
                            <p className="text-[10px] text-muted-foreground">Save ₹500 from your allowance.</p>
                        </div>
                    </div>
                    <Badge variant="outline">+100 XP</Badge>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
                    <div className="flex items-center gap-3">
                        <Lightbulb className="h-5 w-5 text-primary" />
                        <div>
                            <p className="font-bold text-sm">Knowledge Seeker</p>
                            <p className="text-[10px] text-muted-foreground">Complete 3 financial quizzes.</p>
                        </div>
                    </div>
                    <Badge variant="outline">+50 XP</Badge>
                </div>
            </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-bold mt-4 font-headline">Intelligence Quizzes</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {QUIZZES.map((quiz) => (
            <Card key={quiz.id} className="relative overflow-hidden">
                {currentUser.learning?.completedQuizzes.includes(quiz.id) && (
                    <div className="absolute top-2 right-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                    </div>
                )}
                <CardHeader>
                    <CardTitle className="text-base">{quiz.title}</CardTitle>
                    <CardDescription className="text-xs">{quiz.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button 
                        variant={currentUser.learning?.completedQuizzes.includes(quiz.id) ? "secondary" : "default"}
                        className="w-full h-8 text-xs"
                        onClick={() => handleCompleteQuiz(quiz.id, quiz.pts)}
                    >
                        {currentUser.learning?.completedQuizzes.includes(quiz.id) ? "Completed" : `Start (+${quiz.pts} XP)`}
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
}
