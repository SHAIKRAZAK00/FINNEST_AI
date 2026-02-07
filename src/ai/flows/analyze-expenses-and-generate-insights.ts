'use server';
/**
 * @fileOverview This file defines a Genkit flow for analyzing family expenses and generating personalized financial insights.
 *
 * The flow takes in a list of expenses and returns insights and recommendations on how to optimize financial habits and prevent overspending.
 *
 * @module ai/flows/analyze-expenses-and-generate-insights
 *
 * @interface AnalyzeExpensesAndGenerateInsightsInput - The input type for the analyzeExpensesAndGenerateInsights function.
 * @interface AnalyzeExpensesAndGenerateInsightsOutput - The output type for the analyzeExpensesAndGenerateInsights function.
 * @function analyzeExpensesAndGenerateInsights - The main function that triggers the expense analysis flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const ExpenseSchema = z.object({
  category: z.string(),
  amount: z.number(),
  contributor: z.string(),
  date: z.string(), // Consider using Zod's date type if you need to perform date-related operations
});

const AnalyzeExpensesAndGenerateInsightsInputSchema = z.object({
  expenses: z.array(ExpenseSchema).describe('A list of family expenses.'),
  familyId: z.string().describe('The ID of the family.'),
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
  prompt: `You are a personal finance advisor. The currency for all amounts is Indian Rupees (₹). Analyze the family's expenses and provide personalized insights and recommendations on how to optimize their financial habits and prevent overspending. Consider potential overspending in certain categories. Be brief and to the point.

Family Expenses (in ₹):
{{#each expenses}}
- Category: {{this.category}}, Amount: ₹{{this.amount}}, Contributor: {{this.contributor}}, Date: {{this.date}}
{{/each}}`,
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
