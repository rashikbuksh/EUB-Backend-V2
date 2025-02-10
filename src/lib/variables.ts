import { asc, desc, like, or, sql } from 'drizzle-orm';
import { char, decimal, timestamp } from 'drizzle-orm/pg-core';

import type { ColumnProps } from './types';

export function defaultUUID(column = 'uuid') {
  return char(column, {
    length: 21,
  });
}

export const uuid_primary = defaultUUID().primaryKey();

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

export function PG_DECIMAL_TO_FLOAT(column: any) {
  return sql`coalesce(${sql.raw(column.name)}, 0)::float8`;
}

export function constructSelectAllQuery(
  baseQuery: any,
  params: any,
  defaultSortField = 'created_at',
  additionalSearchFields: string[] = [],
) {
  const { q, page, limit, sort, orderby } = params;

  // Get search fields from table
  const searchFields = Object.keys(baseQuery.config.table).filter(
    field =>
      field !== 'uuid'
      && field !== 'id'
      && field !== 'created_at'
      && field !== 'updated_at',
  );

  // Include additional search fields from joined tables
  const allSearchFields = [...searchFields, ...additionalSearchFields];

  // Apply search filter
  if (q) {
    const searchConditions = allSearchFields.map(field =>
      like(sql`${field}`, `%${q}%`),
    );
    baseQuery = baseQuery.where(or(...searchConditions));
  }

  // Apply sorting
  if (sort) {
    const order = orderby === 'asc' ? asc : desc;
    baseQuery = baseQuery.orderBy(
      order(baseQuery.config.table[Symbol.for('drizzle:Columns')][sort]),
    );
  }
  else {
    baseQuery = baseQuery.orderBy(
      desc(
        baseQuery.config.table[Symbol.for('drizzle:Columns')][
          defaultSortField
        ],
      ),
    ); // Default sorting
  }

  // Apply pagination
  if (page) {
    const limitValue = limit || 10; // Set your desired limit per page
    const offset = (page - 1) * limitValue;
    baseQuery = baseQuery.limit(limitValue).offset(offset);
  }

  return baseQuery;
}
