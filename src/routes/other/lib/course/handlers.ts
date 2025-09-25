import type { AppRouteHandler } from '@/lib/types';

import { asc, eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { course } from '@/routes/lib/schema';
import { department, financial_info } from '@/routes/portfolio/schema';

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
    label: sql`COALESCE(${course.code}, '') || ' - ' || COALESCE(${course.name}, '') || ' (' || COALESCE(${department.name}, '') || '-' || COALESCE(${department.category}::text, '') || (CASE WHEN ${financial_info.table_name} = 'engineering_diploma' THEN ' (dip)' ELSE '' END) || ')' || ' - ' || COALESCE(${course.credit}::float8, 0) || ' Cr.' || ' - ' || COALESCE(${course.course_type}::text, '')`,
    // shift_type: course.shift_type,
    financial_info_uuid: course.financial_info_uuid,
  })
    .from(course)
    .leftJoin(financial_info, eq(course.financial_info_uuid, financial_info.uuid))
    .leftJoin(department, eq(financial_info.department_uuid, department.uuid))
    .orderBy(asc(course.code));

  const data = await resultPromise;

  // Map shift_type to its label from shiftTypeOptions
  // const shiftTypeMap = Object.fromEntries(shiftTypeOptions.map(opt => [opt.value, opt.label]));
  const mappedData = data.map((item: any) => ({
    ...item,
    // shift_type: shiftTypeMap[item.shift_type] || item.shift_type,
  }));

  return c.json(mappedData, HSCode.OK);
};
