import type { AppRouteHandler } from '@/lib/types';

import { eq, inArray, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { department, faculty } from '@/routes/portfolio/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const { access } = c.req.valid('query');

  let accessArray = [];
  if (access) {
    accessArray = access.split(',');
  }

  const resultPromise = db.select({
    value: department.uuid,
    label: sql`CONCAT( faculty.name, ' - ', department.name, ' - ', department.category)`,
    link: department.page_link,
  })
    .from(department)
    .leftJoin(faculty, eq(department.faculty_uuid, faculty.uuid));

  if (accessArray.length > 0) {
    resultPromise.where(inArray(department.short_name, accessArray));
  }

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
