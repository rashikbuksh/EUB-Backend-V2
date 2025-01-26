import { DateTime, defaultUUID, uuid_primary } from '@/lib/variables';
import { relations } from 'drizzle-orm';

import { boolean, pgSchema, text } from 'drizzle-orm/pg-core';

const hr = pgSchema('hr');

//* Department
export const department = hr.table('department', {
  uuid: uuid_primary,
  department: text('department').notNull().unique(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

//* Designation
export const designation = hr.table('designation', {
  uuid: uuid_primary,
  designation: text('designation').notNull().unique(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

//* Users
export const users = hr.table('users', {
  uuid: uuid_primary,
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  pass: text('pass').notNull(),
  designation_uuid: defaultUUID('designation_uuid').notNull().references(() => designation.uuid, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  department_uuid: defaultUUID('department_uuid').notNull().references(() => department.uuid, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  can_access: text('can_access'),
  ext: text('ext'),
  phone: text('phone'),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  status: boolean('status').default(false),
  remarks: text('remarks'),
});

//* Policy and Notice
export const policy_and_notice = hr.table('policy_and_notice', {
  uuid: uuid_primary,
  type: text('type').notNull(),
  title: text('title').notNull(),
  sub_title: text('sub_title').notNull(),
  url: text('url').notNull(),
  created_by: defaultUUID('created_by').references(() => users.uuid, {
    onDelete: 'set null',
    onUpdate: 'cascade',
  }),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at'),
  status: boolean('status').default(false),
  remarks: text('remarks'),
});

//* relations
export const hr_department_rel = relations(department, ({ one }) => ({
  user_department: one(users, {
    fields: [department.uuid],
    references: [users.department_uuid],
  }),
}));

export const hr_designation_rel = relations(designation, ({ one }) => ({
  user_designation: one(users, {
    fields: [designation.uuid],
    references: [users.designation_uuid],
  }),
}));

export const hr_policy_and_notice_rel = relations(policy_and_notice, ({ one }) => ({
  created_by: one(users, {
    fields: [policy_and_notice.created_by],
    references: [users.uuid],
  }),
}));

export const hr_users_rel = relations(users, ({ one, many }) => ({
  designation: one(designation, {
    fields: [users.designation_uuid],
    references: [designation.uuid],
  }),
  department: one(department, {
    fields: [users.department_uuid],
    references: [department.uuid],
  }),
  policy_and_notice: many(policy_and_notice),
}));

export default hr;
