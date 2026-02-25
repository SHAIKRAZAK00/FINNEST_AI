
'use server';
/**
 * @fileOverview Genkit flow for analyzing user's financial personality.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SpendingSummarySchema = z.object({
  categoryDistribution: z.record(z.number()),
  totalSpent: z.number(),
  goalContributions: z.number(),
  budgetUsagePercentage: z.number(),
});

const PersonalityAnalysisInputSchema = z.object({
  name: z.string(),
  summary: SpendingSummarySchema,
});
export type PersonalityAnalysisInput = z.infer<typeof PersonalityAnalysisInputSchema>;

const PersonalityAnalysisOutputSchema = z.object({
  personality: z.enum([
    'Impulse Spender',
    'Strategic Saver',
    'Budget Optimizer',
    'Experience Spender',
    'Conservative Planner'
  ]),
  description: z.string(),
  advice: z.string(),
});
export type PersonalityAnalysisOutput = z.infer<typeof PersonalityAnalysisOutputSchema>;

export async function analyzeFinancialPersonality(input: PersonalityAnalysisInput): Promise<PersonalityAnalysisOutput> {
  return personalityAnalysisFlow(input);
}

const personalityPrompt = ai.definePrompt({
  name: 'personalityPrompt',
  input: {schema: PersonalityAnalysisInputSchema},
  output: {schema: PersonalityAnalysisOutputSchema},
  prompt: `You are a behavioral financial psychologist. Analyze the spending habits of {{name}} and determine their financial personality.

Spending Data:
- Total Spent: ₹{{summary.totalSpent}}
- Goal Contributions: ₹{{summary.goalContributions}}
- Budget Usage: {{summary.budgetUsagePercentage}}%
- Category Breakdown: {{summary.categoryDistribution}}

Personalities:
- Impulse Spender: High "Entertainment/Other" spending, low goal contributions.
- Strategic Saver: High goal contributions, disciplined budget usage.
- Budget Optimizer: Spends close to budget but rarely over, focus on "Utilities/Groceries".
- Experience Spender: High spending on "Entertainment/Transport", medium goals.
- Conservative Planner: Very low "Other" spending, consistent and slow goal progress.

Provide a personality classification, a brief description of their behavior, and one piece of expert advice.`,
});

const personalityAnalysisFlow = ai.defineFlow(
  {
    name: 'personalityAnalysisFlow',
    inputSchema: PersonalityAnalysisInputSchema,
    outputSchema: PersonalityAnalysisOutputSchema,
  },
  async input => {
    const {output} = await personalityPrompt(input);
    return output!;
  }
);
