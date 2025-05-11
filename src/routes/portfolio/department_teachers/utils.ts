import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { department_teachers } from '../schema';

//* crud
export const selectSchema = createSelectSchema(department_teachers);

export const insertSchema = createInsertSchema(
  department_teachers,
  {
    uuid: schema => schema.uuid.length(21),
    teachers_uuid: schema => schema.teachers_uuid.length(21),
    department_uuid: schema => schema.department_uuid.length(21),
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
  teachers_uuid: true,
  department_uuid: true,
  department_head: true,
  department_head_message: true,
  teacher_designation: true,
  created_at: true,
  created_by: true,
  status: true,
}).partial({
  updated_at: true,
  remarks: true,
}).omit({
  id: true,
});

export const patchSchema = insertSchema.partial();
