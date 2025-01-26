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

export const authorities_id = portfolio.sequence(
  'authorities_id',
  {
    startWith: 1,
    increment: 1,
  },
);

export const authorities = portfolio.table('authorities', {
  id: integer('id').default(sql`nextval('portfolio.authorities_id')`),
  uuid: uuid_primary,
  user_uuid: defaultUUID('user_uuid').notNull().references(() => users.uuid, DEFAULT_OPERATION),
  category: authorities_category('category').notNull(),
  short_biography: text('short_biography').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
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

export const info_id = portfolio.sequence(
  'info_id',
  {
    startWith: 1,
    increment: 1,
  },
);

export const info = portfolio.table('info', {
  id: integer('id').default(sql`nextval('portfolio.info_id')`),
  uuid: uuid_primary,
  description: text('description').notNull(),
  page_name: info_page_name('page_name').notNull(),
  file: text('file').notNull(),
  created_at: DateTime('created_at').notNull(),
  updated_at: DateTime('updated_at'),
  created_by: defaultUUID('created_by').references(() => users.uuid, DEFAULT_OPERATION),
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

export const portfolio_info_rel = relations(info, ({ one }) => ({
  created_by: one(users, {
    fields: [info.created_by],
    references: [users.uuid],
  }),
}));

export default portfolio;
