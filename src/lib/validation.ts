
import { collection, query, where, getDocs, Firestore } from 'firebase/firestore';

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

/**
 * Sanitizes input strings by trimming whitespace.
 */
export const sanitizeInput = (str: string): string => {
  return str ? str.trim() : '';
};

/**
 * Normalizes category names for consistent comparison.
 */
export const normalizeCategory = (category: string): string => {
  return category ? category.trim().toLowerCase() : '';
};

/**
 * Validates that an amount is strictly positive.
 */
export const validateAmount = (amount: number): ValidationResult => {
  if (amount <= 0) {
    return { isValid: false, message: "Amount must be greater than zero" };
  }
  return { isValid: true };
};

/**
 * Checks for duplicate expenses in Firestore.
 * Criteria: same contributor + same amount + same category + same description.
 */
export async function isDuplicateExpense(
  db: Firestore,
  familyId: string,
  userId: string,
  amount: number,
  category: string,
  description: string
): Promise<boolean> {
  const expensesRef = collection(db, 'families', familyId, 'expenses');
  const q = query(
    expensesRef,
    where('contributorId', '==', userId),
    where('amount', '==', amount),
    where('category', '==', category),
    where('description', '==', description)
  );
  
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}

/**
 * Checks for duplicate goals in Firestore.
 * Criteria: same goal name OR same goal target amount.
 */
export async function isDuplicateGoal(
  db: Firestore,
  familyId: string,
  name: string,
  amount: number
): Promise<boolean> {
  const goalsRef = collection(db, 'families', familyId, 'goals');
  
  const nameQuery = query(goalsRef, where('name', '==', name));
  const amountQuery = query(goalsRef, where('targetAmount', '==', amount));
  
  const [nameSnap, amountSnap] = await Promise.all([
    getDocs(nameQuery),
    getDocs(amountQuery)
  ]);
  
  return !nameSnap.empty || !amountSnap.empty;
}
