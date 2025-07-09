import type { AppRouteHandler } from '@/lib/types';

import { eq } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { item } from '@/routes/procure/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const { store_type } = c.req.valid('query');
  const resultPromise = db.select({
    value: item.uuid,
    label: item.name,
    quantity: item.quantity,
    vendor_price: item.vendor_price,
    unit: item.unit,
    store: item.store,
  })
    .from(item);

  if (store_type) {
    resultPromise.where(eq(item.store, store_type));
  }

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
