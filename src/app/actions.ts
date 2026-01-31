"use server";

import { analyzeExpensesAndGenerateInsights, AnalyzeExpensesAndGenerateInsightsInput } from '@/ai/flows/analyze-expenses-and-generate-insights';
import { Expense } from '@/lib/types';

export async function getFinancialInsights(expenses: Expense[], familyId: string) {
  try {
    const input: AnalyzeExpensesAndGenerateInsightsInput = {
      expenses: expenses.map(e => ({ 
        amount: e.amount,
        category: e.category,
        contributor: e.contributorId,
        date: e.date,
       })),
      familyId: familyId,
    };
    const result = await analyzeExpensesAndGenerateInsights(input);
    return { success: true, insights: result.insights };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate insights. Please try again later.' };
  }
}
