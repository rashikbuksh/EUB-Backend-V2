import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { designation } from "../schema";

//* crud
export const selectSchema = createSelectSchema(designation);

export const insertSchema = createInsertSchema(
  designation,
  {
    uuid: schema => schema.uuid.length(21),
    designation: schema => schema.designation.min(1),
  },
).required({
  uuid: true,
  designation: true,
  created_at: true,
}).omit({
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
