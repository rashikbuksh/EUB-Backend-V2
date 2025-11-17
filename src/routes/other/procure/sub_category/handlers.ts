import type { AppRouteHandler } from '@/lib/types';

import { sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import { sub_category } from '@/routes/procure/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: sub_category.uuid,
    label: sql`${sub_category.name} || ' (' || ${PG_DECIMAL_TO_FLOAT(sub_category.min_amount)} || ')'`,
    min_amount: PG_DECIMAL_TO_FLOAT(sub_category.min_amount),
    min_quotation: PG_DECIMAL_TO_FLOAT(sub_category.min_quotation),
  })
    .from(sub_category);

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
