import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { club } from '../schema';

//* crud
export const selectSchema = createSelectSchema(club);

export const insertSchema = createInsertSchema(
  club,
  {
    uuid: schema => schema.uuid.length(21),
    name: schema => schema.name.min(1),
    department_uuid: schema => schema.department_uuid.length(21),
    president_uuid: schema => schema.president_uuid.length(21),
    email: schema => schema.email.length(100),
    phone: schema => schema.phone.min(1),
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
  department_uuid: true,
  president_uuid: true,
  created_at: true,
  created_by: true,
  email: true,
  phone: true,
}).partial({
  updated_at: true,
  remarks: true,
}).omit({
  id: true,
});

export const patchSchema = insertSchema.partial();
