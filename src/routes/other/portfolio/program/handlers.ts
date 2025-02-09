import type { AppRouteHandler } from '@/lib/types';

import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { program } from '@/routes/portfolio/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: program.uuid,
    label: program.name,
  })
    .from(program);

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
