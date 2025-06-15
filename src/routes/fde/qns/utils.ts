import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { qns } from '../schema';

//* crud
export const selectSchema = createSelectSchema(qns);

export const insertSchema = createInsertSchema(
  qns,
  {
    uuid: schema => schema.uuid.length(21),
    qns_category_uuid: schema => schema.qns_category_uuid.length(21),
    name: schema => schema.name.min(1),
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
  index: true,
  qns_category_uuid: true,
  created_at: true,
  created_by: true,
}).partial({
  active: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
