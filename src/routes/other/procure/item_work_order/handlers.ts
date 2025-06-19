import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
// import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import { item_work_order, item_work_order_entry } from '@/routes/procure/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const { vendor_uuid, bill_uuid } = c.req.valid('query');
  const resultPromise = db.select({
    value: item_work_order.uuid,
    label: sql`CONCAT('IWOI', TO_CHAR(${item_work_order.created_at}::timestamp, 'YY'), '-',  TO_CHAR(${item_work_order.created_at}::timestamp, 'MM'), '-',  TO_CHAR(${item_work_order.id}, 'FM0000'))`,
    total_amount: sql`COALESCE((
          SELECT SUM(item_work_order_entry.provided_quantity::float8 * item_work_order_entry.unit_price::float8)
          FROM procure.item_work_order_entry
          WHERE item_work_order_entry.item_work_order_uuid = ${item_work_order.uuid}
        ), 0)`,
  })
    .from(item_work_order)
    .leftJoin(
      item_work_order_entry,
      eq(item_work_order.uuid, item_work_order_entry.item_work_order_uuid),
    );

  if (vendor_uuid) {
    resultPromise.where(eq(item_work_order.vendor_uuid, vendor_uuid));
  }
  if (bill_uuid) {
    resultPromise.where(eq(item_work_order.bill_uuid, bill_uuid));
  }

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
