'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing family expenses and generating personalized financial insights.
 *
 * The flow takes in a list of expenses and returns insights and recommendations.
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
  prompt: `You are a Senior Family Financial Advisor. All amounts are in Indian Rupees (₹). 

Your task is to analyze the family's spending habits and provide 3 high-impact, personalized insights.

Budget Summary:
- Monthly Budget: {{#if monthlyBudget}}₹{{monthlyBudget}}{{else}}Not Set{{/if}}
- Total Spent: {{#if currentMonthSpent}}₹{{currentMonthSpent}}{{else}}0{{/if}}

Recent Transactions:
{{#each expenses}}
- {{this.date}}: ₹{{this.amount}} for {{this.category}} (logged by {{this.contributor}})
{{/each}}

Analysis Guidelines:
1. Identify if they are nearing or over their budget.
2. Look for spending patterns (e.g., high costs in specific categories).
3. Provide positive reinforcement if they are doing well.
4. Keep insights professional, direct, and actionable.`,
});

const analyzeExpensesAndGenerateInsightsFlow = ai.defineFlow(
  {
    name: 'analyzeExpensesAndGenerateInsightsFlow',
    inputSchema: AnalyzeExpensesAndGenerateInsightsInputSchema,
    outputSchema: AnalyzeExpensesAndGenerateInsightsOutputSchema,
  },
  async input => {
    const {output} = await analyzeExpensesPrompt(input);
    if (!output) throw new Error('AI failed to generate insights');
    return output;
  }
);
