import { DateTime, defaultUUID, uuid_primary } from "@/lib/variables";
import { relations } from "drizzle-orm";

import { pgSchema, text } from "drizzle-orm/pg-core";

import { users } from "../hr/schema";

const commercial = pgSchema("commercial");

export const bank = commercial.table("bank", {
  uuid: uuid_primary,
  name: text("name").notNull(),
  swift_code: text("swift_code").notNull(),
  address: text("address"),
  policy: text("policy"),
  created_at: DateTime("created_at").notNull(),
  updated_at: DateTime("updated_at"),
  created_by: defaultUUID("created_by").references(() => users.uuid, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  routing_no: text("routing_no"),
  remarks: text("remarks"),
});

//* relations
// export const commercial_bank_rel = relations(bank, ({ one }) => ({
//   created_by: one(users),
// }));

export default commercial;
