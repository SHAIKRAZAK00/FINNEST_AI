
'use server';
/**
 * @fileOverview Genkit flow for generating monthly family financial reports.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReportInputSchema = z.object({
  familyName: z.string(),
  month: z.string(),
  totalExpenses: z.number(),
  budget: z.number(),
  topCategory: z.string(),
  memberActivity: z.array(z.object({
    name: z.string(),
    spent: z.number(),
    role: z.string()
  })),
});
export type ReportInput = z.infer<typeof ReportInputSchema>;

const ReportOutputSchema = z.object({
  summary: z.string().describe('A high-level executive summary of the month.'),
  topContributor: z.string().describe('The name of the member who contributed most to goals or discipline.'),
  recommendations: z.array(z.string()).describe('3 actionable items for next month.'),
  grade: z.string().describe('A letter grade (A+ to F) for the family discipline.'),
});
export type ReportOutput = z.infer<typeof ReportOutputSchema>;

export async function generateMonthlyReport(input: ReportInput): Promise<ReportOutput> {
  return reportFlow(input);
}

const reportPrompt = ai.definePrompt({
  name: 'reportPrompt',
  input: {schema: ReportInputSchema},
  output: {schema: ReportOutputSchema},
  prompt: `You are a Senior Family Financial Auditor. Generate a monthly report card for the {{familyName}} family for the month of {{month}}.

Data:
- Total Family Expenses: ₹{{totalExpenses}}
- Allocated Budget: ₹{{budget}}
- Top Spending Category: {{topCategory}}
- Member Breakdown:
{{#each memberActivity}}
  * {{this.name}} ({{this.role}}): Spent ₹{{this.spent}}
{{/each}}

Analyze budget adherence, identify the "Financial MVP", and provide a professional summary with grade.`,
});

const reportFlow = ai.defineFlow(
  {
    name: 'reportFlow',
    inputSchema: ReportInputSchema,
    outputSchema: ReportOutputSchema,
  },
  async input => {
    const {output} = await reportPrompt(input);
    return output!;
  }
);
