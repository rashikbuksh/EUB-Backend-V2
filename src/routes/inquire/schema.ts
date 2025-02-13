import { relations, sql } from 'drizzle-orm';
import { integer, pgSchema, text } from 'drizzle-orm/pg-core';

import { DateTime, defaultUUID, uuid_primary } from '@/lib/variables';
import { DEFAULT_OPERATION, DEFAULT_SEQUENCE } from '@/utils/db';

import { users } from '../hr/schema';

const inquire = pgSchema('inquire');

//* Inquire *//

//* visitor

export const visitor_id = inquire.sequence('visitor_id', DEFAULT_SEQUENCE);
export const visitor_category = inquire.enum('visitor_category', [
  'call_entry',
  'faq',
]);
export const visitor_status = inquire.enum('visitor_status', [
  'pending',
  'converted',
  'rejected',
]);

export const visitor = inquire.table('visitor', {
  id: integer('id').default(sql`nextval('inquire.visitor_id')`),
  uuid: uuid_primary,
  category: visitor_category('category').notNull(),
  name: text('name').notNull(),
  mobile: text('mobile').notNull(),
  subject_preference: text('subject_preference').notNull(),
  prev_institution: text('prev_institution').notNull(),
  from_where: text('from_where').notNull(),
  department: text('department').notNull(),
  through: text('through').notNull(),
  status: visitor_status('status').notNull(),
  created_at: DateTime('created_at').notNull().$defaultFn(() => 'now()'),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  remarks: text('remarks'),
});

//* relations
export const visitor_relations = relations(visitor, ({ one }) => ({
  created_by: one(users, {
    fields: [visitor.created_by],
    references: [users.uuid],
  }),
}));

export default inquire;
