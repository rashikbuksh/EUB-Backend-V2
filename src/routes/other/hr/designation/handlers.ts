import type { AppRouteHandler } from '@/lib/types';

import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { designation } from '@/routes/hr/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: designation.uuid,
    label: designation.name,
  })
    .from(designation);

  const data = await resultPromise;

  if (data) {
    return c.json({ data }, HSCode.OK);
  }
  else {
    return c.json({ data: [] }, HSCode.NO_CONTENT);
  }
};
