import type { User, Expense, Goal, Badge, Family, ExpenseCategory } from "@/lib/types";
import { Coins, PiggyBank, ReceiptText, ShieldCheck, Target } from "lucide-react";

export const mockFamily: Family = {
    id: 'family-1',
    name: 'The Johnsons',
    familyName: 'Johnson Family',
    familyCode: 'JHN-2024'
}

export const levelThresholds = [0, 500, 1500, 3000, 5000, 10000];
export const getLevelFromPoints = (points: number) => {
    const level = levelThresholds.filter(threshold => points >= threshold).length;
    return level > 0 ? level : 1;
};

export const mockUsers: User[] = [
  { id: 'user-1', familyId: 'family-1', name: 'Alex Johnson', avatarUrl: 'https://picsum.photos/seed/avatar1/200/200', email: 'alex@example.com', role: 'Parent', points: 1250, badges: ['badge-1'] },
  { id: 'user-2', familyId: 'family-1', name: 'Maya Johnson', avatarUrl: 'https://picsum.photos/seed/avatar2/200/200', email: 'maya@example.com', role: 'Parent', points: 1500, badges: ['badge-1', 'badge-3'] },
  { id: 'user-3', familyId: 'family-1', name: 'Leo Johnson', avatarUrl: 'https://picsum.photos/seed/avatar3/200/200', email: 'leo@example.com', role: 'Child', points: 800, badges: ['badge-1'] },
  { id: 'user-4', familyId: 'family-1', name: 'Grandma Rose', avatarUrl: 'https://picsum.photos/seed/avatar4/200/200', email: 'rose@example.com', role: 'Viewer', points: 300, badges: [] },
];

export const mockCurrentUser = mockUsers[0];

const today = new Date();
const getDate = (daysAgo: number) => new Date(today.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString();

export const mockExpenses: Expense[] = [
  { id: 'exp-1', category: 'Groceries', amount: 150.75, contributorId: 'user-2', date: getDate(2), description: 'Weekly groceries' },
  { id: 'exp-2', category: 'Utilities', amount: 85.00, contributorId: 'user-1', date: getDate(5), description: 'Electricity bill' },
  { id: 'exp-3', category: 'Entertainment', amount: 45.50, contributorId: 'user-2', date: getDate(1), description: 'Movie tickets' },
  { id: 'exp-4', category: 'Transport', amount: 30.00, contributorId: 'user-1', date: getDate(3), description: 'Gasoline' },
  { id: 'exp-5', category: 'Healthcare', amount: 60.00, contributorId: 'user-2', date: getDate(10), description: 'Pharmacy' },
  { id: 'exp-6', category: 'Groceries', amount: 75.20, contributorId: 'user-1', date: getDate(8), description: 'Mid-week top-up' },
  { id: 'exp-7', category: 'Education', amount: 250.00, contributorId: 'user-1', date: getDate(15), description: "Leo's tuition" },
  { id: 'exp-8', category: 'Other', amount: 25.00, contributorId: 'user-3', date: getDate(4), description: 'New comic book' },
  { id: 'exp-9', category: 'Entertainment', amount: 120.00, contributorId: 'user-2', date: getDate(6), description: 'Family dinner out' },
  { id: 'exp-10', category: 'Utilities', amount: 55.00, contributorId: 'user-1', date: getDate(18), description: 'Internet bill' },
];

export const expenseCategories: ExpenseCategory[] = ["Groceries", "Utilities", "Transport", "Entertainment", "Healthcare", "Education", "Other"];

export const mockGoals: Goal[] = [
  { id: 'goal-1', name: 'Summer Vacation Fund', description: 'Saving for a family trip to the beach.', targetAmount: 2000, currentAmount: 1250, contributors: ['user-1', 'user-2'], deadline: new Date(today.getFullYear(), 7, 15).toISOString() },
  { id: 'goal-2', name: 'New Family Car', description: 'Down payment for a new, safer car.', targetAmount: 5000, currentAmount: 1800, contributors: ['user-1', 'user-2'], deadline: new Date(today.getFullYear() + 1, 2, 1).toISOString() },
  { id: 'goal-3', name: 'Leo\'s New Laptop', description: 'For school and creative projects.', targetAmount: 800, currentAmount: 800, contributors: ['user-1', 'user-2', 'user-3'], deadline: new Date(today.getFullYear(), 4, 20).toISOString() },
  { id: 'goal-4', name: 'Emergency Fund', description: 'Building a safety net for unexpected events.', targetAmount: 10000, currentAmount: 4500, contributors: ['user-1', 'user-2'], deadline: new Date(today.getFullYear() + 2, 11, 31).toISOString() },
];

export const mockBadges: Badge[] = [
  { id: 'badge-1', name: 'Savings Starter', icon: PiggyBank, description: 'Made your first contribution to a goal.' },
  { id: 'badge-2', name: 'Expense Explorer', icon: ReceiptText, description: 'Added 5 expenses.' },
  { id: 'badge-3', name: 'Goal Getter', icon: Target, description: 'Helped complete a family goal.' },
  { id: 'badge-4', name: 'Team Player', icon: Coins, description: 'Contributed to 3 different goals.' },
  { id: 'badge-5', name: 'Financial Fortress', icon: ShieldCheck, description: 'Helped the family reach a ₹10,000 goal.' },
];
