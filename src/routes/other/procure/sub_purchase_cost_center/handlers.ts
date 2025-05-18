import type { AppRouteHandler } from '@/lib/types';

import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { sub_purchase_cost_center } from '@/routes/procure/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: sub_purchase_cost_center.uuid,
    label: sub_purchase_cost_center.name,
  })
    .from(sub_purchase_cost_center);

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
