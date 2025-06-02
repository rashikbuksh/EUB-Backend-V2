import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { dateTimePattern } from '@/utils';

import { contact_us } from '../schema';

//* crud
export const selectSchema = createSelectSchema(contact_us);

export const insertSchema = createInsertSchema(
  contact_us,
  {
    uuid: schema => schema.uuid.length(21),
    full_name: schema => schema.full_name.min(1),
    email: schema => schema.email.email(),
    question: schema => schema.question.min(1),
    description: schema => schema.description.min(1),
    created_at: schema => schema.created_at.regex(dateTimePattern, {
      message: 'created_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
    updated_at: schema => schema.updated_at.regex(dateTimePattern, {
      message: 'updated_at must be in the format "YYYY-MM-DD HH:MM:SS"',
    }),
  },
).required({
  uuid: true,
  full_name: true,
  email: true,
  question: true,
  description: true,
  created_at: true,
}).partial({
  updated_at: true,
  phone: true,
  is_response: true,
}).omit({
  id: true,
});

export const patchSchema = insertSchema.partial();
