import type { AppRouteHandler } from '@/lib/types';

import { desc } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { faculty } from '@/routes/portfolio/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: faculty.uuid,
    label: faculty.name,
  })
    .from(faculty)
    .orderBy(desc(faculty.name));

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
