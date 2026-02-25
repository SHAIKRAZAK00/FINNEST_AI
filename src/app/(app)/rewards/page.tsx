
"use client";

import { useFamily } from "@/context/family-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Lock, Star, Target, ShieldCheck, Zap } from "lucide-react";
import { mockBadges } from "@/lib/data";

const ADVANCED_REWARDS = [
  { id: 'adv-1', name: 'Budget Guardian Pro', icon: ShieldCheck, condition: 'Stay under budget for 3 months.', progress: 66 },
  { id: 'adv-2', name: 'Elite Planner', icon: Target, condition: 'Achieve a Trust Score > 85.', progress: 100 },
  { id: 'adv-3', name: 'Knowledge Master', icon: Zap, condition: 'Complete all 10 Learning Quizzes.', progress: 30 },
];

export default function RewardsPage() {
  const { currentUser } = useFamily();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold font-headline flex items-center gap-3">
            <Trophy className="h-8 w-8 text-primary" /> Rewards Gallery
        </h1>
        <p className="text-muted-foreground">Track your achievements and unlock exclusive digital badges.</p>
      </div>

      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle className="text-lg">Rank: Level {Math.floor((currentUser?.points || 0) / 100) + 1}</CardTitle>
                <CardDescription>Experience points earned across the ecosystem.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase">{currentUser?.points || 0} / 1000 XP</span>
                    <Badge className="bg-primary/20 text-primary">TIER: ELITE</Badge>
                </div>
                <Progress value={((currentUser?.points || 0) % 1000) / 10} className="h-3" />
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Recent Milestone</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/30">
                    <Star className="h-8 w-8 text-primary animate-pulse" />
                </div>
                <div>
                    <p className="font-bold">Protocol Established</p>
                    <p className="text-sm text-muted-foreground">Successfully logged 10 family transactions.</p>
                </div>
            </CardContent>
        </Card>
      </div>

      <section>
        <h2 className="text-xl font-bold font-headline mb-4">Elite Achievements</h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {ADVANCED_REWARDS.map(reward => (
                <Card key={reward.id} className={reward.progress === 100 ? "border-primary/40 bg-primary/5" : "opacity-60"}>
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                            <div className={`p-2 rounded-lg ${reward.progress === 100 ? "bg-primary/20" : "bg-muted"}`}>
                                <reward.icon className={`h-6 w-6 ${reward.progress === 100 ? "text-primary" : "text-muted-foreground"}`} />
                            </div>
                            {reward.progress < 100 ? <Lock className="h-4 w-4 text-muted-foreground" /> : <Badge className="bg-green-500/10 text-green-500 text-[8px]">UNLOCKED</Badge>}
                        </div>
                        <CardTitle className="text-base mt-2">{reward.name}</CardTitle>
                        <CardDescription className="text-xs">{reward.condition}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between text-[10px] font-bold uppercase mb-1">
                            <span>Progress</span>
                            <span>{reward.progress}%</span>
                        </div>
                        <Progress value={reward.progress} className="h-1.5" />
                    </CardContent>
                </Card>
            ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold font-headline mb-4">Core Badges</h2>
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-4 lg:grid-cols-5">
            {mockBadges.map(badge => (
                <Card key={badge.id} className="text-center p-4 hover:border-primary/50 transition-colors cursor-pointer group">
                    <div className="h-12 w-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <badge.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <p className="text-xs font-bold leading-tight">{badge.name}</p>
                </Card>
            ))}
        </div>
      </section>
    </div>
  );
}
