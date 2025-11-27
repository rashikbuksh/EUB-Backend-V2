import { relations, sql } from 'drizzle-orm';
import { boolean, integer, pgSchema, text, unique } from 'drizzle-orm/pg-core';

import { DateTime, defaultUUID, PG_DECIMAL, uuid_primary } from '@/lib/variables';
import { DEFAULT_OPERATION } from '@/utils/db';

import { users } from '../hr/schema';
import { financial_info, teachers } from '../portfolio/schema';

const lib = pgSchema('lib');

//* lib *//

export const semesterTypeEnum = lib.enum('semester_type', ['four_month', 'six_month']);

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
  type: semesterTypeEnum('type').notNull().default('four_month'),
});

export const courseTypeEnum = lib.enum('course_type', ['general', 'lab']);

export const course = lib.table('course', {
  uuid: uuid_primary,
  name: text('name').notNull(),
  code: text('code').notNull(),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
  financial_info_uuid: defaultUUID('financial_info_uuid')
    .references(() => financial_info.uuid, DEFAULT_OPERATION), // department with category
  course_type: courseTypeEnum('course_type').notNull().default('general'),
  credit: PG_DECIMAL('credit').notNull().default(sql`0`),

});

// table => [
//   // unique('course_name_and_code_unique').on(table.name, table.code),
// ]

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
  index: integer('index').notNull().default(0),
});

// table => [
//   unique('course_section_course_uuid_name_type_unique').on(table.course_uuid, table.name, table.type),
// ]

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

export const room_type = lib.enum('room_type', ['general', 'lab', 'online', 'multipurpose']);

export const room = lib.table('room', {
  uuid: uuid_primary,
  name: text('name').notNull(),
  type: room_type('type').default('general'),
  location: text('location'),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
  capacity: integer('capacity').notNull().default(0),
});

export const room_allocation_day = lib.enum('room_allocation_day', [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
]);
export const room_allocation = lib.table('room_allocation', {
  uuid: uuid_primary,
  room_uuid: defaultUUID('room_uuid')
    .references(() => room.uuid, DEFAULT_OPERATION)
    .notNull(),
  sem_crs_thr_entry_uuid: defaultUUID('sem_crs_thr_entry_uuid')
    .references(() => sem_crs_thr_entry.uuid, DEFAULT_OPERATION)
    .notNull(),
  day: room_allocation_day('day').notNull(),
  from: text('from').notNull(), // Time in HH:MM format
  to: text('to').notNull(), // Time in HH:MM format
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const calender = lib.table('calender', {
  uuid: uuid_primary,
  room_uuid: defaultUUID('room_uuid')
    .references(() => room.uuid, DEFAULT_OPERATION)
    .notNull(),
  date: DateTime('date').notNull(),
  from: DateTime('from').notNull(),
  to: DateTime('to').notNull(),
  arrange_by: text('arrange_by').notNull(),
  purpose: text('purpose').notNull(),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_by: defaultUUID('updated_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
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

export const room_relations = relations(room, ({ one }) => ({
  created_by: one(users, {
    fields: [room.created_by],
    references: [users.uuid],
  }),
}));

export const room_allocation_relations = relations(room_allocation, ({ one }) => ({
  room: one(room, {
    fields: [room_allocation.room_uuid],
    references: [room.uuid],
  }),
  sem_crs_thr_entry: one(sem_crs_thr_entry, {
    fields: [room_allocation.sem_crs_thr_entry_uuid],
    references: [sem_crs_thr_entry.uuid],
  }),
  created_by: one(users, {
    fields: [room_allocation.created_by],
    references: [users.uuid],
  }),
}));

export const calender_relations = relations(calender, ({ one }) => ({
  room: one(room, {
    fields: [calender.room_uuid],
    references: [room.uuid],
  }),
  created_by: one(users, {
    fields: [calender.created_by],
    references: [users.uuid],
  }),
}));

export default lib;
