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
};

export type ExpenseCategory = "Groceries" | "Utilities" | "Transport" | "Entertainment" | "Healthcare" | "Education" | "Other";

export type Expense = {
  id: string;
  category: ExpenseCategory;
  amount: number;
  contributorId: string;
  date: string; // ISO string
  description: string;
};

export type Goal = {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  contributors: string[]; // user ids
  deadline: string; // ISO string
};

export type Badge = {
  id: string;
  name: string;
  icon: LucideIcon;
  description: string;
};

export type Family = {
  id: string;
  name: string;
  familyName: string;
  familyCode: string;
};
