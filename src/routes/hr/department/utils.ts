import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { department } from "../schema";

//* crud
export const selectSchema = createSelectSchema(department);

export const insertSchema = createInsertSchema(
  department,
  {
    uuid: schema => schema.uuid.length(15),
    department: schema => schema.department.min(1),
  },
).required({
  uuid: true,
  department: true,
  created_at: true,
}).omit({
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
