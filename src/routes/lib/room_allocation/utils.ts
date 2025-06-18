import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { room_allocation } from '../schema';

//* crud
export const selectSchema = createSelectSchema(room_allocation);

export const insertSchema = createInsertSchema(
  room_allocation,
  {
    uuid: schema => schema.uuid.length(21),
    room_uuid: schema => schema.room_uuid.length(21),
    sem_crs_thr_entry_uuid: schema => schema.sem_crs_thr_entry_uuid.length(21),
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
  room_uuid: true,
  sem_crs_thr_entry_uuid: true,
  day: true,
  from: true,
  to: true,
  created_at: true,
  created_by: true,
}).partial({
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
