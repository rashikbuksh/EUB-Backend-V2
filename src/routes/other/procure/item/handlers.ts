import type { AppRouteHandler } from '@/lib/types';

import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { item } from '@/routes/procure/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: item.uuid,
    label: item.name,
    quantity: item.quantity,
    vendor_price: item.vendor_price,
    unit: item.unit,
  })
    .from(item);

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
