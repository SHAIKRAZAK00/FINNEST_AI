"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User, Expense, Goal, Family } from '@/lib/types';

interface FamilyContextType {
  family: Family | null;
  users: User[];
  currentUser: User | null;
  expenses: Expense[];
  goals: Goal[];
  addExpense: (expense: Omit<Expense, 'id' | 'contributorId' | 'date'>) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount' | 'contributors'>) => void;
  contributeToGoal: (goalId: string, amount: number) => void;
  removeUser: (userId: string) => void;
  updateUserAvatar: (avatarUrl: string) => void;
  loading: boolean;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [family, setFamily] = useState<Family | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedFamily = localStorage.getItem('family');
      const storedUsers = localStorage.getItem('familyUsers');
      const storedCurrentUser = localStorage.getItem('currentUser');
      const storedExpenses = localStorage.getItem('familyExpenses');
      const storedGoals = localStorage.getItem('familyGoals');

      const loadedFamily = storedFamily ? JSON.parse(storedFamily) : null;
      const loadedUsers = storedUsers ? JSON.parse(storedUsers) : [];
      const loadedCurrentUser = storedCurrentUser ? JSON.parse(storedCurrentUser) : null;
      
      setFamily(loadedFamily);
      setUsers(loadedUsers);
      
      if (loadedCurrentUser) {
          const fullUser = loadedUsers.find((u: User) => u.id === loadedCurrentUser.id) || loadedCurrentUser;
          setCurrentUser(fullUser);
      }

      setExpenses(storedExpenses ? JSON.parse(storedExpenses) : []);
      setGoals(storedGoals ? JSON.parse(storedGoals) : []);
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
    } finally {
        setLoading(false);
    }
  }, []);

  const awardPoints = (points: number) => {
    if (!currentUser) return;
    const updatedUsers = users.map(u => 
      u.id === currentUser.id ? { ...u, points: u.points + points } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('familyUsers', JSON.stringify(updatedUsers));

    const updatedCurrentUser = { ...currentUser, points: currentUser.points + points };
    setCurrentUser(updatedCurrentUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
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
    awardPoints(10);
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'currentAmount' | 'contributors'>) => {
    if (!currentUser) return;
    const newGoal: Goal = {
        ...goal,
        id: `goal-${Date.now()}`,
        currentAmount: 0,
        contributors: []
    };
    const updatedGoals = [...goals, newGoal];
    setGoals(updatedGoals);
    localStorage.setItem('familyGoals', JSON.stringify(updatedGoals));
    awardPoints(50);
  };

  const contributeToGoal = (goalId: string, amount: number) => {
    if (!currentUser) return;
    const updatedGoals = goals.map(goal => {
        if (goal.id === goalId) {
            const newAmount = Math.min(goal.targetAmount, goal.currentAmount + amount);
            const newContributors = goal.contributors.includes(currentUser.id) ? goal.contributors : [...goal.contributors, currentUser.id];
            return { ...goal, currentAmount: newAmount, contributors: newContributors };
        }
        return goal;
    });
    setGoals(updatedGoals);
    localStorage.setItem('familyGoals', JSON.stringify(updatedGoals));
    awardPoints(25);
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

  const value = { family, users, currentUser, expenses, goals, addExpense, addGoal, contributeToGoal, removeUser, loading, updateUserAvatar };

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
