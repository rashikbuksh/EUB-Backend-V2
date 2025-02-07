import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { news } from '../schema';

//* crud
export const selectSchema = createSelectSchema(news);

export const insertSchema = createInsertSchema(
  news,
  {
    uuid: schema => schema.uuid.length(21),
    title: schema => schema.title.min(1),
    subtitle: schema => schema.subtitle.min(1),
    content: schema => schema.content.min(1),
    published_date: schema => schema.published_date.min(1),
    cover_image: schema => schema.cover_image.min(1),
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
  title: true,
  subtitle: true,
  content: true,
  published_date: true,
  cover_image: true,
  created_at: true,
  created_by: true,
}).partial({
  description: true,
  updated_at: true,
  remarks: true,
}).omit({
  id: true,
});

export const patchSchema = insertSchema.partial();
