import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { department, department_category } from '../schema';

//* crud
export const selectSchema = createSelectSchema(department);

export const insertSchema = createInsertSchema(
  department,
  {
    uuid: schema => schema.uuid.length(21),
    name: schema => schema.name.min(1),
    faculty_uuid: schema => schema.faculty_uuid.length(21),
    created_by: schema => schema.created_by.length(21),
    category: schema => schema.category.refine(value => department_category(value), {
      message: 'Invalid category',
    }),
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
  faculty_uuid: true,
  category: true,
  created_at: true,
  created_by: true,
}).omit({
  id: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
