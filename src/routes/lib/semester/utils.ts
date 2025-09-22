import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { semester } from '../schema';

//* crud
export const selectSchema = createSelectSchema(semester);

export const insertSchema = createInsertSchema(
  semester,
  {
    uuid: schema => schema.uuid.length(21),
    name: schema => schema.name.min(1),
    started_at: schema => schema.started_at.regex(dateTimePattern, {
      message: 'started_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    mid_started_at: schema => schema.mid_started_at.regex(dateTimePattern, {
      message: 'mid_started_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    final_started_at: schema => schema.final_started_at.regex(dateTimePattern, {
      message: 'final_started_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    ended_at: schema => schema.ended_at.regex(dateTimePattern, {
      message: 'ended_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
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
  started_at: true,
  created_at: true,
  created_by: true,
}).partial({
  type: true,
  mid_started_at: true,
  final_started_at: true,
  ended_at: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
