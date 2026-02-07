"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { mockUsers, mockExpenses, mockGoals, mockFamily, mockCurrentUser } from '@/lib/data';
import type { User, Expense, Goal, Family } from '@/lib/types';

interface FamilyContextType {
  family: Family;
  users: User[];
  currentUser: User;
  expenses: Expense[];
  goals: Goal[];
  addExpense: (expense: Omit<Expense, 'id' | 'contributorId' | 'date'>) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'currentAmount' | 'contributors'>) => void;
  contributeToGoal: (goalId: string, amount: number) => void;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export function FamilyProvider({ children }: { children: ReactNode }) {
  const [family, setFamily] = useState<Family>(mockFamily);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User>(mockCurrentUser);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [goals, setGoals] = useState<Goal[]>(mockGoals);

  useEffect(() => {
    // This effect runs only on the client, after initial render, to avoid hydration mismatch.
    const storedFamily = localStorage.getItem('family');
    if (storedFamily) {
        try {
            setFamily(JSON.parse(storedFamily));
        } catch (e) {
            console.error("Failed to parse family from localStorage", e);
        }
    }
    
    const storedUsersRaw = localStorage.getItem('familyUsers');
    let familyUsers: User[] = storedUsersRaw ? JSON.parse(storedUsersRaw) : mockUsers;

    const storedUserRaw = localStorage.getItem('currentUser');
    if (storedUserRaw) {
        try {
            const parsedUser = JSON.parse(storedUserRaw) as User;
            const fullUser = { ...mockCurrentUser, ...parsedUser };
            setCurrentUser(fullUser);

            const userExists = familyUsers.some((u: User) => u.id === fullUser.id || u.email === fullUser.email);
            if (!userExists) {
                familyUsers = [...familyUsers, fullUser];
            }
        } catch (error) {
            console.error("Failed to parse current user from localStorage", error);
        }
    }
    
    setUsers(familyUsers);
    localStorage.setItem('familyUsers', JSON.stringify(familyUsers));

  }, []);

  const addExpense = (expense: Omit<Expense, 'id' | 'contributorId' | 'date'>) => {
    const newExpense = { 
        ...expense, 
        id: `exp-${Date.now()}`,
        contributorId: currentUser.id,
        date: new Date().toISOString()
    };
    setExpenses(prev => [newExpense, ...prev]);
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'currentAmount' | 'contributors'>) => {
    const newGoal = {
        ...goal,
        id: `goal-${Date.now()}`,
        currentAmount: 0,
        contributors: []
    };
    setGoals(prev => [...prev, newGoal]);
  };

  const contributeToGoal = (goalId: string, amount: number) => {
    setGoals(prev => prev.map(goal => {
        if (goal.id === goalId) {
            const newAmount = Math.min(goal.targetAmount, goal.currentAmount + amount);
            const newContributors = goal.contributors.includes(currentUser.id) ? goal.contributors : [...goal.contributors, currentUser.id];
            return { ...goal, currentAmount: newAmount, contributors: newContributors };
        }
        return goal;
    }));
  };

  return (
    <FamilyContext.Provider value={{ family, users, currentUser, expenses, goals, addExpense, addGoal, contributeToGoal }}>
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
