import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { info_extra } from '../schema';

//* crud
export const selectSchema = createSelectSchema(info_extra);

export const insertSchema = createInsertSchema(
  info_extra,
  {
    uuid: schema => schema.uuid.length(21),
    teachers_uuid: schema => schema.teachers_uuid.length(21),
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
  description: true,
  type: true,
  created_by: true,
  created_at: true,
}).partial({
  created_by: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
