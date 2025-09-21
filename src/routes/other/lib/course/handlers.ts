import type { AppRouteHandler } from '@/lib/types';

import { sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { course } from '@/routes/lib/schema';

import type { ValueLabelRoute } from './routes';

export const shiftTypeOptions = [
  {
    label: 'Evening',
    value: 'evening',
  },
  {
    label: 'Regular',
    value: 'regular',
  },
  {
    label: 'Regular & Evening',
    value: 'regular_and_evening',
  },
];

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: course.uuid,
    label: sql`${course.code} || ' - ' || ${course.name}`,
    shift_type: course.shift_type,
    financial_info_uuid: course.financial_info_uuid,
  })
    .from(course);

  const data = await resultPromise;

  // Map shift_type to its label from shiftTypeOptions
  const shiftTypeMap = Object.fromEntries(shiftTypeOptions.map(opt => [opt.value, opt.label]));
  const mappedData = data.map((item: any) => ({
    ...item,
    shift_type: shiftTypeMap[item.shift_type] || item.shift_type,
  }));

  return c.json(mappedData, HSCode.OK);
};
