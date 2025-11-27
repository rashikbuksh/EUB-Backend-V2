import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { calender } from '../schema';

//* crud
export const selectSchema = createSelectSchema(calender);

export const insertSchema = createInsertSchema(
  calender,
  {
    uuid: schema => schema.uuid.length(21),
    room_uuid: schema => schema.room_uuid.length(21),
    created_by: schema => schema.created_by.length(21),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_by: schema => schema.updated_by.length(21),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  uuid: true,
  room_uuid: true,
  date: true,
  from: true,
  to: true,
  arrange_by: true,
  purpose: true,
  created_at: true,
  created_by: true,
}).partial({
  updated_by: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
