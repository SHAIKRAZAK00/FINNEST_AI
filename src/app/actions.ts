
"use server";

import { analyzeExpensesAndGenerateInsights, AnalyzeExpensesAndGenerateInsightsInput } from '@/ai/flows/analyze-expenses-and-generate-insights';
import { extractExpenseFromReceipt, ExtractExpenseInput } from '@/ai/flows/extract-expense-from-receipt';
import { analyzeFinancialPersonality, PersonalityAnalysisInput } from '@/ai/flows/personality-analysis-flow';
import { generateMonthlyReport, ReportInput } from '@/ai/flows/generate-monthly-report-flow';
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

export async function runPersonalityAnalysis(input: PersonalityAnalysisInput) {
  try {
    const result = await analyzeFinancialPersonality(input);
    return { success: true, analysis: result };
  } catch (error) {
    console.error('Personality Analysis Error:', error);
    return { success: false, error: 'Failed to analyze personality.' };
  }
}

export async function getMonthlyReport(input: ReportInput) {
  try {
    const result = await generateMonthlyReport(input);
    return { success: true, report: result };
  } catch (error) {
    console.error('Report Error:', error);
    return { success: false, error: 'Failed to generate monthly report.' };
  }
}
