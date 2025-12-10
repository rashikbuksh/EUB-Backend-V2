import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { off_day } from '../schema';

//* crud
export const selectSchema = createSelectSchema(off_day);

export const insertSchema = createInsertSchema(
  off_day,
  {
    uuid: schema => schema.uuid.length(21),
    room_uuid: schema => schema.room_uuid.length(21),
    from_date: schema => schema.from_date.regex(dateTimePattern, {
      message: 'from_date must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    to_date: schema => schema.to_date.regex(dateTimePattern, {
      message: 'to_date must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    description: schema => schema.description.max(255).optional(),
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
  from_date: true,
  created_at: true,
  created_by: true,
}).partial({
  to_date: true,
  description: true,
  updated_by: true,
  updated_at: true,
  remarks: true,
  is_all_rooms: true,
});

export const patchSchema = insertSchema.partial();
