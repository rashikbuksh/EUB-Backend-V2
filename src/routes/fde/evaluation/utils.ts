import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { evaluation } from '../schema';

//* crud
export const selectSchema = createSelectSchema(evaluation);

export const insertSchema = createInsertSchema(
  evaluation,
  {
    uuid: schema => schema.uuid.length(21),
    respond_student_uuid: schema => schema.respond_student_uuid.length(21),
    qns_uuid: schema => schema.qns_uuid.length(21),
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
  respond_student_uuid: true,
  qns_uuid: true,
  rating: true,
  created_at: true,
  created_by: true,
}).partial({
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
