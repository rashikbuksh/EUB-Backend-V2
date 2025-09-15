import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { program_semester } from '../schema';

//* crud
export const selectSchema = createSelectSchema(program_semester);

export const insertSchema = createInsertSchema(
  program_semester,
  {
    uuid: schema => schema.uuid.length(21),
    financial_info_uuid: schema => schema.financial_info_uuid.length(21),
    semester_no: schema => schema.semester_no.min(1).max(12),
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
  financial_info_uuid: true,
  semester_no: true,
  created_at: true,
  created_by: true,
}).partial({
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
