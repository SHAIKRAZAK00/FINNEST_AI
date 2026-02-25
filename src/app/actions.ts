"use server";

import { analyzeExpensesAndGenerateInsights, AnalyzeExpensesAndGenerateInsightsInput } from '@/ai/flows/analyze-expenses-and-generate-insights';
import { extractExpenseFromReceipt, ExtractExpenseInput } from '@/ai/flows/extract-expense-from-receipt';
import { analyzeFinancialPersonality, PersonalityAnalysisInput } from '@/ai/flows/personality-analysis-flow';
import { generateMonthlyReport, ReportInput } from '@/ai/flows/generate-monthly-report-flow';
import { Expense } from '@/lib/types';

/**
 * Validates basic input for AI flows to prevent malicious or malformed data processing.
 */
function validateBudgetInfo(info: any) {
    if (!info) return true;
    return typeof info.monthlyBudget === 'number' && info.monthlyBudget >= 0;
}

export async function getFinancialInsights(expenses: Expense[], familyId: string, budgetInfo?: { monthlyBudget: number; currentMonthSpent: number }) {
  if (!validateBudgetInfo(budgetInfo)) {
      return { success: false, error: 'Invalid budget data provided.' };
  }
  
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
  if (!receiptImage.startsWith('data:image/')) {
      return { success: false, error: 'Invalid image format.' };
  }
  
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
  if (!input.name || input.summary.totalSpent < 0) {
      return { success: false, error: 'Incomplete data for analysis.' };
  }
  
  try {
    const result = await analyzeFinancialPersonality(input);
    return { success: true, analysis: result };
  } catch (error) {
    console.error('Personality Analysis Error:', error);
    return { success: false, error: 'Failed to analyze personality.' };
  }
}

export async function getMonthlyReport(input: ReportInput) {
  if (!input.familyName || input.totalExpenses < 0) {
      return { success: false, error: 'Invalid report parameters.' };
  }
  
  try {
    const result = await generateMonthlyReport(input);
    return { success: true, report: result };
  } catch (error) {
    console.error('Report Error:', error);
    return { success: false, error: 'Failed to generate monthly report.' };
  }
}