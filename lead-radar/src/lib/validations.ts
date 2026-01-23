import { z } from 'zod';

export const scrapeParamsSchema = z.object({
  city: z
    .string()
    .min(2, 'La ciudad debe tener al menos 2 caracteres')
    .max(100, 'La ciudad no puede tener más de 100 caracteres'),
  category: z
    .string()
    .min(2, 'La categoría debe tener al menos 2 caracteres')
    .max(100, 'La categoría no puede tener más de 100 caracteres'),
  limit: z
    .number()
    .int()
    .min(1, 'El límite debe ser al menos 1')
    .max(100, 'El límite máximo es 100'),
});

export const leadStatusSchema = z.enum([
  'NEW',
  'CONTACTED',
  'REPLIED',
  'WON',
  'LOST',
  'DISCARDED',
]);

export const updateLeadSchema = z.object({
  status: leadStatusSchema.optional(),
  notes: z.string().max(1000).optional(),
});

export const leadFiltersSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'REPLIED', 'WON', 'LOST', 'DISCARDED', 'ALL']).optional(),
  minScore: z.number().int().min(0).max(100).optional(),
  maxScore: z.number().int().min(0).max(100).optional(),
  hasWebsite: z.enum(['true', 'false', 'ALL']).optional(),
  hasInstagram: z.enum(['true', 'false', 'ALL']).optional(),
  city: z.string().optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type ScrapeParams = z.infer<typeof scrapeParamsSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type LeadFiltersInput = z.infer<typeof leadFiltersSchema>;
