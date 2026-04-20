import { z } from 'zod';

export const employeeStatusSchema = z.enum(['active', 'banned']);

export const banEmployeeSchema = z.object({
  reason: z.string().min(5)
});

export const employeesFilterSchema = z.object({
  status: employeeStatusSchema.optional(),
  q: z.string().optional()
});
