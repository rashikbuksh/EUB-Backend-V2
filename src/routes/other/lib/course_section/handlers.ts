import type { AppRouteHandler } from '@/lib/types';

import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { course_section } from '@/routes/lib/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: course_section.uuid,
    label: course_section.name,
  })
    .from(course_section);

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
