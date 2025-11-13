import type { AppRouteHandler } from '@/lib/types';

import { inArray, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { PG_DECIMAL_TO_FLOAT } from '@/lib/variables';
import { item } from '@/routes/procure/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const { store_type } = c.req.valid('query');
  const resultPromise = db.select({
    value: item.uuid,
    label: sql`${item.name} || ' (' || ${item.store} || ')'`,
    quantity: PG_DECIMAL_TO_FLOAT(item.quantity),
    vendor_price: PG_DECIMAL_TO_FLOAT(item.vendor_price),
    unit: item.unit,
    store: item.store,
  })
    .from(item);

  if (store_type) {
    const storeTypes = store_type.split(',');
    resultPromise.where(inArray(item.store, storeTypes));
  }

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
