
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { User, Expense, Goal, Family, TrustMetric, Allowance } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { collection, doc, getDoc, increment, runTransaction, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { format } from 'date-fns';
import { Language, translations } from '@/lib/translations';
import { sanitizeInput, validateAmount, isDuplicateExpense, isDuplicateGoal } from '@/lib/validation';

interface FamilyContextType {
  family: Family | null;
  users: User[];
  currentUser: User | null;
  authUser: FirebaseUser | null;
  expenses: Expense[];
  goals: Goal[];
  trustMetric: TrustMetric | null;
  allowance: Allowance | null;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  t: any;
  addExpense: (expense: Omit<Expense, 'id' | 'contributorId' | 'date' | 'familyId'>) => Promise<boolean>;
  deleteExpense: (expenseId: string) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount' | 'contributors' | 'familyId'>) => Promise<void>;
  contributeToGoal: (goalId: string, amount: number) => Promise<{ goalCompleted: boolean; success: boolean }>;
  setMonthlyBudget: (amount: number) => void;
  removeUser: (userId: string) => void;
  updateUserAvatar: (avatarUrl: string) => void;
  updatePersonality: (personality: string) => void;
  updateLearning: (learningData: Partial<User['learning']>) => void;
  setAllowance: (childId: string, amount: number) => void;
  depositToVault: (amount: number) => void;
  loading: boolean;
  hasAttemptedLookup: boolean;
  activeConfettiGoal: string | null;
  clearConfetti: () => void;
  logout: () => void;
  refreshFamily: (forcedId?: string) => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

const LS_FAMILY_KEY = 'finnest_last_family_id';
const LS_THEME_KEY = 'finnest_app_theme';

/**
 * @fileOverview FamilyProvider - The Application Brain
 * 
 * Handles real-time synchronization with Firestore and centralized business logic.
 * Every UI component consumes data from this provider.
 */
function FamilyDataProvider({ children }: { children: ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const [familyId, setFamilyId] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem(LS_FAMILY_KEY);
    }
    return null;
  });
  const [isSearchingFamily, setIsSearchingFamily] = useState(false);
  const [hasAttemptedLookup, setHasAttemptedLookup] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeConfettiGoal, setActiveConfettiGoal] = useState<string | null>(null);
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('app_language') as Language;
        return saved || 'en';
    }
    return 'en';
  });
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(LS_THEME_KEY) as 'light' | 'dark';
        return saved || 'dark';
    }
    return 'dark';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') localStorage.setItem('app_language', lang);
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') localStorage.setItem(LS_THEME_KEY, newTheme);
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const t = translations[language];

  const findFamily = useCallback(async (forcedId?: string) => {
    if (forcedId) {
      setFamilyId(forcedId);
      localStorage.setItem(LS_FAMILY_KEY, forcedId);
      setHasAttemptedLookup(true);
      return;
    }
    if (!authUser || !firestore) {
      if (!isAuthLoading && !authUser) setHasAttemptedLookup(true);
      return;
    }
    
    setIsSearchingFamily(true);
    try {
      const userRef = doc(firestore, 'users', authUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        if (data.familyId) {
          setFamilyId(data.familyId);
          localStorage.setItem(LS_FAMILY_KEY, data.familyId);
        }
      } else {
        setFamilyId(null);
        localStorage.removeItem(LS_FAMILY_KEY);
      }
    } catch (err: any) {
      setFamilyId(null);
    } finally {
      setIsSearchingFamily(false);
      setHasAttemptedLookup(true);
    }
  }, [authUser, firestore, isAuthLoading]);

  useEffect(() => {
    if (!isAuthLoading && !authUser) {
      setFamilyId(null);
      setCurrentUser(null);
      setHasAttemptedLookup(true);
      setIsSearchingFamily(false);
      localStorage.removeItem(LS_FAMILY_KEY);
      return;
    }
    if (authUser && firestore && !hasAttemptedLookup && !isSearchingFamily) {
      findFamily();
    }
  }, [authUser, firestore, isAuthLoading, hasAttemptedLookup, isSearchingFamily, findFamily]);
  
  const familyRef = useMemoFirebase(() => familyId ? doc(firestore, 'families', familyId) : null, [firestore, familyId]);
  const { data: familyData } = useDoc<Family>(familyRef);

  const membersRef = useMemoFirebase(() => familyId ? collection(firestore, 'families', familyId, 'members') : null, [firestore, familyId]);
  const { data: users } = useCollection<User>(membersRef);

  const expensesRef = useMemoFirebase(() => familyId ? collection(firestore, 'families', familyId, 'expenses') : null, [firestore, familyId]);
  const { data: expenses } = useCollection<Expense>(expensesRef);

  const goalsRef = useMemoFirebase(() => familyId ? collection(firestore, 'families', familyId, 'goals') : null, [firestore, familyId]);
  const { data: goals } = useCollection<Goal>(goalsRef);
  
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
      }
    }
  }, [users, authUser]);

  const awardPoints = useCallback(async (userId: string, pts: number) => {
    if (!familyId || !firestore) return;
    const memberRef = doc(firestore, 'families', familyId, 'members', userId);
    updateDoc(memberRef, { points: increment(pts) }).catch(() => {});
  }, [familyId, firestore]);

  const addExpense = async (expense: Omit<Expense, 'id' | 'contributorId' | 'date' | 'familyId'>): Promise<boolean> => {
    if (!currentUser || !familyId || !firestore) return false;

    const valResult = validateAmount(expense.amount);
    if (!valResult.isValid) {
      toast({ variant: "destructive", title: "Invalid Input", description: valResult.message });
      return false;
    }

    const cleanDesc = sanitizeInput(expense.description);

    const isDup = await isDuplicateExpense(firestore, familyId, currentUser.id, expense.amount, expense.category, cleanDesc);
    if (isDup) {
      toast({ variant: "destructive", title: "Duplicate entry detected", description: "You already logged this identical expense." });
      return false;
    }

    const familyDocRef = doc(firestore, 'families', familyId);
    const expensesColRef = collection(firestore, 'families', familyId, 'expenses');
    const expenseDocRef = doc(expensesColRef);
    const newExpense = { 
      ...expense, 
      description: cleanDesc,
      id: expenseDocRef.id, 
      familyId, 
      contributorId: currentUser.id, 
      date: new Date().toISOString() 
    };

    try {
      await runTransaction(firestore, async (tx) => {
        const famSnap = await tx.get(familyDocRef);
        const data = famSnap.data() as Family;
        tx.set(expenseDocRef, newExpense);
        tx.update(familyDocRef, { currentMonthSpent: (data.currentMonthSpent || 0) + expense.amount });
      });
      awardPoints(currentUser.id, 10);
      toast({ title: "Expense Added", description: "Ledger synchronized successfully." });
      return true;
    } catch (e) { 
      toast({ variant: "destructive", title: "Sync Error", description: "Database rejected the transaction." });
      return false;
    }
  };

  const deleteExpense = async (expenseId: string) => {
    if (!currentUser || !familyId || !firestore) return;
    
    const expense = expenses?.find(e => e.id === expenseId);
    if (!expense) return;

    // Authorization: Only creator or Parent can delete
    if (expense.contributorId !== currentUser.id && currentUser.role !== 'Parent') {
        toast({ variant: "destructive", title: "Permission Denied", description: "You cannot delete this expense." });
        return;
    }

    const familyDocRef = doc(firestore, 'families', familyId);
    const expenseDocRef = doc(firestore, 'families', familyId, 'expenses', expenseId);

    try {
        await runTransaction(firestore, async (tx) => {
            const famSnap = await tx.get(familyDocRef);
            const famData = famSnap.data() as Family;
            tx.delete(expenseDocRef);
            tx.update(familyDocRef, { 
                currentMonthSpent: Math.max(0, (famData.currentMonthSpent || 0) - expense.amount) 
            });
        });
        toast({ title: "Expense Deleted", description: "Budget balance restored." });
    } catch (e) {
        toast({ variant: "destructive", title: "Delete Error", description: "Could not remove the expense." });
    }
  };

  const setMonthlyBudget = (amount: number) => {
    if (!currentUser || currentUser.role !== 'Parent' || !familyId || !firestore) return;
    
    const valResult = validateAmount(amount);
    if (!valResult.isValid) {
      toast({ variant: "destructive", title: "Invalid Input", description: valResult.message });
      return;
    }

    const familyDocRef = doc(firestore, 'families', familyId);
    updateDoc(familyDocRef, { monthlyBudget: increment(amount), budgetMonth: format(new Date(), 'yyyy-MM') }).catch(() => {});
    toast({ title: "Budget Protocol Updated" });
  };

  const addGoal = async (goal: Omit<Goal, 'id' | 'currentAmount' | 'contributors' | 'familyId'>) => {
    if (!currentUser || (currentUser.role !== 'Parent' && currentUser.role !== 'Child') || !familyId || !firestore) return;

    const valResult = validateAmount(goal.targetAmount);
    if (!valResult.isValid) {
      toast({ variant: "destructive", title: "Invalid Input", description: valResult.message });
      return;
    }

    const cleanName = sanitizeInput(goal.name);
    const cleanDesc = sanitizeInput(goal.description);

    const isDup = await isDuplicateGoal(firestore, familyId, cleanName, goal.targetAmount);
    if (isDup) {
      toast({ variant: "destructive", title: "Duplicate detected", description: "A similar goal exists." });
      return;
    }

    const goalDocRef = doc(collection(firestore, 'families', familyId, 'goals'));
    setDoc(goalDocRef, { 
      ...goal, 
      name: cleanName,
      description: cleanDesc,
      id: goalDocRef.id, 
      familyId, 
      currentAmount: 0, 
      contributors: [] 
    }).catch(() => {});
    
    awardPoints(currentUser.id, 50);
    toast({ title: "Goal Set", description: "Synchronized with all family members." });
  };

  const contributeToGoal = async (goalId: string, amount: number) => {
    if (!currentUser || !familyId || !firestore) return { goalCompleted: false, success: false };
    
    const valResult = validateAmount(amount);
    if (!valResult.isValid) {
      toast({ variant: "destructive", title: "Invalid Input", description: valResult.message });
      return { goalCompleted: false, success: false };
    }

    const goalRef = doc(firestore, 'families', familyId, 'goals', goalId);
    try {
      const result = await runTransaction(firestore, async (tx) => {
        const goalSnap = await tx.get(goalRef);
        const goalData = goalSnap.data() as Goal;
        const newAmount = Math.min(goalData.targetAmount, goalData.currentAmount + amount);
        const isCompleted = newAmount >= goalData.targetAmount;
        const newContributors = goalData.contributors.includes(currentUser.id) 
          ? goalData.contributors 
          : [...goalData.contributors, currentUser.id];

        tx.update(goalRef, { currentAmount: newAmount, contributors: newContributors });
        return { isCompleted };
      });
      awardPoints(currentUser.id, 25);
      if (result.isCompleted) setActiveConfettiGoal(goalId);
      toast({ title: "Contribution Logged", description: "Well done!" });
      return { goalCompleted: result.isCompleted, success: true };
    } catch (e) {
      return { goalCompleted: false, success: false };
    }
  };

  const removeUser = (userId: string) => {
    if (!currentUser || currentUser.role !== 'Parent' || !familyId || !firestore) return;
    const memberRef = doc(firestore, 'families', familyId, 'members', userId);
    setDoc(memberRef, {}, { merge: true }).catch(() => {});
  };

  const updateUserAvatar = (avatarUrl: string) => {
    if (!currentUser || !familyId || !firestore) return;
    const memberRef = doc(firestore, 'families', familyId, 'members', currentUser.id);
    updateDoc(memberRef, { avatarUrl }).catch(() => {});
    const userRef = doc(firestore, 'users', currentUser.id);
    updateDoc(userRef, { avatarUrl }).catch(() => {});
  };

  const updatePersonality = (personality: string) => {
    if (!currentUser || !familyId || !firestore) return;
    const memberRef = doc(firestore, 'families', familyId, 'members', currentUser.id);
    updateDoc(memberRef, { financialPersonality: personality, personalityLastUpdated: new Date().toISOString() }).catch(() => {});
    awardPoints(currentUser.id, 100);
  };

  const updateLearning = (learningData: Partial<User['learning']>) => {
    if (!currentUser || !familyId || !firestore) return;
    const memberRef = doc(firestore, 'families', familyId, 'members', currentUser.id);
    updateDoc(memberRef, { learning: { ...currentUser.learning, ...learningData } }).catch(() => {});
    awardPoints(currentUser.id, 50);
  };

  const setAllowance = (childId: string, amount: number) => {
    if (currentUser?.role !== 'Parent' || !familyId || !firestore) return;
    if (amount < 0) return;
    const allowRef = doc(firestore, 'families', familyId, 'allowances', childId);
    setDoc(allowRef, { total: amount, saved: 0, childId }, { merge: true }).catch(() => {});
    toast({ title: "Allowance Set" });
  };

  const depositToVault = (amount: number) => {
    if (!currentUser || !familyId || !firestore || amount <= 0) return;
    const allowRef = doc(firestore, 'families', familyId, 'allowances', currentUser.id);
    setDoc(allowRef, { saved: increment(amount), childId: currentUser.id }, { merge: true }).catch(() => {});
    toast({ title: "Vault Secured", description: "Savings logged in protocol." });
  };

  const logout = () => {
    localStorage.removeItem(LS_FAMILY_KEY);
    setFamilyId(null);
    setCurrentUser(null);
    setHasAttemptedLookup(true);
    signOut(auth).catch(() => {});
  };

  const isGlobalLoading = isAuthLoading;

  const value = { 
    family: familyData ? { ...familyData, id: familyId! } : null,
    users: users || [], currentUser, authUser,
    expenses: expenses || [], goals: goals || [], 
    trustMetric, allowance, language, setLanguage,
    theme, setTheme,
    t,
    addExpense, deleteExpense, addGoal, contributeToGoal, setMonthlyBudget,
    updatePersonality, updateLearning, setAllowance, depositToVault,
    removeUser, updateUserAvatar,
    loading: isGlobalLoading, 
    hasAttemptedLookup,
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
