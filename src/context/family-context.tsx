"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { User, Expense, Goal, Family, TrustMetric, Allowance } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, getDocs, getDoc, increment, runTransaction } from 'firebase/firestore';
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { signOut } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { format } from 'date-fns';

interface FamilyContextType {
  family: Family | null;
  users: User[];
  currentUser: User | null;
  authUser: FirebaseUser | null;
  expenses: Expense[];
  goals: Goal[];
  trustMetric: TrustMetric | null;
  allowance: Allowance | null;
  addExpense: (expense: Omit<Expense, 'id' | 'contributorId' | 'date' | 'familyId'>) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount' | 'contributors' | 'familyId'>) => void;
  contributeToGoal: (goalId: string, amount: number) => Promise<{ goalCompleted: boolean; success: boolean }>;
  setMonthlyBudget: (amount: number) => void;
  removeUser: (userId: string) => void;
  updateUserAvatar: (avatarUrl: string) => void;
  updatePersonality: (personality: string) => void;
  updateLearning: (learningData: Partial<User['learning']>) => void;
  setAllowance: (childId: string, amount: number) => void;
  depositToVault: (amount: number) => void;
  loading: boolean;
  activeConfettiGoal: string | null;
  clearConfetti: () => void;
  logout: () => void;
  refreshFamily: (forcedId?: string) => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

function FamilyDataProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const [familyId, setFamilyId] = useState<string | null>(null);
  const [isSearchingFamily, setIsSearchingFamily] = useState(false);
  const [hasAttemptedLookup, setHasAttemptedLookup] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeConfettiGoal, setActiveConfettiGoal] = useState<string | null>(null);

  const findFamily = useCallback(async (forcedId?: string) => {
    if (forcedId) {
      setFamilyId(forcedId);
      setHasAttemptedLookup(true);
      return;
    }
    if (!authUser || !firestore) return;
    setIsSearchingFamily(true);
    try {
      const cachedId = typeof window !== 'undefined' ? localStorage.getItem(`familyId_${authUser.uid}`) : null;
      if (cachedId) {
        const memberDocRef = doc(firestore, 'families', cachedId, 'members', authUser.uid);
        const memberSnapshot = await getDoc(memberDocRef);
        if (memberSnapshot.exists()) {
          setFamilyId(cachedId);
          setHasAttemptedLookup(true);
          setIsSearchingFamily(false);
          return;
        }
      }
      
      const familiesCol = collection(firestore, 'families');
      const snapshot = await getDocs(familiesCol);
      let foundFamilyId = null;
      
      for (const familyDoc of snapshot.docs) {
        try {
          const memberDocRef = doc(firestore, 'families', familyDoc.id, 'members', authUser.uid);
          const memberSnapshot = await getDoc(memberDocRef);
          if (memberSnapshot.exists()) {
            foundFamilyId = familyDoc.id;
            localStorage.setItem(`familyId_${authUser.uid}`, foundFamilyId);
            break;
          }
        } catch (e) { continue; }
      }
      setFamilyId(foundFamilyId);
    } catch (err) {
      console.error("Error finding family:", err);
    } finally {
      setIsSearchingFamily(false);
      setHasAttemptedLookup(true);
    }
  }, [authUser, firestore]);

  useEffect(() => {
    if (!isAuthLoading && !authUser) {
      setFamilyId(null);
      setCurrentUser(null);
      setHasAttemptedLookup(false);
      setIsSearchingFamily(false);
      return;
    }
    if (authUser && firestore && !hasAttemptedLookup && !isSearchingFamily) {
      findFamily();
    }
  }, [authUser, firestore, isAuthLoading, hasAttemptedLookup, isSearchingFamily, findFamily]);
  
  const familyRef = useMemoFirebase(() => familyId ? doc(firestore, 'families', familyId) : null, [firestore, familyId]);
  const { data: familyData, isLoading: isFamilyLoading } = useDoc<Family>(familyRef);

  const membersRef = useMemoFirebase(() => familyId ? collection(firestore, 'families', familyId, 'members') : null, [firestore, familyId]);
  const { data: users, isLoading: areUsersLoading } = useCollection<User>(membersRef);

  const expensesRef = useMemoFirebase(() => familyId ? collection(firestore, 'families', familyId, 'expenses') : null, [firestore, familyId]);
  const { data: expenses, isLoading: areExpensesLoading } = useCollection<Expense>(expensesRef);

  const goalsRef = useMemoFirebase(() => familyId ? collection(firestore, 'families', familyId, 'goals') : null, [firestore, familyId]);
  const { data: goals, isLoading: areGoalsLoading } = useCollection<Goal>(goalsRef);
  
  const trustRef = useMemoFirebase(() => (familyId && authUser) ? doc(firestore, 'families', familyId, 'trustMetrics', authUser.uid) : null, [firestore, familyId, authUser]);
  const { data: trustMetric } = useDoc<TrustMetric>(trustRef);

  const allowanceRef = useMemoFirebase(() => (familyId && authUser) ? doc(firestore, 'families', familyId, 'allowances', authUser.uid) : null, [firestore, familyId, authUser]);
  const { data: allowance } = useDoc<Allowance>(allowanceRef);

  useEffect(() => {
    if (users && authUser) {
      const userProfile = users.find(u => u.id === authUser.uid);
      if (userProfile) {
        setCurrentUser({ 
          ...userProfile, 
          email: authUser.email || userProfile.email 
        });
      } else {
          setCurrentUser(null);
      }
    } else {
        setCurrentUser(null);
    }
  }, [users, authUser]);

  const awardPoints = useCallback(async (userId: string, pts: number) => {
    if (!familyId || !firestore) return;
    const memberRef = doc(firestore, 'families', familyId, 'members', userId);
    updateDocumentNonBlocking(memberRef, { points: increment(pts) });
  }, [familyId, firestore]);

  const updateTrustMetrics = useCallback(async () => {
    if (!familyId || !firestore || !authUser || !expenses || !familyData) return;
    
    const budget = familyData.monthlyBudget || 0;
    const spent = familyData.currentMonthSpent || 0;
    const discipline = budget > 0 ? Math.max(0, 100 - (spent / budget * 100)) : 100;
    const participation = goals?.filter(g => g.contributors.includes(authUser.uid)).length || 0;
    const contributionScore = Math.min(100, participation * 20);
    const overall = (discipline * 0.6) + (contributionScore * 0.4);
    
    const trustDoc = doc(firestore, 'families', familyId, 'trustMetrics', authUser.uid);
    setDocumentNonBlocking(trustDoc, {
      overallTrustScore: Math.round(overall),
      disciplineScore: Math.round(discipline),
      contributionScore: Math.round(contributionScore),
      updatedAt: new Date().toISOString()
    }, { merge: true });
  }, [familyId, firestore, authUser, expenses, familyData, goals]);

  useEffect(() => {
    const timer = setTimeout(() => {
        if (familyId && authUser) updateTrustMetrics();
    }, 5000);
    return () => clearTimeout(timer);
  }, [familyId, authUser, updateTrustMetrics]);

  const addExpense = async (expense: Omit<Expense, 'id' | 'contributorId' | 'date' | 'familyId'>) => {
    if (!currentUser || !familyId || !firestore) return;
    if (expense.amount <= 0) {
      toast({ variant: "destructive", title: "Invalid Amount", description: "Expense must be greater than 0." });
      return;
    }
    const familyDocRef = doc(firestore, 'families', familyId);
    const expensesColRef = collection(firestore, 'families', familyId, 'expenses');
    const expenseDocRef = doc(expensesColRef);
    const id = expenseDocRef.id;
    const newExpense = { ...expense, id, familyId, contributorId: currentUser.id, date: new Date().toISOString() };
    try {
      await runTransaction(firestore, async (tx) => {
        const famSnap = await tx.get(familyDocRef);
        const data = famSnap.data() as Family;
        tx.set(expenseDocRef, newExpense);
        tx.update(familyDocRef, { currentMonthSpent: (data.currentMonthSpent || 0) + expense.amount });
      });
      awardPoints(currentUser.id, 10);
      toast({ title: "Expense Added" });
    } catch (e) { 
      console.error(e);
      toast({ variant: "destructive", title: "Sync Error", description: "Could not add expense. Please try again." });
    }
  };

  const setMonthlyBudget = (amount: number) => {
    if (!currentUser || currentUser.role !== 'Parent' || !familyId || !firestore) return;
    const familyDocRef = doc(firestore, 'families', familyId);
    updateDocumentNonBlocking(familyDocRef, { monthlyBudget: increment(amount), budgetMonth: format(new Date(), 'yyyy-MM') });
    toast({ title: "Budget Updated", description: `₹${amount} added to family limit.` });
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'currentAmount' | 'contributors' | 'familyId'>) => {
    if (!currentUser || currentUser.role !== 'Parent' || !familyId || !firestore) return;
    const goalDocRef = doc(collection(firestore, 'families', familyId, 'goals'));
    setDocumentNonBlocking(goalDocRef, { ...goal, id: goalDocRef.id, familyId, currentAmount: 0, contributors: [] }, {});
    awardPoints(currentUser.id, 50);
  };

  const contributeToGoal = async (goalId: string, amount: number) => {
    if (!currentUser || !familyId || !firestore) return { goalCompleted: false, success: false };
    if (amount <= 0) return { goalCompleted: false, success: false };

    const goalRef = doc(firestore, 'families', familyId, 'goals', goalId);
    try {
      const result = await runTransaction(firestore, async (tx) => {
        const goalSnap = await tx.get(goalRef);
        if (!goalSnap.exists()) throw new Error("Goal not found");
        
        const goalData = goalSnap.data() as Goal;
        const newAmount = Math.min(goalData.targetAmount, goalData.currentAmount + amount);
        const isCompleted = newAmount >= goalData.targetAmount;
        const newContributors = goalData.contributors.includes(currentUser.id) 
          ? goalData.contributors 
          : [...goalData.contributors, currentUser.id];

        tx.update(goalRef, { 
          currentAmount: newAmount, 
          contributors: newContributors 
        });

        return { isCompleted };
      });

      awardPoints(currentUser.id, 25);
      if (result.isCompleted) {
        setActiveConfettiGoal(goalId);
        toast({ title: "Goal Achieved!", description: "Family milestone complete!" });
      } else {
        toast({ title: "Contribution Logged", description: "Great step towards the goal!" });
      }
      return { goalCompleted: result.isCompleted, success: true };
    } catch (e) {
      console.error(e);
      toast({ variant: "destructive", title: "Sync Error", description: "Failed to log contribution." });
      return { goalCompleted: false, success: false };
    }
  };

  const updatePersonality = (personality: string) => {
    if (!currentUser || !familyId || !firestore) return;
    const memberRef = doc(firestore, 'families', familyId, 'members', currentUser.id);
    updateDocumentNonBlocking(memberRef, { financialPersonality: personality, personalityLastUpdated: new Date().toISOString() });
    awardPoints(currentUser.id, 100);
  };

  const updateLearning = (learningData: Partial<User['learning']>) => {
    if (!currentUser || !familyId || !firestore) return;
    const memberRef = doc(firestore, 'families', familyId, 'members', currentUser.id);
    updateDocumentNonBlocking(memberRef, { learning: { ...currentUser.learning, ...learningData } });
    awardPoints(currentUser.id, 50);
  };

  const setAllowance = (childId: string, amount: number) => {
    if (currentUser?.role !== 'Parent' || !familyId || !firestore) return;
    const allowRef = doc(firestore, 'families', familyId, 'allowances', childId);
    setDocumentNonBlocking(allowRef, { total: amount, saved: 0, childId }, { merge: true });
    toast({ title: "Allowance Set", description: `Child will receive ₹${amount} monthly.` });
  };

  const depositToVault = (amount: number) => {
    if (!currentUser || !familyId || !firestore || amount <= 0) return;
    const allowRef = doc(firestore, 'families', familyId, 'allowances', currentUser.id);
    updateDocumentNonBlocking(allowRef, { saved: increment(amount) });
    toast({ title: "Money Deposited!", description: `₹${amount} added to your virtual vault.` });
  };

  const logout = () => signOut(auth).then(() => { setFamilyId(null); setHasAttemptedLookup(false); });

  const isProfileDetermined = hasAttemptedLookup || !!familyId;
  const isGlobalLoading = isAuthLoading || (authUser && !isProfileDetermined) || isSearchingFamily || isFamilyLoading || areUsersLoading;

  const value = { 
    family: familyData ? { ...familyData, id: familyId! } : null,
    users: users || [], currentUser, authUser,
    expenses: expenses || [], goals: goals || [], 
    trustMetric, allowance,
    addExpense, addGoal, contributeToGoal, setMonthlyBudget,
    updatePersonality, updateLearning, setAllowance, depositToVault,
    removeUser: (uid: string) => {},
    loading: isGlobalLoading, 
    updateUserAvatar: (url: string) => {},
    activeConfettiGoal, clearConfetti: () => setActiveConfettiGoal(null),
    logout, refreshFamily: findFamily,
  };

  return <FamilyContext.Provider value={value}>{children}</FamilyContext.Provider>;
}

export function FamilyProvider({ children }: { children: ReactNode }) {
    return <FamilyDataProvider>{children}</FamilyDataProvider>;
}

export function useFamily() {
  const context = useContext(FamilyContext);
  if (context === undefined) throw new Error('useFamily must be used within a FamilyProvider');
  return context;
}
