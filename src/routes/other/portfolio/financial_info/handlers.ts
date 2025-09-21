import type { AppRouteHandler } from '@/lib/types';

import { eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { department, financial_info } from '@/routes/portfolio/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  // const { access } = c.req.valid('query');

  // let accessArray = [];
  // if (access) {
  //   accessArray = access.split(',');
  // }

  const resultPromise = db.select({
    value: financial_info.uuid,
    label: sql`CONCAT(${department.name}, '-', ${department.category}, CASE WHEN ${financial_info.table_name} = 'engineering_diploma' THEN '(dip)' ELSE '' END)`,
  })
    .from(financial_info)
    .leftJoin(department, eq(financial_info.department_uuid, department.uuid));

  // if (accessArray.length > 0) {
  //   resultPromise.where(inArray(department.short_name, accessArray));
  // }

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
