import { z } from 'zod';

export const applicationStatusSchema = z.enum([
  'pending',
  'reviewed',
  'shortlisted',
  'assigned',
  'rejected'
]);

export const assignApplicationSchema = z.object({
  employeeId: z.string().min(1),
  employeeName: z.string().min(1),
  employeeEmail: z.string().email(),
  note: z.string().optional(),
  startDate: z.string().optional()
});

export const updateApplicationStatusSchema = z.object({
  status: applicationStatusSchema,
  note: z.string().optional()
});
