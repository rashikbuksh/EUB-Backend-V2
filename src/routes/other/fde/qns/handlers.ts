import type { AppRouteHandler } from '@/lib/types';

import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { qns } from '@/routes/fde/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: qns.uuid,
    label: qns.name,
  })
    .from(qns);

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
