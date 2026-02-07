"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User, Expense, Goal, Family } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getLevelFromPoints, mockBadges } from '@/lib/data';

interface FamilyContextType {
  family: Family | null;
  users: User[];
  currentUser: User | null;
  expenses: Expense[];
  goals: Goal[];
  addExpense: (expense: Omit<Expense, 'id' | 'contributorId' | 'date'>) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount' | 'contributors'>) => void;
  contributeToGoal: (goalId: string, amount: number) => { goalCompleted: boolean };
  removeUser: (userId: string) => void;
  updateUserAvatar: (avatarUrl: string) => void;
  loading: boolean;
  activeConfettiGoal: string | null;
  clearConfetti: () => void;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [family, setFamily] = useState<Family | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConfettiGoal, setActiveConfettiGoal] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedFamily = localStorage.getItem('family');
      const storedUsers = localStorage.getItem('familyUsers');
      const storedCurrentUser = localStorage.getItem('currentUser');
      const storedExpenses = localStorage.getItem('familyExpenses');
      const storedGoals = localStorage.getItem('familyGoals');

      const loadedFamily = storedFamily ? JSON.parse(storedFamily) : null;
      const loadedUsers = (storedUsers ? JSON.parse(storedUsers) : []).map((u: any) => ({
        ...u,
        points: u.points || 0,
        badges: u.badges || [],
      }));
      const loadedCurrentUser = storedCurrentUser ? JSON.parse(storedCurrentUser) : null;
      
      setFamily(loadedFamily);
      setUsers(loadedUsers);
      
      if (loadedCurrentUser) {
          const fullUser = loadedUsers.find((u: User) => u.id === loadedCurrentUser.id) || loadedCurrentUser;
          setCurrentUser({
            ...fullUser,
            points: fullUser.points || 0,
            badges: fullUser.badges || [],
          });
      }

      setExpenses(storedExpenses ? JSON.parse(storedExpenses) : []);
      setGoals(storedGoals ? JSON.parse(storedGoals) : []);
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
    } finally {
        setLoading(false);
    }
  }, []);

  const awardPointsAndCheckAchievements = (
    userId: string, 
    pointsToAward: number,
    updatedData: { expenses: Expense[], goals: Goal[] }
  ) => {
    setUsers(prevUsers => {
      let user = prevUsers.find(u => u.id === userId);
      if (!user) return prevUsers;

      const oldPoints = user.points;
      const newPoints = oldPoints + pointsToAward;
      const oldLevel = getLevelFromPoints(oldPoints);
      const newLevel = getLevelFromPoints(newPoints);

      if (newLevel > oldLevel) {
        toast({
          title: "✨ Level Up! ✨",
          description: `Congratulations! You've reached Level ${newLevel}!`,
        });
      }

      user = { ...user, points: newPoints };
      
      const newBadges = [...user.badges];
      const userExpenses = updatedData.expenses.filter(e => e.contributorId === userId);
      
      if (!user.badges.includes('badge-1') && updatedData.goals.some(g => g.contributors.includes(userId))) {
        newBadges.push('badge-1');
      }
      if (!user.badges.includes('badge-2') && userExpenses.length >= 5) {
        newBadges.push('badge-2');
      }
      const contributedGoalIds = new Set(updatedData.goals.filter(g => g.contributors.includes(userId)).map(g => g.id));
      if (!user.badges.includes('badge-4') && contributedGoalIds.size >= 3) {
        newBadges.push('badge-4');
      }

      const newlyAwardedBadges = newBadges.filter(b => !user!.badges.includes(b));
      newlyAwardedBadges.forEach(badgeId => {
        const badgeInfo = mockBadges.find(b => b.id === badgeId);
        if (badgeInfo) {
          toast({
            title: `🏆 Badge Earned: ${badgeInfo.name}`,
            description: badgeInfo.description,
          });
        }
      });

      user = { ...user, badges: newBadges };
      
      const updatedUsers = prevUsers.map(u => u.id === userId ? user! : u);
      localStorage.setItem('familyUsers', JSON.stringify(updatedUsers));
      
      if (currentUser?.id === userId) {
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      return updatedUsers;
    });
  };

  const checkGroupAchievements = (updatedGoals: Goal[]) => {
    setUsers(prevUsers => {
        let usersToUpdate = [...prevUsers];
        let changesMade = false;

        updatedGoals.forEach(goal => {
            if (goal.currentAmount >= goal.targetAmount) { // Goal completed
                goal.contributors.forEach(contributorId => {
                    let contributorIndex = usersToUpdate.findIndex(u => u.id === contributorId);
                    if (contributorIndex === -1) return;
                    
                    let contributor = usersToUpdate[contributorIndex];
                    const originalBadges = [...contributor.badges];

                    if (!contributor.badges.includes('badge-3')) {
                        contributor.badges.push('badge-3');
                    }
                    if (!contributor.badges.includes('badge-5') && goal.targetAmount >= 10000) {
                        contributor.badges.push('badge-5');
                    }
                    
                    const newlyAwarded = contributor.badges.filter(b => !originalBadges.includes(b));
                    if (newlyAwarded.length > 0) {
                        changesMade = true;
                        usersToUpdate[contributorIndex] = contributor;
                        newlyAwarded.forEach(badgeId => {
                            const badgeInfo = mockBadges.find(b => b.id === badgeId);
                            if (badgeInfo) {
                                toast({ title: `🏆 Teamwork! ${contributor.name} earned: ${badgeInfo.name}` });
                            }
                        });
                    }
                });
            }
        });
        
        if (changesMade) {
          localStorage.setItem('familyUsers', JSON.stringify(usersToUpdate));
          if (currentUser) {
              const updatedCurrentUser = usersToUpdate.find(u => u.id === currentUser.id);
              if (updatedCurrentUser) setCurrentUser(updatedCurrentUser);
          }
          return usersToUpdate;
        }
        return prevUsers;
    });
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'contributorId' | 'date'>) => {
    if (!currentUser) return;
    const newExpense: Expense = { 
        ...expense, 
        id: `exp-${Date.now()}`,
        contributorId: currentUser.id,
        date: new Date().toISOString()
    };
    const updatedExpenses = [newExpense, ...expenses];
    setExpenses(updatedExpenses);
    localStorage.setItem('familyExpenses', JSON.stringify(updatedExpenses));
    awardPointsAndCheckAchievements(currentUser.id, 10, { expenses: updatedExpenses, goals });
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'currentAmount' | 'contributors'>) => {
    if (!currentUser || currentUser.role !== 'Parent') return;
    const newGoal: Goal = {
        ...goal,
        id: `goal-${Date.now()}`,
        currentAmount: 0,
        contributors: []
    };
    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    localStorage.setItem('familyGoals', JSON.stringify(updatedGoals));
    awardPointsAndCheckAchievements(currentUser.id, 50, { expenses, goals: updatedGoals });
  };

  const contributeToGoal = (goalId: string, amount: number) => {
    if (!currentUser) return { goalCompleted: false };
    let goalCompleted = false;
    const updatedGoals = goals.map(goal => {
        if (goal.id === goalId) {
            const newAmount = Math.min(goal.targetAmount, goal.currentAmount + amount);
            if(newAmount >= goal.targetAmount) goalCompleted = true;
            const newContributors = goal.contributors.includes(currentUser.id) ? goal.contributors : [...goal.contributors, currentUser.id];
            return { ...goal, currentAmount: newAmount, contributors: newContributors };
        }
        return goal;
    });
    setGoals(updatedGoals);
    localStorage.setItem('familyGoals', JSON.stringify(updatedGoals));
    
    awardPointsAndCheckAchievements(currentUser.id, 25, { expenses, goals: updatedGoals });
    if(goalCompleted) {
        checkGroupAchievements(updatedGoals);
        setActiveConfettiGoal(goalId);
    }
    return { goalCompleted };
  };

  const removeUser = (userId: string) => {
    if (!currentUser || currentUser.role !== 'Parent' || currentUser.id === userId) {
      console.warn("Attempted to remove user without permission or self-removal.");
      return;
    }
    const updatedUsers = users.filter(user => user.id !== userId);
    setUsers(updatedUsers);
    localStorage.setItem('familyUsers', JSON.stringify(updatedUsers));

    const updatedExpenses = expenses.filter(expense => expense.contributorId !== userId);
    setExpenses(updatedExpenses);
    localStorage.setItem('familyExpenses', JSON.stringify(updatedExpenses));

    const updatedGoals = goals.map(goal => ({
      ...goal,
      contributors: goal.contributors.filter(cId => cId !== userId),
    }));
    setGoals(updatedGoals);
    localStorage.setItem('familyGoals', JSON.stringify(updatedGoals));
  };

  const updateUserAvatar = (avatarUrl: string) => {
    if (!currentUser) return;
    const updatedUsers = users.map(u => 
      u.id === currentUser.id ? { ...u, avatarUrl } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('familyUsers', JSON.stringify(updatedUsers));
    const updatedCurrentUser = { ...currentUser, avatarUrl };
    setCurrentUser(updatedCurrentUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
  };
  
  const clearConfetti = () => setActiveConfettiGoal(null);

  const value = { family, users, currentUser, expenses, goals, addExpense, addGoal, contributeToGoal, removeUser, loading, updateUserAvatar, activeConfettiGoal, clearConfetti };

  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}
