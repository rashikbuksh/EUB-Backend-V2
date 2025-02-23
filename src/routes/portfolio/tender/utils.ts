import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { table_name_enum_tender, tender } from '../schema';

//* crud
export const selectSchema = createSelectSchema(tender);

export const insertSchema = createInsertSchema(
  tender,
  {
    uuid: schema => schema.uuid.length(21),
    table_name: schema => schema.table_name.refine(value => table_name_enum_tender(value), {
      message: 'Invalid table name',
    }),
    code: schema => schema.code.min(1),
    type: schema => schema.type.min(1),
    title: schema => schema.title.min(1),
    published_date: schema => schema.published_date.regex(dateTimePattern, {
      message: 'published_date must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
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
  table_name: true,
  code: true,
  type: true,
  title: true,
  published_date: true,
  file: true,
  created_at: true,
  created_by: true,
}).partial({
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
