"use client";

import { useMemo } from 'react';
import { useFamily } from "@/context/family-context";
import { mockBadges, getLevelFromPoints } from "@/lib/data";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Medal, Trophy, Star } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export default function LeaderboardPage() {
  const { users, t } = useFamily();
  
  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("");
  const getBadgeById = (id: string) => mockBadges.find(b => b.id === id);

  const rankedUsers = useMemo(() => 
    [...users].sort((a, b) => b.points - a.points),
    [users]
  );
  
  const RankIcon = ({ rank }: { rank: number }) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-slate-400" />;
    if (rank === 3) return <Trophy className="h-6 w-6 text-amber-700" />;
    return <span className="text-sm font-bold w-6 text-center">{rank}</span>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.leaderboard.title}</CardTitle>
        <CardDescription>
          {t.leaderboard.desc}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[80px] text-center">{t.leaderboard.rank}</TableHead>
                <TableHead>{t.leaderboard.member}</TableHead>
                <TableHead className="text-center">{t.leaderboard.level}</TableHead>
                <TableHead>{t.leaderboard.badges}</TableHead>
                <TableHead className="text-right">{t.leaderboard.points}</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {rankedUsers.map((user, index) => {
                    const rank = index + 1;
                    const level = getLevelFromPoints(user.points);
                    return (
                        <TableRow key={user.id}>
                            <TableCell>
                                <div className="flex items-center justify-center">
                                    <RankIcon rank={rank} />
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={user.avatarUrl} alt={user.name} />
                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium">{user.name}</p>
                                        <p className="text-sm text-muted-foreground">{user.role}</p>
                                    </div>
                                </div>
                            </TableCell>
                             <TableCell className="text-center">
                                <div className="flex flex-col items-center">
                                    <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 border-2 border-primary/20 text-primary font-bold">
                                        {level}
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    {(user.badges || []).map(badgeId => {
                                        const badge = getBadgeById(badgeId);
                                        return badge ? (
                                            <Tooltip key={badgeId}>
                                                <TooltipTrigger asChild>
                                                    <span className="p-1.5 bg-muted rounded-full cursor-pointer transition-transform hover:scale-110">
                                                        <badge.icon className="h-5 w-5 text-primary" />
                                                    </span>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                    <p className="font-semibold">{badge.name}</p>
                                                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                                                </TooltipContent>
                                            </Tooltip>
                                        ) : null
                                    })}
                                </div>
                            </TableCell>
                            <TableCell className="text-right font-bold text-lg">{user.points}</TableCell>
                        </TableRow>
                    )
                })}
            </TableBody>
            </Table>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
