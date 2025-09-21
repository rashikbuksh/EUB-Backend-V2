import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { course } from '../schema';

//* crud
export const selectSchema = createSelectSchema(course);

export const insertSchema = createInsertSchema(
  course,
  {
    uuid: schema => schema.uuid.length(21),
    name: schema => schema.name.min(1),
    code: schema => schema.code.min(1),
    financial_info_uuid: schema => schema.financial_info_uuid.length(21),
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
  code: true,
  created_at: true,
  created_by: true,
}).partial({
  course_type: true,
  credit: true,
  shift_type: true,
  financial_info_uuid: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
