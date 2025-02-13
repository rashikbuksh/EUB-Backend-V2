import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { visitor } from '../schema';

//* crud
export const selectSchema = createSelectSchema(visitor);

export const insertSchema = createInsertSchema(
  visitor,
  {
    uuid: schema => schema.uuid.length(21),
    name: schema => schema.name.min(1),
    mobile: schema => schema.mobile.length(11),
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
  mobile: true,
  created_at: true,
  created_by: true,
  category: true,
  status: true,
  subject_preference: true,
  prev_institution: true,
  from_where: true,
  department: true,
  through: true,
}).partial({
  updated_at: true,
  remarks: true,
}).omit({
  id: true,
});

export const patchSchema = insertSchema.partial();
