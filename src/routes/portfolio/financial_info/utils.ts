import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { dateTimePattern } from '@/utils';

import { financial_info } from '../schema';

//* crud
export const selectSchema = createSelectSchema(financial_info);

export const insertSchema = createInsertSchema(
  financial_info,
  {
    uuid: schema => schema.uuid.length(21),
    department_uuid: schema => schema.department_uuid.length(21),
    table_name: z.string(),
    total_credit: z.number(),
    total_cost: z.number(),
    total_waiver_amount: z.number().optional().default(0),
    admission_fee: z.number(),
    waiver_50: z.number().optional().default(0),
    waiver_55: z.number().optional().default(0),
    waiver_60: z.number().optional().default(0),
    waiver_65: z.number().optional().default(0),
    waiver_70: z.number().optional().default(0),
    waiver_75: z.number().optional().default(0),
    waiver_80: z.number().optional().default(0),
    waiver_85: z.number().optional().default(0),
    waiver_90: z.number().optional().default(0),
    waiver_95: z.number().optional().default(0),
    waiver_100: z.number().optional().default(0),
    created_by: schema => schema.created_by.length(21),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  uuid: true,
  department_uuid: true,
  table_name: true,
  total_credit: true,
  total_cost: true,
  admission_fee: true,
  created_at: true,
  created_by: true,
}).partial({
  total_waiver_amount: true,
  waiver_50: true,
  waiver_55: true,
  waiver_60: true,
  waiver_65: true,
  waiver_70: true,
  waiver_75: true,
  waiver_80: true,
  waiver_85: true,
  waiver_90: true,
  waiver_95: true,
  waiver_100: true,
  updated_at: true,
  remarks: true,
}).omit({
  id: true,
});

export const patchSchema = insertSchema.partial();
