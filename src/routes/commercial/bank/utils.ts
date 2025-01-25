import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { bank } from "../schema";

//* crud
export const selectSchema = createSelectSchema(bank);

export const insertSchema = createInsertSchema(
  bank,
  {
    uuid: schema => schema.uuid.length(15),
    name: schema => schema.name.min(1),
    swift_code: schema => schema.swift_code.min(1),
    address: schema => schema.address.min(1),
    policy: schema => schema.policy.min(1),
  },
).required({
  uuid: true,
  name: true,
  swift_code: true,
  address: true,
  policy: true,
  created_at: true,
}).omit({
  updated_at: true,
  remarks: true,
});

export const patchSchema = insertSchema.partial();
