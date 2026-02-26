"use client";

import { useFamily } from "@/context/family-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookOpen, Trophy, Lightbulb, Wallet, CheckCircle2, Star, Target, Zap, Lock, PiggyBank, ArrowRight, Smile, Frown, Sparkles } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const NEEDS_VS_WANTS_ITEMS = [
  { id: 1, name: "Fresh Apples", type: "Need", description: "Healthy food to keep you strong!" },
  { id: 2, name: "Diamond Watch", type: "Want", description: "Looks cool, but we don't need it to live." },
  { id: 3, name: "Clean Water", type: "Need", description: "We need water to stay hydrated!" },
  { id: 4, name: "New Video Game", type: "Want", description: "Fun to play, but not a necessity." },
  { id: 5, name: "School Uniform", type: "Need", description: "Important for going to school!" },
  { id: 6, name: "Giant Teddy Bear", type: "Want", description: "Cute for hugs, but you can live without it." },
];

const QUIZZES = [
  { id: 'q1', title: 'Needs vs Wants', description: 'Can you tell the difference?', pts: 100, icon: Target },
  { id: 'q2', title: 'The Power of Saving', description: 'Why small amounts matter over time.', pts: 50, icon: PiggyBank },
  { id: 'q3', title: 'Budgeting 101', description: 'Mastering your allowance protocol.', pts: 50, icon: Wallet },
];

const MISSIONS = [
  { id: 'm1', title: 'Saving Streak', goal: 'Save ₹500 from your allowance', progress: 40, reward: 100, icon: Zap },
  { id: 'm2', title: 'Knowledge Seeker', goal: 'Complete 3 financial quizzes', progress: 33, reward: 50, icon: Lightbulb },
  { id: 'm3', title: 'Goal Contributor', goal: 'Contribute to a family goal 5 times', progress: 20, reward: 150, icon: Trophy },
];

export default function LearningPage() {
  const { currentUser, allowance, updateLearning, depositToVault } = useFamily();
  const { toast } = useToast();
  
  // Vault States
  const [depositAmount, setDepositAmount] = useState("");
  const [isVaultOpen, setIsVaultOpen] = useState(false);

  // Game States
  const [activeGame, setActiveGame] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);

  if (currentUser?.role !== 'Child') {
    return (
        <div className="flex items-center justify-center h-[60vh] text-center p-4">
            <Card className="max-w-md bg-card/50 backdrop-blur-xl border-white/5 shadow-2xl">
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

  const handleDeposit = () => {
    const amount = parseFloat(depositAmount);
    if (!isNaN(amount) && amount > 0) {
      depositToVault(amount);
      setDepositAmount("");
      setIsVaultOpen(false);
    }
  };

  const startNeedsVsWants = () => {
    setActiveGame('q1');
    setCurrentItem(0);
    setGameScore(0);
    setGameFinished(false);
  };

  const handleChoice = (choice: string) => {
    const isCorrect = choice === NEEDS_VS_WANTS_ITEMS[currentItem].type;
    if (isCorrect) {
      setGameScore(s => s + 1);
      toast({ title: "Great job!", description: "That's exactly right!", duration: 1500 });
    } else {
      toast({ variant: "destructive", title: "Oops!", description: "Not quite, but keep going!", duration: 1500 });
    }

    if (currentItem < NEEDS_VS_WANTS_ITEMS.length - 1) {
      setCurrentItem(c => c + 1);
    } else {
      setGameFinished(true);
    }
  };

  const finishGame = (quizId: string, pts: number) => {
    const completed = currentUser.learning?.completedQuizzes || [];
    if (!completed.includes(quizId)) {
      updateLearning({ completedQuizzes: [...completed, quizId] });
      toast({ 
        title: "Intelligence Upgrade!", 
        description: `Protocol complete. +${pts} XP added to your rank.` 
      });
    }
    setActiveGame(null);
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
            <Badge className="bg-primary/20 text-primary border-primary/30 px-3 py-1 font-mono text-sm">
                <Star className="h-3 w-3 mr-1 fill-current" /> {currentUser.points} XP
            </Badge>
        </div>
        <p className="text-muted-foreground">Master your financial protocol and unlock your inner Budget Guardian.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        {/* Virtual Vault Stats */}
        <Card className="bg-gradient-to-br from-primary/20 to-transparent border-primary/30 relative overflow-hidden flex flex-col justify-between">
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
                            <span className="text-muted-foreground">Savings Protocol</span>
                            <span className="text-primary">{savedPercentage.toFixed(0)}%</span>
                        </div>
                        <Progress value={savedPercentage} className="h-2 bg-white/5" />
                        <p className="text-[10px] text-primary mt-1 font-bold">₹{allowance?.saved || 0} stashed away</p>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Dialog open={isVaultOpen} onOpenChange={setIsVaultOpen}>
                    <DialogTrigger asChild>
                        <Button className="w-full h-8 text-[10px] uppercase font-bold tracking-widest" variant="secondary">
                            <PiggyBank className="mr-2 h-4 w-4" /> Deposit to Vault
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Deposit into Virtual Vault</DialogTitle>
                            <DialogDescription>How much of your allowance did you save today?</DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Label htmlFor="deposit-amount">Saving Amount (₹)</Label>
                            <Input 
                                id="deposit-amount" 
                                type="number" 
                                value={depositAmount} 
                                onChange={(e) => setDepositAmount(e.target.value)} 
                                placeholder="e.g. 100"
                            />
                        </div>
                        <DialogFooter>
                            <Button onClick={handleDeposit} className="w-full">Secure Deposit</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>

        {/* Missions Tracker */}
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-white/5">
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-primary" /> Active Missions
                </CardTitle>
                <CardDescription>Real-world operations to build financial XP.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
                {MISSIONS.map(mission => (
                    <div key={mission.id} className="group relative flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:border-primary/30 transition-all">
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
                        <Badge variant="outline" className="border-primary/20 text-primary text-[10px]">+{mission.reward} XP</Badge>
                    </div>
                ))}
            </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold font-headline flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" /> Intelligence Modules
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {QUIZZES.map((quiz) => {
                const isCompleted = currentUser.learning?.completedQuizzes.includes(quiz.id);
                return (
                    <Card key={quiz.id} className={cn(
                        "relative overflow-hidden transition-all hover:translate-y-[-2px] flex flex-col h-full",
                        isCompleted ? "bg-primary/5 border-primary/20 opacity-90" : "bg-card border-white/5"
                    )}>
                        {isCompleted && (
                            <div className="absolute top-3 right-3 animate-in zoom-in-0">
                                <CheckCircle2 className="h-6 w-6 text-green-500 fill-green-500/10" />
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
                        <CardContent className="flex-grow flex items-end">
                            {quiz.id === 'q1' ? (
                                <Dialog open={activeGame === 'q1'} onOpenChange={(open) => !open && setActiveGame(null)}>
                                    <DialogTrigger asChild>
                                        <Button 
                                            variant={isCompleted ? "secondary" : "default"}
                                            className={cn("w-full h-9 text-xs font-bold uppercase tracking-widest")}
                                            onClick={startNeedsVsWants}
                                            disabled={isCompleted}
                                        >
                                            {isCompleted ? "Protocol Mastered" : `Launch Game (+${quiz.pts} XP)`}
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-2xl">
                                        <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-950 p-6 text-white text-center">
                                            {!gameFinished ? (
                                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                                    <div className="flex justify-between items-center text-xs font-bold opacity-70">
                                                        <span>ITEM {currentItem + 1} OF {NEEDS_VS_WANTS_ITEMS.length}</span>
                                                        <span className="flex items-center gap-1"><Star className="h-3 w-3 fill-yellow-400 text-yellow-400"/> SCORE: {gameScore}</span>
                                                    </div>
                                                    
                                                    <div className="py-8 space-y-4">
                                                        <div className="mx-auto w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center shadow-inner border border-white/5">
                                                            <Sparkles className="h-10 w-10 text-primary animate-pulse" />
                                                        </div>
                                                        <h3 className="text-2xl font-bold font-headline">{NEEDS_VS_WANTS_ITEMS[currentItem].name}</h3>
                                                        <p className="text-xs opacity-60 italic">{NEEDS_VS_WANTS_ITEMS[currentItem].description}</p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-4">
                                                        <Button 
                                                            onClick={() => handleChoice('Need')} 
                                                            className="h-16 bg-green-500 hover:bg-green-600 text-white font-bold text-lg"
                                                        >
                                                            <Smile className="mr-2 h-6 w-6" /> NEED
                                                        </Button>
                                                        <Button 
                                                            onClick={() => handleChoice('Want')} 
                                                            className="h-16 bg-blue-500 hover:bg-blue-600 text-white font-bold text-lg"
                                                        >
                                                            <Frown className="mr-2 h-6 w-6" /> WANT
                                                        </Button>
                                                    </div>
                                                    <p className="text-[10px] opacity-40 uppercase tracking-widest font-bold">Sort carefully to earn your XP!</p>
                                                </div>
                                            ) : (
                                                <div className="py-10 space-y-6 animate-in zoom-in-95 duration-300 text-center">
                                                    <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                                                        <Trophy className="h-10 w-10 text-white" />
                                                    </div>
                                                    <h3 className="text-3xl font-bold font-headline">Unit Mastered!</h3>
                                                    <p className="text-sm opacity-80">You correctly sorted {gameScore} out of {NEEDS_VS_WANTS_ITEMS.length} items. Your financial IQ is growing!</p>
                                                    <Button 
                                                        onClick={() => finishGame(quiz.id, quiz.pts)} 
                                                        className="w-full bg-white text-indigo-900 font-bold hover:bg-white/90"
                                                    >
                                                        Claim {quiz.pts} XP <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            ) : (
                                <Button 
                                    variant={isCompleted ? "secondary" : "default"}
                                    className={cn("w-full h-9 text-xs font-bold uppercase tracking-widest")}
                                    disabled={isCompleted}
                                >
                                    {isCompleted ? "Protocol Mastered" : `Launch Module (+${quiz.pts} XP)`}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
      </div>
    </div>
  );
}
