import { relations } from 'drizzle-orm';
import { boolean, integer, pgSchema, text, unique } from 'drizzle-orm/pg-core';

import { DateTime, defaultUUID, PG_DECIMAL, uuid_primary } from '@/lib/variables';
import { DEFAULT_OPERATION } from '@/utils/db';

import { users } from '../hr/schema';
import { sem_crs_thr_entry } from '../lib/schema';

const fde = pgSchema('fde');

//* fde *//
export const qns_category = fde.table('qns_category', {
  uuid: uuid_primary,
  index: integer('index').notNull().unique(),
  name: text('name').notNull(),
  min_percentage: PG_DECIMAL('min_percentage').notNull(),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const qns = fde.table('qns', {
  uuid: uuid_primary,
  qns_category_uuid: defaultUUID('qns_category_uuid')
    .references(() => qns_category.uuid, DEFAULT_OPERATION)
    .notNull(),
  index: integer('index').notNull().unique(),
  name: text('name').notNull(),
  active: boolean('active').notNull().default(true),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

export const respond_student_evaluation_time = fde.enum('respond_student_evaluation_time', [
  'mid',
  'final',
]);

export const respond_student = fde.table('respond_student', {
  uuid: uuid_primary,
  sem_crs_thr_entry_uuid: defaultUUID('sem_crs_thr_entry_uuid')
    .references(() => sem_crs_thr_entry.uuid, DEFAULT_OPERATION)
    .notNull(),
  id: text('id').notNull(),
  evaluation_time: respond_student_evaluation_time('evaluation_time').notNull(),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
}, table => [
  unique('respond_student_sem_crs_thr_entry_uuid_id_evaluation_time_unique').on(
    table.sem_crs_thr_entry_uuid,
    table.id,
    table.evaluation_time,
  ),
]);

export const evaluation = fde.table('evaluation', {
  uuid: uuid_primary,
  respond_student_uuid: defaultUUID('respond_student_uuid')
    .references(() => respond_student.uuid, DEFAULT_OPERATION)
    .notNull(),
  qns_uuid: defaultUUID('qns_uuid')
    .references(() => qns.uuid, DEFAULT_OPERATION)
    .notNull(),
  rating: integer('rating').notNull(),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  remarks: text('remarks'),
});

//* relations

export const qns_category_relations = relations(qns_category, ({ one }) => ({
  created_by: one(users, {
    fields: [qns_category.created_by],
    references: [users.uuid],
  }),
}));

export const qns_relations = relations(qns, ({ one }) => ({
  qns_category: one(qns_category, {
    fields: [qns.qns_category_uuid],
    references: [qns_category.uuid],
  }),
  created_by: one(users, {
    fields: [qns.created_by],
    references: [users.uuid],
  }),
}));

export const respond_student_relations = relations(respond_student, ({ one }) => ({
  sem_crs_thr_entry: one(sem_crs_thr_entry, {
    fields: [respond_student.sem_crs_thr_entry_uuid],
    references: [sem_crs_thr_entry.uuid],
  }),
  created_by: one(users, {
    fields: [respond_student.created_by],
    references: [users.uuid],
  }),
}));

export const evaluation_relations = relations(evaluation, ({ one }) => ({
  respond_student: one(respond_student, {
    fields: [evaluation.respond_student_uuid],
    references: [respond_student.uuid],
  }),
  qns: one(qns, {
    fields: [evaluation.qns_uuid],
    references: [qns.uuid],
  }),
  created_by: one(users, {
    fields: [evaluation.created_by],
    references: [users.uuid],
  }),
}));

export default fde;
