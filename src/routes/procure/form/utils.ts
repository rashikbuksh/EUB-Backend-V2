import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { form } from '../schema';

//* crud
export const selectSchema = createSelectSchema(form);

export const insertSchema = createInsertSchema(
  form,
  {
    uuid: schema => schema.uuid.length(21),
    file: schema => schema.file.min(1),
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
  file: true,
  created_at: true,
}).partial({
  updated_at: true,
});

export const patchSchema = insertSchema.partial();
