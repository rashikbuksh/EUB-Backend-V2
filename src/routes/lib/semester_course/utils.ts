import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { semester_course } from '../schema';

//* crud
export const selectSchema = createSelectSchema(semester_course);

export const insertSchema = createInsertSchema(
  semester_course,
  {
    uuid: schema => schema.uuid.length(21),
    program_semester_uuid: schema => schema.program_semester_uuid.length(21),
    course_uuid: schema => schema.course_uuid.length(21),
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
  program_semester_uuid: true,
  course_uuid: true,
  created_at: true,
  created_by: true,
}).partial({
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
