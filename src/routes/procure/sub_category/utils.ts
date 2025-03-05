import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import z from 'zod';

import { dateTimePattern } from '@/utils';

import { sub_category } from '../schema';

//* crud
export const selectSchema = createSelectSchema(sub_category);

export const insertSchema = createInsertSchema(
  sub_category,
  {
    uuid: schema => schema.uuid.length(21),
    category_uuid: schema => schema.category_uuid.length(21),
    created_by: schema => schema.created_by.length(21),
    min_amount: z.number().optional().default(0),
    min_quotation: z.number().optional().default(0),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  uuid: true,
  index: true,
  type: true,
  category_uuid: true,
  name: true,
  created_at: true,
  created_by: true,
}).partial({
  min_amount: true,
  min_quotation: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
