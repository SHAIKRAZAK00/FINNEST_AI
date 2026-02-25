'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing family expenses and generating personalized financial insights.
 *
 * The flow takes in a list of expenses and returns insights and recommendations on how to optimize financial habits and prevent overspending.
 *
 * @module ai/flows/analyze-expenses-and-generate-insights
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExpenseSchema = z.object({
  category: z.string(),
  amount: z.number(),
  contributor: z.string(),
  date: z.string(),
});

const AnalyzeExpensesAndGenerateInsightsInputSchema = z.object({
  expenses: z.array(ExpenseSchema).describe('A list of family expenses.'),
  familyId: z.string().describe('The ID of the family.'),
  monthlyBudget: z.number().optional().describe('The family monthly budget.'),
  currentMonthSpent: z.number().optional().describe('Amount spent this month.'),
});
export type AnalyzeExpensesAndGenerateInsightsInput = z.infer<typeof AnalyzeExpensesAndGenerateInsightsInputSchema>;

const InsightSchema = z.object({
  insight: z.string().describe('A financial insight or recommendation.'),
});

const AnalyzeExpensesAndGenerateInsightsOutputSchema = z.object({
  insights: z.array(InsightSchema).describe('A list of financial insights and recommendations.'),
});
export type AnalyzeExpensesAndGenerateInsightsOutput = z.infer<typeof AnalyzeExpensesAndGenerateInsightsOutputSchema>;

export async function analyzeExpensesAndGenerateInsights(input: AnalyzeExpensesAndGenerateInsightsInput): Promise<AnalyzeExpensesAndGenerateInsightsOutput> {
  return analyzeExpensesAndGenerateInsightsFlow(input);
}

const analyzeExpensesPrompt = ai.definePrompt({
  name: 'analyzeExpensesPrompt',
  input: {schema: AnalyzeExpensesAndGenerateInsightsInputSchema},
  output: {schema: AnalyzeExpensesAndGenerateInsightsOutputSchema},
  prompt: `You are a personal finance advisor. The currency for all amounts is Indian Rupees (₹). Analyze the family's expenses and provide personalized insights.

Consider their budget status:
{{#if monthlyBudget}}
- Monthly Budget: ₹{{monthlyBudget}}
- Spent So Far This Month: ₹{{currentMonthSpent}}
{{#if (gt currentMonthSpent (mult monthlyBudget 0.7))}}
- Alert: They have used more than 70% of their budget.
{{/if}}
{{else}}
- Note: They haven't set a monthly budget yet. Suggest setting one.
{{/if}}

Family Expenses (in ₹):
{{#each expenses}}
- Category: {{this.category}}, Amount: ₹{{this.amount}}, Contributor: {{this.contributor}}, Date: {{this.date}}
{{/each}}

Provide 3 brief, high-impact insights. If they are over budget or close to it, prioritize warnings. If they are doing well, provide positive reinforcement.`,
});

const analyzeExpensesAndGenerateInsightsFlow = ai.defineFlow(
  {
    name: 'analyzeExpensesAndGenerateInsightsFlow',
    inputSchema: AnalyzeExpensesAndGenerateInsightsInputSchema,
    outputSchema: AnalyzeExpensesAndGenerateInsightsOutputSchema,
  },
  async input => {
    const {output} = await analyzeExpensesPrompt(input);
    return output!;
  }
);
