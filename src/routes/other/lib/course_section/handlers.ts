import type { AppRouteHandler } from '@/lib/types';

import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { course_section } from '@/routes/lib/schema';

import type { ValueLabelRoute } from './routes';

export const typeOptions = [
  {
    label: 'Evening',
    value: 'evening',
  },
  {
    label: 'Regular',
    value: 'regular',
  },
];

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const resultPromise = db.select({
    value: course_section.uuid,
    label: course_section.name,
    type: course_section.type,
  })
    .from(course_section);

  const data = await resultPromise;

  // Map type to its label from typeOptions
  const typeMap = Object.fromEntries(typeOptions.map(opt => [opt.value, opt.label]));
  const mappedData = data.map((item: any) => ({
    ...item,
    type: typeMap[item.type] || item.type,
  }));

  return c.json(mappedData, HSCode.OK);
};
