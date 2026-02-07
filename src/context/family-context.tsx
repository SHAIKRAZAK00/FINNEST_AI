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
  const [family] = useState<Family>(mockFamily);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [currentUser, setCurrentUser] = useState<User>(mockCurrentUser);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [goals, setGoals] = useState<Goal[]>(mockGoals);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        
        const fullUser: User = {
          ...mockCurrentUser, 
          ...parsedUser,
        };
        setCurrentUser(fullUser);
        
        // Add new user to the list of users if they don't exist
        if (!users.find(u => u.id === fullUser.id) && !mockUsers.find(u => u.email === fullUser.email)) {
          setUsers(prev => [...prev, fullUser]);
        }

      } catch (error) {
        console.error("Failed to parse current user from localStorage", error);
        setCurrentUser(mockCurrentUser);
      }
    }
  }, []);

  const addExpense = (expense: Omit<Expense, 'id' | 'contributorId' | 'date'>) => {
    setExpenses(prev => [{ 
        ...expense, 
        id: `exp-${Date.now()}`,
        contributorId: currentUser.id,
        date: new Date().toISOString()
    }, ...prev]);
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'currentAmount' | 'contributors'>) => {
    setGoals(prev => [...prev, {
        ...goal,
        id: `goal-${Date.now()}`,
        currentAmount: 0,
        contributors: []
    }]);
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
