import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { process } from '../schema';

//* crud
export const selectSchema = createSelectSchema(process);

export const insertSchema = createInsertSchema(
  process,
  {
    uuid: schema => schema.uuid.length(21),
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
  index: true,
  name: true,
  short_name: true,
  created_at: true,
  created_by: true,
}).partial({
  items: true,
  service: true,
  range_1: true,
  range_2: true,
  range_3: true,
  range_4: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
