import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { sem_crs_thr_entry } from '../schema';

//* crud
export const selectSchema = createSelectSchema(sem_crs_thr_entry);

export const insertSchema = createInsertSchema(
  sem_crs_thr_entry,
  {
    uuid: schema => schema.uuid.length(21),
    semester_uuid: schema => schema.semester_uuid.length(21),
    course_section_uuid: schema => schema.course_section_uuid.length(21),
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
  semester_uuid: true,
  course_section_uuid: true,
  class_size: true,
  created_at: true,
  created_by: true,
}).partial({
  is_mid_evaluation_complete: true,
  is_final_evaluation_complete: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
