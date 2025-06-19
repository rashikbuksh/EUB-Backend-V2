import type { AppRouteHandler } from '@/lib/types';

import { sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { bill } from '@/routes/procure/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: bill.uuid,
    label: sql`CONCAT('BI', TO_CHAR(${bill.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${bill.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${bill.id}, 'FM0000'))`,
  })
    .from(bill);

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
