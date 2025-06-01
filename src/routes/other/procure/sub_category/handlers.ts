import type { AppRouteHandler } from '@/lib/types';

import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { sub_category } from '@/routes/procure/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: sub_category.uuid,
    label: sub_category.name,
    min_amount: sub_category.min_amount,
    min_quotation: sub_category.min_quotation,
  })
    .from(sub_category);

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
