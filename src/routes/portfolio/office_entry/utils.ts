import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { office_entry } from '../schema';

//* crud
export const selectSchema = createSelectSchema(office_entry);

export const insertSchema = createInsertSchema(
  office_entry,
  {
    uuid: schema => schema.uuid.length(21),
    office_uuid: schema => schema.office_uuid.length(21),
    user_uuid: schema => schema.user_uuid.length(21),
    designation: schema => schema.designation.min(1),
    user_phone: schema => schema.user_phone.min(11),
    user_email: schema => schema.user_email.min(1),
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
  office_uuid: true,
  user_uuid: true,
  created_at: true,
  created_by: true,
  designation: true,
  user_email: true,
}).partial({
  user_phone: true,
  updated_at: true,
  remarks: true,
}).omit({
  id: true,
});

export const patchSchema = insertSchema.partial();
