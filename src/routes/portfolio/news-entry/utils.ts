import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { news_entry } from '../schema';

//* crud
export const selectSchema = createSelectSchema(news_entry);

export const insertSchema = createInsertSchema(
  news_entry,
  {
    uuid: schema => schema.uuid.length(21),
    news_uuid: schema => schema.news_uuid.length(21),
    documents: schema => schema.documents.min(1),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  uuid: true,
  news_uuid: true,
  documents: true,
  created_at: true,
}).partial({
  updated_at: true,
});

export const patchSchema = insertSchema.partial();
