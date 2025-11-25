import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { article_keywords } from '../schema';

//* crud
export const selectSchema = createSelectSchema(article_keywords);

export const insertSchema = createInsertSchema(
  article_keywords,
  {
    uuid: schema => schema.uuid.length(21),
    keywords_uuid: schema => schema.keywords_uuid.length(21),
    articles_uuid: schema => schema.articles_uuid.length(21),
    created_by: schema => schema.created_by.length(21),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_by: schema => schema.updated_by.length(21),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  uuid: true,
  keywords_uuid: true,
  articles_uuid: true,
  created_by: true,
  created_at: true,
}).partial({
  created_by: true,
  updated_by: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
