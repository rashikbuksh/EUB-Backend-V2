import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import { policy_and_notice } from "../schema";

//* crud
export const selectHrPolicyAndNoticeSchema = createSelectSchema(
  policy_and_notice,
);

export const insertHrPolicyAndNoticeSchema = createInsertSchema(
  policy_and_notice,
  {
    uuid: schema => schema.uuid.length(15),
    type: schema => schema.type.min(1),
    title: schema => schema.title.min(1),
    sub_title: schema => schema.sub_title.min(1),
    url: schema => schema.url.min(1),
  },
).required({
  uuid: true,
  type: true,
  title: true,
  sub_title: true,
  url: true,
  created_by: true,
  created_at: true,
  status: true,
}).omit({
  updated_at: true,
  remarks: true,
});

export const patchHrPolicyAndNoticeSchema = insertHrPolicyAndNoticeSchema
  .partial();
