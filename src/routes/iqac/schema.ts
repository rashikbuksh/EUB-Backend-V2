import { sql } from 'drizzle-orm';
import { integer, pgSchema, text } from 'drizzle-orm/pg-core';

import { DateTime, defaultUUID, uuid_primary } from '@/lib/variables';
import { DEFAULT_OPERATION, DEFAULT_SEQUENCE } from '@/utils/db';

import { users } from '../hr/schema';

const iqac = pgSchema('iqac');

//* Info
export const info_page_name = iqac.enum('info_page_name', [
  'sustainability',
  'manuals',
  'ugc_obe_template',
  'workshop',
  'symposium',
]);

export const info_id = iqac.sequence('info_id', DEFAULT_SEQUENCE);

export const info = iqac.table('info', {
  id: integer('id').default(sql`nextval('iqac.info_id')`),
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

export default iqac;
