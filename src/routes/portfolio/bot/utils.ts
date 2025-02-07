import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { bot } from '../schema';

//* crud
export const selectSchema = createSelectSchema(bot);

export const insertSchema = createInsertSchema(
  bot,
  {
    uuid: schema => schema.uuid.length(21),
    user_uuid: schema => schema.user_uuid.length(21),

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
  user_uuid: true,
  category: true,
  created_at: true,
  created_by: true,
}).partial({
  updated_at: true,
  remarks: true,
}).omit({
  id: true,
});

export const patchSchema = insertSchema.partial();
