
import type { Badge, ExpenseCategory } from "@/lib/types";
import { Coins, PiggyBank, ReceiptText, ShieldCheck, Target } from "lucide-react";

/**
 * Level thresholds for the FinNest XP system.
 */
export const levelThresholds = [0, 500, 1500, 3000, 5000, 10000];

/**
 * Calculates the current level based on total XP.
 */
export const getLevelFromPoints = (points: number) => {
    const level = levelThresholds.filter(threshold => (points || 0) >= threshold).length;
    return level > 0 ? level : 1;
};

/**
 * Gets the next level threshold for progress tracking.
 */
export const getNextLevelThreshold = (points: number) => {
  return levelThresholds.find(threshold => threshold > (points || 0)) || 10000;
};

/**
 * Calculates percentage progress toward the next level.
 */
export const getLevelProgress = (points: number) => {
  const currentLevel = getLevelFromPoints(points);
  const currentThreshold = levelThresholds[currentLevel - 1] || 0;
  const nextThreshold = getNextLevelThreshold(points);
  
  if (points >= 10000) return 100;
  
  const totalNeeded = nextThreshold - currentThreshold;
  const progress = points - currentThreshold;
  return Math.min(100, Math.max(0, (progress / totalNeeded) * 100));
};

/**
 * Returns the title associated with a level.
 */
export const getLevelTitle = (level: number) => {
  if (level >= 5) return "Financial Master";
  if (level === 4) return "Budget Guardian";
  if (level === 3) return "Optimization Expert";
  if (level === 2) return "Strategist";
  return "Rising Star";
};

export const expenseCategories: ExpenseCategory[] = ["Groceries", "Utilities", "Transport", "Entertainment", "Healthcare", "Education", "Other"];

export const mockBadges: Badge[] = [
  { id: 'badge-1', name: 'Savings Starter', icon: PiggyBank, description: 'Made your first contribution to a goal.' },
  { id: 'badge-2', name: 'Expense Explorer', icon: ReceiptText, description: 'Added 5 expenses.' },
  { id: 'badge-3', name: 'Goal Getter', icon: Target, description: 'Helped complete a family goal.' },
  { id: 'badge-4', name: 'Team Player', icon: Coins, description: 'Contributed to 3 different goals.' },
  { id: 'badge-5', name: 'Financial Fortress', icon: ShieldCheck, description: 'Helped the family reach a ₹10,000 goal.' },
];
