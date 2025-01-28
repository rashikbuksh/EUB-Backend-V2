import { relations, sql } from 'drizzle-orm';
import { integer, pgSchema, text } from 'drizzle-orm/pg-core';

import { DateTime, defaultUUID, uuid_primary } from '@/lib/variables';
import { DEFAULT_OPERATION } from '@/utils/db';

import { users } from '../hr/schema';

const portfolio = pgSchema('portfolio');

//* Authorities
export const authorities_category = portfolio.enum('authorities_category', [
  'chancellor',
  'chairman',
  'vc',
  'pro_vc',
  'dean',
  'treasurer',
  'director_coordination',
  'registrar',
]);

export const authorities_id = portfolio.sequence('authorities_id', {
  startWith: 1,
  increment: 1,
});

export const authorities = portfolio.table('authorities', {
  id: integer('id').default(sql`nextval('portfolio.authorities_id')`),
  uuid: uuid_primary,
  user_uuid: defaultUUID('user_uuid')
    .notNull()
    .references(() => users.uuid, DEFAULT_OPERATION),
  category: authorities_category('category').notNull(),
  short_biography: text('short_biography').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  remarks: text('remarks'),
});

//* Info
export const info_page_name = portfolio.enum('info_page_name', [
  'chancellor',
  'chairman',
  'vc',
  'pro_vc',
  'dean',
  'treasurer',
  'director_coordination',
  'registrar',
]);

export const info_id = portfolio.sequence('info_id', {
  startWith: 1,
  increment: 1,
});

export const info = portfolio.table('info', {
  id: integer('id').default(sql`nextval('portfolio.info_id')`),
  uuid: uuid_primary,
  description: text('description').notNull(),
  page_name: info_page_name('page_name').notNull(),
  file: text('file').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  remarks: text('remarks'),
});

//* office

export const office_id = portfolio.sequence('office_id', {
  startWith: 1,
  increment: 1,
});

export const office_category = portfolio.enum('office_category', [
  'registrar',
  'controller_of_examinations',
  'ict_division',
  'ciac',
  'program_coordination',
  'admission_and_student_affairs',
  'finance_and_accounts',
  'faculty_development_and_evaluation',
  'planning_and_development',
  'proctor',
  'procurement_and_inventory',
  'iqac',
  'library',
]);

export const office = portfolio.table('office', {
  id: integer('id').default(sql`nextval('portfolio.office_id')`),
  uuid: uuid_primary,
  category: office_category('category').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  remarks: text('remarks'),
});
//* office entry

export const office_entry_id = portfolio.sequence('office_entry_id', {
  startWith: 1,
  increment: 1,
});

export const office_entry = portfolio.table('office_entry', {
  id: integer('id').default(sql`nextval('portfolio.office_entry_id')`),
  uuid: uuid_primary,
  office_uuid: defaultUUID('office_uuid').references(
    () => office.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  remarks: text('remarks'),
});
//* relations
export const portfolio_authorities_rel = relations(authorities, ({ one }) => ({
  user: one(users, {
    fields: [authorities.user_uuid],
    references: [users.uuid],
  }),
  created_by: one(users, {
    fields: [authorities.created_by],
    references: [users.uuid],
  }),
}));

export const portfolio_office_rel = relations(office, ({ one }) => ({
  created_by: one(users, {
    fields: [office.created_by],
    references: [users.uuid],
  }),
}));

export default portfolio;
