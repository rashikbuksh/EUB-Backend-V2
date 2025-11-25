import { sql } from 'drizzle-orm';
import { boolean, integer, pgSchema, text } from 'drizzle-orm/pg-core';

import { DateTime, defaultUUID, uuid_primary } from '@/lib/variables';
import { DEFAULT_OPERATION } from '@/utils/db';

import { users } from '../hr/schema';
import { teachers } from '../portfolio/schema';

const journal = pgSchema('journal');

//* journal *//

export const boardsTypeEnum = journal.enum('boards_type_enum', [
  'journal_committee',
  'editorial_board',
]);

export const boards = journal.table('boards', {
  uuid: uuid_primary,
  teachers_uuid: defaultUUID('teachers_uuid').references(
    () => teachers.uuid,
    DEFAULT_OPERATION,
  ),
  is_chief: boolean('is_chief').notNull().default(false),
  type: boardsTypeEnum('type').notNull(),

  description: text('description'),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_by: defaultUUID('updated_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  updated_at: DateTime('updated_at').default(sql`null`),
  remarks: text('remarks').default(sql`null`),
});

export const volume = journal.table('volume', {
  uuid: uuid_primary,
  index: integer('index').notNull(),
  volume_number: integer('volume_number').notNull(),
  no: integer('no').notNull(),
  name: text('name').notNull(),
  published_date: DateTime('published_date').notNull(),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_by: defaultUUID('updated_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  updated_at: DateTime('updated_at').default(sql`null`),
  remarks: text('remarks').default(sql`null`),
});

export const scope = journal.table('scope', {
  uuid: uuid_primary,
  index: integer('index').notNull(),
  name: text('name').notNull(),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_by: defaultUUID('updated_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  updated_at: DateTime('updated_at').default(sql`null`),
  remarks: text('remarks').default(sql`null`),
});

export const articles = journal.table('articles', {
  uuid: uuid_primary,
  volume_uuid: defaultUUID('volume_uuid').references(
    () => volume.uuid,
    DEFAULT_OPERATION,
  ),
  title: text('title').notNull(),
  abstract: text('abstract').notNull(),
  reference: text('reference').notNull(),
  conclusion: text('conclusion').notNull(),
  file: text('file').default(sql`null`),
  published_date: DateTime('published_date').notNull(),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_by: defaultUUID('updated_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  updated_at: DateTime('updated_at').default(sql`null`),
  remarks: text('remarks').default(sql`null`),
});

export const keywords = journal.table('keywords', {
  uuid: uuid_primary,
  name: text('name').notNull(),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_by: defaultUUID('updated_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  updated_at: DateTime('updated_at').default(sql`null`),
  remarks: text('remarks').default(sql`null`),
});

export const authors = journal.table('authors', {
  uuid: uuid_primary,
  name: text('name').notNull(),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_by: defaultUUID('updated_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  updated_at: DateTime('updated_at').default(sql`null`),
  remarks: text('remarks').default(sql`null`),
});

export const article_keywords = journal.table('article_keywords', {
  uuid: uuid_primary,
  articles_uuid: defaultUUID('articles_uuid').references(
    () => articles.uuid,
    DEFAULT_OPERATION,
  ),
  keywords_uuid: defaultUUID('keywords_uuid').references(
    () => keywords.uuid,
    DEFAULT_OPERATION,
  ),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_by: defaultUUID('updated_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  updated_at: DateTime('updated_at').default(sql`null`),
  remarks: text('remarks').default(sql`null`),
});

export const article_authors = journal.table('article_authors', {
  uuid: uuid_primary,
  articles_uuid: defaultUUID('articles_uuid').references(
    () => articles.uuid,
    DEFAULT_OPERATION,
  ),
  authors_uuid: defaultUUID('authors_uuid').references(
    () => authors.uuid,
    DEFAULT_OPERATION,
  ),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_by: defaultUUID('updated_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  updated_at: DateTime('updated_at').default(sql`null`),
  remarks: text('remarks').default(sql`null`),
});

export const article_images = journal.table('article_images', {
  uuid: uuid_primary,
  index: integer('index').notNull(),
  articles_uuid: defaultUUID('articles_uuid').references(
    () => articles.uuid,
    DEFAULT_OPERATION,
  ),
  image: text('image').notNull(),
  created_by: defaultUUID('created_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  created_at: DateTime('created_at').notNull(),
  updated_by: defaultUUID('updated_by').references(
    () => users.uuid,
    DEFAULT_OPERATION,
  ),
  updated_at: DateTime('updated_at').default(sql`null`),
  remarks: text('remarks').default(sql`null`),
});

export default journal;
