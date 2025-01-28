import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { program } from '../schema';

//* crud
export const selectSchema = createSelectSchema(program);

export const insertSchema = createInsertSchema(
  program,
  {
    uuid: schema => schema.uuid.length(21),
    name: schema => schema.name.min(1),
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
  category: true,
  created_at: true,
}).omit({
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
