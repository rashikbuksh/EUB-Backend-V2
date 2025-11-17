import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

import { dateTimePattern } from '@/utils';

import { capital_item } from '../schema';

//* crud
export const selectSchema = createSelectSchema(capital_item);

export const insertSchema = createInsertSchema(
  capital_item,
  {
    uuid: schema => schema.uuid.length(21),
    capital_uuid: schema => schema.capital_uuid.length(21),
    quantity: z.number().optional(),
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
  capital_uuid: true,
  item: true,
  created_at: true,
  created_by: true,
}).partial({
  quantity: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
