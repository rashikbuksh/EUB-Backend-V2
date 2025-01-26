import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

import { department } from '../schema';

//* crud
export const selectSchema = createSelectSchema(department);

export const insertSchema = createInsertSchema(
  department,
  {
    uuid: schema => schema.uuid.length(21),
    name: schema => schema.name.min(1),
  },
).required({
  uuid: true,
  name: true,
  created_at: true,
}).omit({
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
