import type { AppRouteHandler } from '@/lib/types';

import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { department } from '@/routes/hr/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: department.uuid,
    label: department.name,
  })
    .from(department);

  const data = await resultPromise;

  if (data) {
    return c.json({ data }, HSCode.OK);
  }
  else {
    return c.json({ data: [] }, HSCode.NO_CONTENT);
  }
};
