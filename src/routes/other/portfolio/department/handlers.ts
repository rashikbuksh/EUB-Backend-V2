import type { AppRouteHandler } from '@/lib/types';

import { sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { department } from '@/routes/portfolio/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: department.uuid,
    label: sql`CONCAT(department.name, ' - ', department.category)`,
  })
    .from(department);

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
