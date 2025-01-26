import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { authorities } from '../schema';

//* crud
export const selectSchema = createSelectSchema(authorities);

export const insertSchema = createInsertSchema(
  authorities,
  {
    uuid: schema => schema.uuid.length(21),
    user_uuid: schema => schema.user_uuid.length(21),
    short_biography: schema => schema.short_biography.min(1),
    created_by: schema => schema.created_by.length(21),
  },
).required({
  uuid: true,
  user_uuid: true,
  category: true,
  short_biography: true,
  created_at: true,
  created_by: true,
}).omit({
  id: true,
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
