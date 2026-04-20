import { z } from 'zod';

export const expensesFilterSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/).optional()
});

export const expenseSchema = z.object({
  amount: z.number(),
  category: z.string().min(1),
  note: z.string().optional(),
  createdAt: z.unknown().optional()
});
