import type { AppRouteHandler } from '@/lib/types';

import { eq, or, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import { item, item_work_order_entry } from '@/routes/procure/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const { item_work_order_uuid, is_item_work_order } = c.req.valid('query');
  const resultPromise = db.select({
    value: item_work_order_entry.item_uuid,
    label: item.name,
    request_quantity: PG_DECIMAL_TO_FLOAT(item_work_order_entry.request_quantity),
    unit: item.unit,
    item_work_order_entry_uuid: item_work_order_entry.uuid,
  })
    .from(item_work_order_entry)
    .leftJoin(item, eq(item_work_order_entry.item_uuid, item.uuid));

  if (item_work_order_uuid === 'null' && is_item_work_order !== 'true') {
    resultPromise.where(sql`${item_work_order_entry.item_work_order_uuid} IS NULL`);
  }
  else if (is_item_work_order === 'true' && item_work_order_uuid) {
    resultPromise.where(eq(item_work_order_entry.item_work_order_uuid, item_work_order_uuid));
  }
  else if (item_work_order_uuid && item_work_order_uuid !== 'null') {
    resultPromise.where(
      or(
        eq(item_work_order_entry.item_work_order_uuid, item_work_order_uuid),
        sql`${item_work_order_entry.item_work_order_uuid} IS NULL`,
      ),
    );
  }

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
