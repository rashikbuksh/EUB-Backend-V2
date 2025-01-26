import { sql } from 'drizzle-orm';
import { char, decimal, timestamp } from 'drizzle-orm/pg-core';

export function defaultUUID(column = 'uuid') {
  return char(column, {
    length: 21,
  });
}

export const uuid_primary = defaultUUID().primaryKey();

interface ColumnProps {
  default: string;
  datetime: 'created_at' | 'updated_at';
}

export function DateTime(column: ColumnProps['datetime']) {
  return timestamp(column, {
    mode: 'string',
    withTimezone: false,
  });
}

export function PG_DECIMAL(column: ColumnProps['default']) {
  return decimal(column, {
    precision: 20,
    scale: 4,
  }).notNull();
}

export function decimalToNumber(column: ColumnProps['default']) {
  return sql`coalesce(${column},0)::float8`;
}
