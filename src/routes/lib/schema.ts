import { relations } from 'drizzle-orm';
import { boolean, integer, pgSchema, text, unique } from 'drizzle-orm/pg-core';

import { DateTime, defaultUUID, uuid_primary } from '@/lib/variables';
import { DEFAULT_OPERATION } from '@/utils/db';

import { users } from '../hr/schema';
import { teachers } from '../portfolio/schema';

const lib = pgSchema('lib');

//* lib *//

export const semester = lib.table('semester', {
  uuid: uuid_primary,
  name: text('name').notNull(),
  started_at: DateTime('started_at').notNull(),
  mid_started_at: DateTime('mid_started_at'),
  final_started_at: DateTime('final_started_at'),
  ended_at: DateTime('ended_at'),
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
    .references(() => course.uuid, DEFAULT_OPERATION)
    .notNull(),
  name: text('name').notNull(),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
}, table => [
  unique('course_section_course_uuid_name_unique').on(table.course_uuid, table.name),
]);

export const sem_crs_thr_entry = lib.table('sem_crs_thr_entry', {
  uuid: uuid_primary,
  semester_uuid: defaultUUID('semester_uuid').references(() => semester.uuid, DEFAULT_OPERATION).notNull(),
  course_section_uuid: defaultUUID('course_section_uuid')
    .references(() => course_section.uuid, DEFAULT_OPERATION)
    .notNull(),
  teachers_uuid: defaultUUID('teachers_uuid')
    .references(() => teachers.uuid, DEFAULT_OPERATION)
    .notNull(),
  class_size: integer('class_size').notNull(),
  is_mid_evaluation_complete: boolean('is_mid_evaluation_complete').notNull().default(false),
  is_final_evaluation_complete: boolean('is_final_evaluation_complete').notNull().default(false),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
}, table => [
  unique('sem_crs_thr_entry_semester_uuid_course_section_uuid_teachers_uuid_unique')
    .on(table.semester_uuid, table.course_section_uuid, table.teachers_uuid),
]);

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

export const sem_crs_thr_entry_relations = relations(sem_crs_thr_entry, ({ one }) => ({
  semester: one(semester, {
    fields: [sem_crs_thr_entry.semester_uuid],
    references: [semester.uuid],
  }),
  course_section: one(course_section, {
    fields: [sem_crs_thr_entry.course_section_uuid],
    references: [course_section.uuid],
  }),
  teachers: one(teachers, {
    fields: [sem_crs_thr_entry.teachers_uuid],
    references: [teachers.uuid],
  }),
  created_by: one(users, {
    fields: [sem_crs_thr_entry.created_by],
    references: [users.uuid],
  }),
}));

export default lib;
