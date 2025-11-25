import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { articles } from '../schema';

//* crud
export const selectSchema = createSelectSchema(articles);

export const insertSchema = createInsertSchema(
  articles,
  {
    uuid: schema => schema.uuid.length(15),
    volume_uuid: schema => schema.volume_uuid.length(15),
    created_by: schema => schema.created_by.length(15),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_by: schema => schema.updated_by.length(15).optional(),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    remarks: schema => schema.remarks.optional(),
  },
).required({
  uuid: true,
  volume_uuid: true,
  title: true,
  abstract: true,
  reference: true,
  file: true,
  published_date: true,
  created_by: true,
  created_at: true,
}).partial({
  updated_by: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
