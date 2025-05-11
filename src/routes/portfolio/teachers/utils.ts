import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { teachers } from '../schema';

//* crud
export const selectSchema = createSelectSchema(teachers);

export const insertSchema = createInsertSchema(
  teachers,
  {
    uuid: schema => schema.uuid.length(21),
    teacher_uuid: schema => schema.teacher_uuid.length(21),
    teacher_email: schema => schema.teacher_email.min(1),
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

  teacher_uuid: true,
  education: true,
  created_at: true,
  created_by: true,
  teacher_email: true,
  status: true,
}).partial({
  teacher_phone: true,
  publication: true,
  updated_at: true,
  remarks: true,
  journal: true,
  appointment_date: true,
  resign_date: true,
  about: true,
  teacher_initial: true,
}).omit({
  id: true,
});

export const patchSchema = insertSchema.partial();
