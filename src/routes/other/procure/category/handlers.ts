import type { AppRouteHandler } from '@/lib/types';

import { sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { category } from '@/routes/procure/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: category.uuid,
    label: sql`CONCAT( category.name, ' - ', category.index)`,
  })
    .from(category);

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
