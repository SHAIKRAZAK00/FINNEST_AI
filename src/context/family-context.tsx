"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User, Expense, Goal, Family } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getLevelFromPoints, mockBadges } from '@/lib/data';
import { useAuth, useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { deleteDocumentNonBlocking, setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { signOut } from 'firebase/auth';

interface FamilyContextType {
  family: Family | null;
  users: User[];
  currentUser: User | null;
  expenses: Expense[];
  goals: Goal[];
  addExpense: (expense: Omit<Expense, 'id' | 'contributorId' | 'date' | 'familyId'>) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount' | 'contributors' | 'familyId'>) => void;
  contributeToGoal: (goalId: string, amount: number) => { goalCompleted: boolean };
  removeUser: (userId: string) => void;
  updateUserAvatar: (avatarUrl: string) => void;
  loading: boolean;
  activeConfettiGoal: string | null;
  clearConfetti: () => void;
  logout: () => void;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

function FamilyDataProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const [familyId, setFamilyId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeConfettiGoal, setActiveConfettiGoal] = useState<string | null>(null);

  useEffect(() => {
    if (authUser && firestore) {
      const findFamily = async () => {
        const familiesCol = collection(firestore, 'families');
        const snapshot = await getDocs(familiesCol);
        for (const familyDoc of snapshot.docs) {
          const membersCol = collection(firestore, 'families', familyDoc.id, 'members');
          const memberDoc = await getDocs(query(membersCol, where('__name__', '==', authUser.uid)));
          if (!memberDoc.empty) {
            setFamilyId(familyDoc.id);
            return;
          }
        }
      };
      findFamily();
    } else {
      setFamilyId(null);
      setCurrentUser(null);
    }
  }, [authUser, firestore]);
  
  const familyRef = useMemoFirebase(() => familyId ? doc(firestore, 'families', familyId) : null, [firestore, familyId]);
  const { data: family, isLoading: isFamilyLoading } = useDoc<Family>(familyRef);

  const membersRef = useMemoFirebase(() => familyId ? collection(firestore, 'families', familyId, 'members') : null, [firestore, familyId]);
  const { data: users, isLoading: areUsersLoading } = useCollection<User>(membersRef);

  const expensesRef = useMemoFirebase(() => familyId ? collection(firestore, 'families', familyId, 'expenses') : null, [firestore, familyId]);
  const { data: expenses, isLoading: areExpensesLoading } = useCollection<Expense>(expensesRef);

  const goalsRef = useMemoFirebase(() => familyId ? collection(firestore, 'families', familyId, 'goals') : null, [firestore, familyId]);
  const { data: goals, isLoading: areGoalsLoading } = useCollection<Goal>(goalsRef);
  
  const gamificationRef = useMemoFirebase(() => (familyId && authUser) ? doc(firestore, 'families', familyId, 'gamification', authUser.uid) : null, [firestore, familyId, authUser]);
  const { data: gamificationData } = useDoc(gamificationRef);

  useEffect(() => {
    if (users && authUser) {
      const userProfile = users.find(u => u.id === authUser.uid);
      if (userProfile) {
        setCurrentUser({ ...userProfile, ...gamificationData, email: authUser.email || userProfile.email });
      }
    } else {
      setCurrentUser(null);
    }
  }, [users, authUser, gamificationData]);

  const loading = isAuthLoading || isFamilyLoading || areUsersLoading || areExpensesLoading || areGoalsLoading;

  const awardPointsAndCheckAchievements = async (userId: string, pointsToAward: number) => {
    if (!familyId || !firestore) return;
    
    const userGamificationRef = doc(firestore, "families", familyId, "gamification", userId);
    const userMembersRef = doc(firestore, "families", familyId, "members", userId);

    const batch = writeBatch(firestore);
    
    let currentPoints = 0;
    let currentBadges: string[] = [];

    if(currentUser?.id === userId) {
      currentPoints = currentUser.points || 0;
      currentBadges = currentUser.badges || [];
    } else {
      const userToUpdate = users?.find(u => u.id === userId);
      if(userToUpdate) {
        currentPoints = userToUpdate.points || 0;
        currentBadges = userToUpdate.badges || [];
      }
    }
    
    const oldPoints = currentPoints;
    const newPoints = oldPoints + pointsToAward;
    const oldLevel = getLevelFromPoints(oldPoints);
    const newLevel = getLevelFromPoints(newPoints);

    if (newLevel > oldLevel) {
      toast({
        title: "✨ Level Up! ✨",
        description: `Congratulations! You've reached Level ${newLevel}!`,
      });
    }

    batch.update(userGamificationRef, { points: newPoints, level: newLevel });

    const newBadges = [...currentBadges];
    if (!newBadges.includes('badge-1') && goals?.some(g => g.contributors.includes(userId))) {
      newBadges.push('badge-1');
    }
    if (!newBadges.includes('badge-2') && expenses && expenses.filter(e => e.contributorId === userId).length >= 4) {
      newBadges.push('badge-2');
    }
    
    const newlyAwardedBadges = newBadges.filter(b => !currentBadges.includes(b));
    if (newlyAwardedBadges.length > 0) {
      batch.update(userMembersRef, { badges: newBadges });
      newlyAwardedBadges.forEach(badgeId => {
        const badgeInfo = mockBadges.find(b => b.id === badgeId);
        if (badgeInfo) {
          toast({ title: `🏆 Badge Earned: ${badgeInfo.name}`, description: badgeInfo.description });
        }
      });
    }
    
    await batch.commit();
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'contributorId' | 'date' | 'familyId'>) => {
    if (!currentUser || !familyId || !firestore) return;
    const expensesColRef = collection(firestore, 'families', familyId, 'expenses');
    const expenseDocRef = doc(expensesColRef);
    const newExpense = { 
        ...expense, 
        id: expenseDocRef.id,
        familyId: familyId,
        contributorId: currentUser.id,
        date: new Date().toISOString()
    };
    setDocumentNonBlocking(expenseDocRef, newExpense, {});
    awardPointsAndCheckAchievements(currentUser.id, 10);
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'currentAmount' | 'contributors' | 'familyId'>) => {
    if (!currentUser || currentUser.role !== 'Parent' || !familyId || !firestore) return;
    const goalsColRef = collection(firestore, 'families', familyId, 'goals');
    const goalDocRef = doc(goalsColRef);
    const newGoal = {
        ...goal,
        id: goalDocRef.id,
        familyId: familyId,
        currentAmount: 0,
        contributors: []
    };
    setDocumentNonBlocking(goalDocRef, newGoal, {});
    awardPointsAndCheckAchievements(currentUser.id, 50);
  };

  const contributeToGoal = (goalId: string, amount: number) => {
    if (!currentUser || !familyId || !goals || !firestore) return { goalCompleted: false };
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return { goalCompleted: false };
    
    let goalCompleted = false;
    const newAmount = Math.min(goal.targetAmount, goal.currentAmount + amount);
    if (newAmount >= goal.targetAmount) goalCompleted = true;
    
    const newContributors = goal.contributors.includes(currentUser.id) 
        ? goal.contributors 
        : [...goal.contributors, currentUser.id];

    const goalRef = doc(firestore, 'families', familyId, 'goals', goalId);
    updateDocumentNonBlocking(goalRef, { currentAmount: newAmount, contributors: newContributors });

    awardPointsAndCheckAchievements(currentUser.id, 25);
    if (goalCompleted) {
      setActiveConfettiGoal(goalId);
    }
    return { goalCompleted };
  };

  const removeUser = async (userId: string) => {
    if (!currentUser || currentUser.role !== 'Parent' || currentUser.id === userId || !familyId || !firestore) return;
    const userMemberRef = doc(firestore, 'families', familyId, 'members', userId);
    const userGamificationRef = doc(firestore, 'families', familyId, 'gamification', userId);
    deleteDocumentNonBlocking(userMemberRef);
    deleteDocumentNonBlocking(userGamificationRef);
  };

  const updateUserAvatar = (avatarUrl: string) => {
    if (!currentUser || !familyId || !firestore) return;
    const userRef = doc(firestore, 'families', familyId, 'members', currentUser.id);
    updateDocumentNonBlocking(userRef, { avatarUrl });
  };
  
  const clearConfetti = () => setActiveConfettiGoal(null);

  const logout = () => {
    if (auth) {
      signOut(auth);
    }
    setFamilyId(null);
    setCurrentUser(null);
  };

  const value = { 
    family: family ? { ...family, id: familyId! } : null,
    users: users || [], 
    currentUser, 
    expenses: expenses || [],
    goals: goals || [], 
    addExpense, 
    addGoal, 
    contributeToGoal, 
    removeUser, 
    loading, 
    updateUserAvatar, 
    activeConfettiGoal, 
    clearConfetti,
    logout,
  };

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function FamilyProvider({ children }: { children: ReactNode }) {
    return <FamilyDataProvider>{children}</FamilyDataProvider>;
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
}
