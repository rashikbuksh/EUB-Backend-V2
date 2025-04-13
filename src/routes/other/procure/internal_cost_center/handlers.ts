import type { AppRouteHandler } from '@/lib/types';

import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { internal_cost_center } from '@/routes/procure/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: internal_cost_center.uuid,
    label: internal_cost_center.name,
  })
    .from(internal_cost_center);

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
