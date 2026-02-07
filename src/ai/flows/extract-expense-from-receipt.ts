'use server';
/**
 * @fileOverview A Genkit flow for extracting expense details from a receipt image.
 *
 * This flow uses a generative model to perform OCR on a receipt image and extract
 * the expense description, amount, and category.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractExpenseInputSchema = z.object({
  receiptImage: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractExpenseInput = z.infer<typeof ExtractExpenseInputSchema>;

const ExtractExpenseOutputSchema = z.object({
    description: z.string().describe("The most likely item or service purchased from the receipt. Be concise, e.g., 'Groceries from Walmart' or 'Dinner at The Grand'. If you can't determine it, leave it empty."),
    amount: z.number().describe("The total amount of the expense. Look for a 'Total' or 'Amount Due' field. If you can't find it, extract the largest number that looks like a price."),
    category: z.enum(["Groceries", "Utilities", "Transport", "Entertainment", "Healthcare", "Education", "Other"]).describe("Categorize the expense based on the items or store name on the receipt. If unsure, default to 'Other'."),
});
export type ExtractExpenseOutput = z.infer<typeof ExtractExpenseOutputSchema>;


export async function extractExpenseFromReceipt(input: ExtractExpenseInput): Promise<ExtractExpenseOutput> {
    return extractExpenseFlow(input);
}


const extractExpensePrompt = ai.definePrompt({
  name: 'extractExpensePrompt',
  input: {schema: ExtractExpenseInputSchema},
  output: {schema: ExtractExpenseOutputSchema},
  prompt: `You are an expert receipt scanner. The currency is Indian Rupees (₹). Analyze the provided receipt image and extract the following information: a brief description of the expense, the total amount, and the most appropriate category.

Categories to choose from: "Groceries", "Utilities", "Transport", "Entertainment", "Healthcare", "Education", "Other".

Receipt Image:
{{media url=receiptImage}}
`,
});

const extractExpenseFlow = ai.defineFlow(
  {
    name: 'extractExpenseFlow',
    inputSchema: ExtractExpenseInputSchema,
    outputSchema: ExtractExpenseOutputSchema,
  },
  async input => {
    const {output} = await extractExpensePrompt(input);
    return output!;
  }
);
