
import type { LucideIcon } from "lucide-react";

export type UserRole = "Parent" | "Child" | "Viewer";

export type User = {
  id: string;
  familyId: string;
  name: string;
  avatarUrl: string;
  email: string;
  role: UserRole;
  points: number;
  badges: string[];
  financialPersonality?: string;
  personalityLastUpdated?: string;
  learning?: {
    completedQuizzes: string[];
    missionProgress: Record<string, any>;
    unlockedRewards: string[];
  };
};

export type ExpenseCategory = "Groceries" | "Utilities" | "Transport" | "Entertainment" | "Healthcare" | "Education" | "Other";

export type Expense = {
  id: string;
  category: ExpenseCategory;
  amount: number;
  contributorId: string;
  date: string;
  description: string;
};

export type Goal = {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  contributors: string[];
  deadline: string;
};

export type Badge = {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
};

export type Family = {
  id: string;
  familyName: string;
  familyCode: string;
  createdBy: string;
  monthlyBudget?: number;
  currentMonthSpent?: number;
  budgetMonth?: string;
};

export type TrustMetric = {
  id: string;
  overallTrustScore: number;
  contributionScore: number;
  disciplineScore: number;
  updatedAt: string;
};

export type Allowance = {
  id: string;
  total: number;
  saved: number;
  childId: string;
};

export type FinancialReport = {
  id: string;
  monthId: string;
  summary: string;
  topContributor: string;
  data: any;
};
