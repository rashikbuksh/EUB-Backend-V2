import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
// import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import { item_work_order } from '@/routes/procure/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const { vendor_uuid } = c.req.valid('query');
  const resultPromise = db.select({
    value: item_work_order.uuid,
    label: sql`CONCAT('IWOI', TO_CHAR(${item_work_order.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${item_work_order.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${item_work_order.id}, 'FM0000'))`,
  })
    .from(item_work_order);

  if (vendor_uuid) {
    resultPromise.where(eq(item_work_order.vendor_uuid, vendor_uuid));
  }

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
