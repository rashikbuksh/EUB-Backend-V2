import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import { item, item_work_order_entry } from '@/routes/procure/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: item_work_order_entry.uuid,
    label: item.name,
    request_quantity: PG_DECIMAL_TO_FLOAT(item_work_order_entry.request_quantity),
    unit: item.unit,
  })
    .from(item_work_order_entry)
    .leftJoin(item, eq(item_work_order_entry.item_uuid, item.uuid));

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
