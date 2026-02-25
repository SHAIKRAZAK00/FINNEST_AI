"use server";

import { analyzeExpensesAndGenerateInsights, AnalyzeExpensesAndGenerateInsightsInput } from '@/ai/flows/analyze-expenses-and-generate-insights';
import { extractExpenseFromReceipt, ExtractExpenseInput } from '@/ai/flows/extract-expense-from-receipt';
import { Expense } from '@/lib/types';

export async function getFinancialInsights(expenses: Expense[], familyId: string, budgetInfo?: { monthlyBudget: number; currentMonthSpent: number }) {
  try {
    const input: AnalyzeExpensesAndGenerateInsightsInput = {
      expenses: expenses.map(e => ({ 
        amount: e.amount,
        category: e.category,
        contributor: e.contributorId,
        date: e.date,
       })),
      familyId: familyId,
      monthlyBudget: budgetInfo?.monthlyBudget,
      currentMonthSpent: budgetInfo?.currentMonthSpent,
    };
    const result = await analyzeExpensesAndGenerateInsights(input);
    return { success: true, insights: result.insights };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate insights. Please try again later.' };
  }
}

export async function getExpenseFromReceipt(receiptImage: string) {
  try {
    const input: ExtractExpenseInput = { receiptImage };
    const result = await extractExpenseFromReceipt(input);
    return { success: true, expense: result };
  } catch (error) {
    console.error('Error extracting expense from receipt:', error);
    return { success: false, error: 'Failed to scan receipt. Please enter details manually.' };
  }
}
