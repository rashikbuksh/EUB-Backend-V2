import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { dateTimePattern } from '@/utils';

import { purchase_cost_center } from '../schema';

//* crud
export const selectSchema = createSelectSchema(purchase_cost_center);

export const insertSchema = createInsertSchema(
  purchase_cost_center,
  {
    uuid: schema => schema.uuid.length(21),
    sub_category_uuid: schema => schema.sub_category_uuid.length(21),
    created_by: schema => schema.created_by.length(21),
    budget: z.number().optional().default(0),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  uuid: true,
  name: true,
  from: true,
  to: true,
  created_at: true,
  created_by: true,
}).partial({
  budget: true,
  index: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
