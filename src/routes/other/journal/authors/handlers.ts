import type { AppRouteHandler } from '@/lib/types';

import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { authors } from '@/routes/journal/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: authors.uuid,
    label: authors.name,
  })
    .from(authors);

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
