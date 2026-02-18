'use server';
/**
 * @fileOverview An AI-powered order insight tool that analyzes pending orders to identify frequently ordered combinations
 * and suggest potentially forgotten items based on general ordering patterns.
 *
 * - aiOrderInsightTool - A function that handles the order insight generation process.
 * - AiOrderInsightInput - The input type for the aiOrderInsightTool function.
 * - AiOrderInsightOutput - The return type for the aiOrderInsightTool function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AiOrderInsightInputSchema = z.object({
  pendingOrders: z.array(
    z.object({
      employeeName: z.string().describe('The name of the employee who placed the order.'),
      items: z.array(
        z.object({
          name: z.string().describe('The name of the menu item.'),
          quantity: z.number().int().min(1).describe('The quantity of the menu item.'),
        })
      ).describe('List of items in the employee\'s order.'),
    })
  ).describe('A list of all pending orders for the department.'),
});
export type AiOrderInsightInput = z.infer<typeof AiOrderInsightInputSchema>;

const AiOrderInsightOutputSchema = z.object({
  frequentlyOrderedCombinations: z.array(
    z.object({
      items: z.array(z.string()).describe('A list of item names that frequently appear together.'),
      frequency: z.number().int().min(1).describe('How often this combination appears in pending orders.'),
    })
  ).describe('Insights into common item combinations found in current orders.'),
  suggestedForgottenItems: z.array(
    z.object({
      employeeName: z.string().describe('The name of the employee.'),
      suggestedItems: z.array(z.string()).describe('Items potentially forgotten by this employee based on typical orders.'),
      reason: z.string().describe('The reason for suggesting these items (e.g., "usually orders a drink with this meal").'),
    })
  ).describe('Suggestions for items that employees might have forgotten, based on patterns.'),
});
export type AiOrderInsightOutput = z.infer<typeof AiOrderInsightOutputSchema>;

export async function aiOrderInsightTool(input: AiOrderInsightInput): Promise<AiOrderInsightOutput> {
  return aiOrderInsightFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiOrderInsightPrompt',
  input: {schema: AiOrderInsightInputSchema},
  output: {schema: AiOrderInsightOutputSchema},
  prompt: `You are an AI-powered order insight tool for a department supervisor. Your task is to analyze a list of pending food orders and provide valuable insights to help create more comprehensive and accurate order summaries.

Specifically, you need to:
1.  Identify frequently ordered combinations of items across all pending orders.
2.  Suggest potentially forgotten items for individual employees, based on common food ordering patterns (e.g., pairing a drink with a sandwich, or an add-on).

Here are the pending orders in JSON format:

{{{JSON.stringify pendingOrders}}}
`,
});

const aiOrderInsightFlow = ai.defineFlow(
  {
    name: 'aiOrderInsightFlow',
    inputSchema: AiOrderInsightInputSchema,
    outputSchema: AiOrderInsightOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
