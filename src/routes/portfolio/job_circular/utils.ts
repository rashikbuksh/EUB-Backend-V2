import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { job_circular } from '../schema';

//* crud
export const selectSchema = createSelectSchema(job_circular);

export const insertSchema = createInsertSchema(
  job_circular,
  {
    uuid: schema => schema.uuid.length(21),
    title: schema => schema.title.min(1),
    // faculty_uuid: schema => schema.faculty_uuid.length(21),
    category: schema => schema.category.min(1),
    location: schema => schema.location.min(1),
    file: schema => schema.file.min(1),
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
  title: true,
  // faculty_uuid: true,
  category: true,
  location: true,
  file: true,
  created_at: true,
  created_by: true,
}).partial({
  deadline: true,
  updated_at: true,
  remarks: true,
}).omit({
  id: true,
});

export const patchSchema = insertSchema.partial();
