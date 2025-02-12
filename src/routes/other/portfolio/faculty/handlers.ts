import type { AppRouteHandler } from '@/lib/types';

import { desc, eq, sql } from 'drizzle-orm';
import * as HSCode from 'stoker/http-status-codes';

import db from '@/db';
import { club, department, faculty } from '@/routes/portfolio/schema';

import type { ValueLabelRoute } from './routes';

export const valueLabel: AppRouteHandler<ValueLabelRoute> = async (c: any) => {
  const { page } = c.req.valid('query');

  const resultPromise = db.select({
    value: faculty.uuid,
    label: faculty.name,
  })
    .from(faculty);

  if (page === 'clubs_and_society') {
    resultPromise
      .leftJoin(department, eq(department.faculty_uuid, faculty.uuid))
      .leftJoin(club, eq(club.department_uuid, department.uuid))
      .where(sql`${club.uuid} IS NOT NULL`);
  }

  resultPromise.orderBy(desc(faculty.name));

  const data = await resultPromise;

  return c.json(data, HSCode.OK);
};
