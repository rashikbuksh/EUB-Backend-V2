import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { room } from '../schema';

//* crud
export const selectSchema = createSelectSchema(room);

export const insertSchema = createInsertSchema(
  room,
  {
    uuid: schema => schema.uuid.length(21),
    name: schema => schema.name.min(1),
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
  name: true,
  created_at: true,
  created_by: true,
}).partial({
  type: true,
  location: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
