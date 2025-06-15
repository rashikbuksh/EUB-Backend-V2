import type { AppRouteHandler } from '@/lib/types';

import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { qns_category } from '@/routes/fde/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: qns_category.uuid,
    label: qns_category.name,
  })
    .from(qns_category);

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
