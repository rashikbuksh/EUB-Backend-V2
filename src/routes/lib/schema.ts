import { relations } from 'drizzle-orm';
import { pgSchema, text } from 'drizzle-orm/pg-core';

import { DateTime, defaultUUID, uuid_primary } from '@/lib/variables';
import { DEFAULT_OPERATION } from '@/utils/db';

import { users } from '../hr/schema';

const lib = pgSchema('lib');

//* lib *//

export const semester = lib.table('semester', {
  uuid: uuid_primary,
  name: text('name').notNull(),
  started_at: DateTime('started_at').notNull(),
  mid_started_at: DateTime('mid_started_at'),
  final_started_at: DateTime('final_started_at'),
  ended_at: DateTime('ended_at').notNull(),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const course = lib.table('course', {
  uuid: uuid_primary,
  name: text('name').notNull().unique(),
  code: text('code').notNull().unique(),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const course_section = lib.table('course_section', {
  uuid: uuid_primary,
  course_uuid: defaultUUID('course_uuid')
    .references(() => course.uuid, DEFAULT_OPERATION),
  name: text('name').notNull(),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

//* relations
export const semester_relations = relations(semester, ({ one }) => ({
  created_by: one(users, {
    fields: [semester.created_by],
    references: [users.uuid],
  }),
}));

export const course_relations = relations(course, ({ one }) => ({
  created_by: one(users, {
    fields: [course.created_by],
    references: [users.uuid],
  }),
}));

export const course_section_relations = relations(course_section, ({ one }) => ({
  course: one(course, {
    fields: [course_section.course_uuid],
    references: [course.uuid],
  }),
  created_by: one(users, {
    fields: [course_section.created_by],
    references: [users.uuid],
  }),
}));

export default lib;
