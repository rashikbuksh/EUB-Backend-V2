import type { AppRouteHandler } from '@/lib/types';

import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { volume } from '@/routes/journal/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: volume.uuid,
    label: volume.name,
  })
    .from(volume);

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
